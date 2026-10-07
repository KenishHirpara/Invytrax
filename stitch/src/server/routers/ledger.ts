import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { stockLedger, products, locations } from "@/db/schema";
import { eq, and, gte, lte, desc, ilike, or } from "drizzle-orm";

export const ledgerRouter = createTRPCRouter({
  /** Read-only audit ledger with full filters */
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      productId: z.string().uuid().optional(),
      fromLocationId: z.string().uuid().optional(),
      toLocationId: z.string().uuid().optional(),
      operationType: z.enum(["receipt","delivery","transfer","adjustment"]).optional(),
      userId: z.string().uuid().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, productId, operationType, userId, dateFrom, dateTo, fromLocationId } = input;
      const offset = (page - 1) * pageSize;

      const rows = await ctx.db.query.stockLedger.findMany({
        where: (l, { and: a, eq: e, gte: gt, lte: lt }) => {
          const conds = [];
          if (productId) conds.push(e(l.productId, productId));
          if (fromLocationId) conds.push(e(l.locationId, fromLocationId));
          if (operationType) conds.push(e(l.operationType, operationType));
          if (userId) conds.push(e(l.userId, userId));
          if (dateFrom) conds.push(gt(l.createdAt, new Date(dateFrom)));
          if (dateTo) conds.push(lt(l.createdAt, new Date(dateTo)));
          return conds.length ? a(...conds) : undefined;
        },
        with: {
          product: { columns: { id: true, name: true, sku: true, uom: true } },
          location: { columns: { id: true, name: true }, with: { warehouse: { columns: { id: true, name: true } } } },
          user: { columns: { id: true, name: true } },
        },
        limit: pageSize,
        offset,
        orderBy: (l, { desc }) => [desc(l.createdAt)],
      });

      return { items: rows, page, pageSize };
    }),
});
