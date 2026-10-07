import { z } from "zod";
import { createTRPCRouter, protectedProcedure, managerProcedure } from "@/server/trpc";
import { products, categories, stockPerLocation, reorderRules, locations } from "@/db/schema";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const productsRouter = createTRPCRouter({
  /** List all products with optional search + category filter */
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { search, categoryId, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (search) conditions.push(or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`)));
      if (categoryId) conditions.push(eq(products.categoryId, categoryId));
      conditions.push(eq(products.isActive, true));

      const rows = await ctx.db.query.products.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        with: { category: true, stockPerLocation: { with: { location: { with: { warehouse: true } } } }, reorderRules: true },
        limit: pageSize,
        offset,
        orderBy: (p, { asc }) => [asc(p.name)],
      });

      const total = await ctx.db.select({ count: sql<number>`count(*)` }).from(products)
        .where(conditions.length ? and(...conditions) : undefined);

      return { items: rows, total: Number(total[0]?.count ?? 0), page, pageSize };
    }),

  /** Get single product by ID */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: { category: true, stockPerLocation: { with: { location: { with: { warehouse: true } } } }, reorderRules: true },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  /** Create product (manager only) */
  create: managerProcedure
    .input(z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      categoryId: z.string().uuid().optional(),
      uom: z.string().default("Units"),
      initialStock: z.number().min(0).optional(),
      locationId: z.string().uuid().optional(),
      minQuantity: z.number().min(0).optional(),
      maxQuantity: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db.insert(products).values({
        name: input.name,
        sku: input.sku,
        categoryId: input.categoryId || null,
        uom: input.uom,
      }).returning();

      if (input.initialStock && input.locationId) {
        await ctx.db.insert(stockPerLocation).values({
          productId: product!.id,
          locationId: input.locationId,
          quantityOnHand: input.initialStock,
        });
      }

      if (input.minQuantity !== undefined && input.maxQuantity !== undefined) {
        await ctx.db.insert(reorderRules).values({
          productId: product!.id,
          minQuantity: input.minQuantity,
          maxQuantity: input.maxQuantity,
        });
      }

      return product;
    }),

  /** Update product (manager only) */
  update: managerProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      categoryId: z.string().uuid().optional(),
      uom: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),
});
