import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { transfers, transferLines, stockPerLocation, stockLedger } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `TRF-${ts}-${rnd}`;
}

export const transfersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft","waiting","ready","done","canceled"]).optional(),
      locationId: z.string().uuid().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.transfers.findMany({
        where: (t, { and: a, or: o, eq: e }) => {
          const conds = [];
          if (input.status) conds.push(e(t.status, input.status));
          if (input.locationId) conds.push(o(e(t.sourceLocationId, input.locationId), e(t.destinationLocationId, input.locationId)));
          return conds.length ? a(...conds) : undefined;
        },
        with: { lines: { with: { product: true } }, sourceLocation: { with: { warehouse: true } }, destinationLocation: { with: { warehouse: true } } },
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });
      return { items: rows, page: input.page, pageSize: input.pageSize };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const tr = await ctx.db.query.transfers.findFirst({
        where: eq(transfers.id, input.id),
        with: { lines: { with: { product: true } }, sourceLocation: true, destinationLocation: true },
      });
      if (!tr) throw new TRPCError({ code: "NOT_FOUND" });
      return tr;
    }),

  create: protectedProcedure
    .input(z.object({
      sourceLocationId: z.string().uuid(),
      destinationLocationId: z.string().uuid(),
      scheduledDate: z.string().optional(),
      notes: z.string().optional(),
      lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), uom: z.string().optional() })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.sourceLocationId === input.destinationLocationId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Source and destination locations must differ." });
      }
      const { lines, scheduledDate, ...rest } = input;
      const values = {
        ...rest,
        reference: generateRef(),
        status: "draft" as const,
        createdById: ctx.user!.id,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      };
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values] === undefined) delete values[key as keyof typeof values];
      });

      const [transfer] = await ctx.db.insert(transfers).values(values).returning();
      if (lines.length) {
        await ctx.db.insert(transferLines).values(lines.map(l => ({ ...l, transferId: transfer!.id })));
      }
      return transfer;
    }),

  createDraft: protectedProcedure
    .input(z.object({
      reference: z.string().min(1),
      sourceLocationId: z.string().uuid(),
      destinationLocationId: z.string().uuid(),
      notes: z.string().optional(),
      lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), uom: z.string().optional() })).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.sourceLocationId === input.destinationLocationId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Source and destination locations must differ." });
      }
      const { lines, ...rest } = input;
      const values = { ...rest, status: "draft" as const, createdById: ctx.user!.id };
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values] === undefined) delete values[key as keyof typeof values];
      });

      const [transfer] = await ctx.db.insert(transfers).values(values).returning();
      if (lines.length) {
        await ctx.db.insert(transferLines).values(lines.map((l) => ({ ...l, transferId: transfer!.id })));
      }
      return transfer;
    }),

  /**
   * CRITICAL: validate() — moves stock between locations, total qty unchanged.
   * 1. Decrements source stock_per_location
   * 2. Increments destination stock_per_location
   * 3. Inserts TWO ledger entries: one negative (source), one positive (dest)
   */
  validate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const transfer = await ctx.db.query.transfers.findFirst({
        where: and(eq(transfers.id, input.id), eq(transfers.status, "ready")),
        with: { lines: true },
      });
      if (!transfer) throw new TRPCError({ code: "BAD_REQUEST", message: "Transfer must be in 'ready' status." });

      // Pre-flight check: ensure sufficient stock at the source location
      for (const line of (transfer.lines as { id: string; productId: string; quantity: number; transferId: string; uom: string | null; createdAt: Date; product: { name: string } }[])) {
        if (line.quantity <= 0) continue;

        const stock = await ctx.db.query.stockPerLocation.findFirst({
          where: and(eq(stockPerLocation.productId, line.productId), eq(stockPerLocation.locationId, transfer.sourceLocationId)),
        });

        const currentStock = stock?.quantityOnHand ?? 0;
        if (currentStock < line.quantity) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: `Insufficient stock for product '${line.product?.name ?? line.productId}' at source location. Available: ${currentStock}, Required: ${line.quantity}` 
          });
        }
      }

      await ctx.db.update(transfers).set({ status: "done", validatedAt: new Date(), validatedById: ctx.user!.id, updatedAt: new Date() }).where(eq(transfers.id, input.id));

      for (const line of (transfer.lines as { id: string; productId: string; quantity: number; transferId: string; uom: string | null; createdAt: Date }[])) {
        const { sourceLocationId, destinationLocationId } = transfer;

        // Decrement source
        await ctx.db.update(stockPerLocation)
          .set({ quantityOnHand: sql`${stockPerLocation.quantityOnHand} - ${line.quantity}`, updatedAt: new Date() })
          .where(and(eq(stockPerLocation.productId, line.productId), eq(stockPerLocation.locationId, sourceLocationId)));

        // Increment destination (upsert)
        await ctx.db.insert(stockPerLocation)
          .values({ productId: line.productId, locationId: destinationLocationId, quantityOnHand: line.quantity })
          .onConflictDoUpdate({
            target: [stockPerLocation.productId, stockPerLocation.locationId],
            set: { quantityOnHand: sql`${stockPerLocation.quantityOnHand} + ${line.quantity}`, updatedAt: new Date() },
          });

        // Ledger: source OUT
        await ctx.db.insert(stockLedger).values({ productId: line.productId, locationId: sourceLocationId, quantityDelta: -line.quantity, operationType: "transfer", documentId: transfer.id, documentReference: transfer.reference, userId: ctx.user!.id });
        // Ledger: dest IN
        await ctx.db.insert(stockLedger).values({ productId: line.productId, locationId: destinationLocationId, quantityDelta: line.quantity, operationType: "transfer", documentId: transfer.id, documentReference: transfer.reference, userId: ctx.user!.id });
      }

      return { success: true };
    }),
});
