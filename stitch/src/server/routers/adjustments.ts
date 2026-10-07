import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { adjustments, adjustmentLines, stockPerLocation, stockLedger } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ADJ-${ts}-${rnd}`;
}

export const adjustmentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft","waiting","ready","done","canceled"]).optional(),
      locationId: z.string().uuid().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.adjustments.findMany({
        where: (a, { and: an, eq }) => {
          const conds = [];
          if (input.status) conds.push(eq(a.status, input.status));
          if (input.locationId) conds.push(eq(a.locationId, input.locationId));
          return conds.length ? an(...conds) : undefined;
        },
        with: { lines: { with: { product: true } }, location: { with: { warehouse: true } } },
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        orderBy: (a, { desc }) => [desc(a.createdAt)],
      });
      return { items: rows, page: input.page, pageSize: input.pageSize };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adj = await ctx.db.query.adjustments.findFirst({
        where: eq(adjustments.id, input.id),
        with: { lines: { with: { product: true } }, location: { with: { warehouse: true } } },
      });
      if (!adj) throw new TRPCError({ code: "NOT_FOUND" });
      return adj;
    }),

  create: protectedProcedure
    .input(z.object({
      locationId: z.string().uuid(),
      notes: z.string().optional(),
      reason: z.string().optional(),
      lines: z.array(z.object({
        productId: z.string().uuid(),
        systemQuantity: z.number().min(0),
        countedQuantity: z.number().min(0),
        uom: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, ...rest } = input;
      const [adj] = await ctx.db.insert(adjustments).values({
        ...rest,
        reference: generateRef(),
        status: "draft",
        createdById: ctx.user!.id,
      }).returning();

      const linesWithDelta = lines.map(l => ({ ...l, adjustmentId: adj!.id, delta: l.countedQuantity - l.systemQuantity }));
      if (linesWithDelta.length) await ctx.db.insert(adjustmentLines).values(linesWithDelta);
      return adj;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["waiting","ready","canceled"]) }))
    .mutation(async ({ ctx, input }) => {
      const [a] = await ctx.db.update(adjustments).set({ status: input.status, updatedAt: new Date() }).where(eq(adjustments.id, input.id)).returning();
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      return a;
    }),

  /**
   * CRITICAL: validate() — syncs physical count delta to stock_per_location
   * 1. For each line: applies delta (counted - system) to stock_per_location
   * 2. Inserts ledger entry with delta (can be positive or negative)
   */
  validate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adj = await ctx.db.query.adjustments.findFirst({
        where: and(eq(adjustments.id, input.id), eq(adjustments.status, "ready")),
        with: { lines: true },
      });
      if (!adj) throw new TRPCError({ code: "BAD_REQUEST", message: "Adjustment must be in 'ready' status." });

      await ctx.db.update(adjustments).set({ status: "done", validatedAt: new Date(), validatedById: ctx.user!.id, updatedAt: new Date() }).where(eq(adjustments.id, input.id));

      for (const line of adj.lines) {
        if (line.delta === 0) continue;

        // Apply delta to stock_per_location
        await ctx.db.insert(stockPerLocation)
          .values({ productId: line.productId, locationId: adj.locationId, quantityOnHand: line.countedQuantity })
          .onConflictDoUpdate({
            target: [stockPerLocation.productId, stockPerLocation.locationId],
            set: { quantityOnHand: line.countedQuantity, updatedAt: new Date() },
          });

        // Ledger entry — delta can be negative
        await ctx.db.insert(stockLedger).values({
          productId: line.productId,
          locationId: adj.locationId,
          quantityDelta: line.delta,
          operationType: "adjustment",
          documentId: adj.id,
          documentReference: adj.reference,
          userId: ctx.user!.id,
          notes: adj.reason ?? adj.notes,
        });
      }

      return { success: true };
    }),

  addLine: protectedProcedure
    .input(z.object({
      adjustmentId: z.string().uuid(),
      productId: z.string().uuid(),
      systemQuantity: z.number().min(0),
      countedQuantity: z.number().min(0),
      uom: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { adjustmentId, productId, systemQuantity, countedQuantity, uom } = input;
      const delta = countedQuantity - systemQuantity;
      
      const [line] = await ctx.db.insert(adjustmentLines).values({
        adjustmentId,
        productId,
        systemQuantity,
        countedQuantity,
        delta,
        uom,
      }).returning();
      
      return line;
    }),

  removeLine: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db.delete(adjustmentLines).where(eq(adjustmentLines.id, input.id)).returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
      return deleted;
    }),
});
