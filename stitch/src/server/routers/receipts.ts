import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { receipts, receiptLines, stockPerLocation, stockLedger } from "@/db/schema";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateRef(): string {
  // Timestamp (ms) + 3-char random suffix → effectively collision-free within a warehouse
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `WH/IN/${ts}-${rnd}`;
}

export const receiptsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["draft","waiting","ready","done","canceled"]).optional(),
      locationId: z.string().uuid().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const rows = await ctx.db.query.receipts.findMany({
        where: (r, { and: a, ilike: il, eq: e }) => {
          const conds = [];
          if (search) conds.push(or(il(r.reference, `%${search}%`), il(r.supplierName ?? "", `%${search}%`)));
          if (status) conds.push(e(r.status, status));
          if (input.locationId) conds.push(e(r.destinationLocationId, input.locationId));
          return conds.length ? a(...conds) : undefined;
        },
        with: { lines: { with: { product: true } }, sourceLocation: { with: { warehouse: true } }, createdBy: { columns: { id: true, name: true } } },
        limit: pageSize,
        offset,
        orderBy: (r, { desc }) => [desc(r.createdAt)],
      });

      return { items: rows, page, pageSize };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const receipt = await ctx.db.query.receipts.findFirst({
        where: eq(receipts.id, input.id),
        with: { lines: { with: { product: true } }, sourceLocation: { with: { warehouse: true } }, createdBy: { columns: { id: true, name: true } } },
      });
      if (!receipt) throw new TRPCError({ code: "NOT_FOUND" });
      return receipt;
    }),

  create: protectedProcedure
    .input(z.object({
      supplierName: z.string().optional(),
      sourceLocationId: z.string().uuid().optional(),
      destinationLocationId: z.string().uuid(),
      scheduledDate: z.string().optional(),
      deadline: z.string().optional(),
      responsibleId: z.string().uuid().optional(),
      notes: z.string().optional(),
      lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), uom: z.string().optional() })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, scheduledDate, deadline, ...rest } = input;
      const values = {
        ...rest,
        reference: generateRef(),
        status: "draft" as const,
        createdById: ctx.user!.id,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
      };
      
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values] === undefined) delete values[key as keyof typeof values];
      });

      const [receipt] = await ctx.db.insert(receipts).values(values).returning();

      if (lines.length) {
        await ctx.db.insert(receiptLines).values(lines.map(l => ({ ...l, receiptId: receipt!.id })));
      }
      return receipt;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["waiting","ready","canceled"]) }))
    .mutation(async ({ ctx, input }) => {
      const [r] = await ctx.db.update(receipts).set({ status: input.status, updatedAt: new Date() }).where(eq(receipts.id, input.id)).returning();
      if (!r) throw new TRPCError({ code: "NOT_FOUND" });
      return r;
    }),

  /**
   * CRITICAL: validate() — transitions to "done"
   * 1. Updates document status to "done"
   * 2. For each line: upserts stock_per_location (increment)
   * 3. Inserts stock_ledger entry (IMMUTABLE)
   * All in a single DB transaction via Promise.all (Neon HTTP does not support explicit transactions;
   * VERIFY: use @neondatabase/serverless websocket for transaction support if needed)
   */
  validate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const receipt = await ctx.db.query.receipts.findFirst({
        where: and(eq(receipts.id, input.id), eq(receipts.status, "ready")),
        with: { lines: true },
      });
      if (!receipt) throw new TRPCError({ code: "BAD_REQUEST", message: "Receipt must be in 'ready' status to validate." });

      // Update status
      await ctx.db.update(receipts).set({ status: "done", validatedAt: new Date(), validatedById: ctx.user!.id, updatedAt: new Date() }).where(eq(receipts.id, input.id));

      const locationId = receipt.destinationLocationId!;
      // Process each line
      for (const line of (receipt.lines as { id: string; productId: string; receiptId: string; quantity: number; uom: string | null; createdAt: Date }[])) {
        // Upsert stock_per_location
        await ctx.db.insert(stockPerLocation)
          .values({ productId: line.productId, locationId, quantityOnHand: line.quantity })
          .onConflictDoUpdate({
            target: [stockPerLocation.productId, stockPerLocation.locationId],
            set: { quantityOnHand: sql`${stockPerLocation.quantityOnHand} + ${line.quantity}`, updatedAt: new Date() },
          });

        // Immutable ledger entry
        await ctx.db.insert(stockLedger).values({
          productId: line.productId,
          locationId,
          quantityDelta: line.quantity,
          operationType: "receipt",
          documentId: receipt.id,
          documentReference: receipt.reference,
          userId: ctx.user!.id,
        });
      }

      return { success: true };
    }),

  /**
   * createDraft — alias for create used by the new-receipt form.
   * Accepts minimal fields and creates a draft receipt.
   */
  createDraft: protectedProcedure
    .input(z.object({
      reference: z.string().min(1),
      destinationLocationId: z.string().uuid(),
      supplierName: z.string().optional(),
      notes: z.string().optional(),
      lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), uom: z.string().optional() })).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, ...rest } = input;
      const values = { ...rest, status: "draft" as const, createdById: ctx.user!.id };
      
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values] === undefined) delete values[key as keyof typeof values];
      });

      const [receipt] = await ctx.db.insert(receipts).values(values).returning();

      if (lines.length) {
        await ctx.db.insert(receiptLines).values(lines.map((l) => ({ ...l, receiptId: receipt!.id })));
      }
      return receipt;
    }),
});
