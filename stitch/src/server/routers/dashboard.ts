import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { products, receipts, deliveries, stockPerLocation, reorderRules, stockLedger } from "@/db/schema";
import { eq, lt, lte, and, sql, count } from "drizzle-orm";

export const dashboardRouter = createTRPCRouter({
  /** Real-time KPI cards */
  kpis: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    // Total active products
    const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true));

    // Low stock: on-hand < reorder min
    const lowStockRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(stockPerLocation)
      .innerJoin(reorderRules, eq(stockPerLocation.productId, reorderRules.productId))
      .where(and(
        sql`${stockPerLocation.quantityOnHand} < ${reorderRules.minQuantity}`,
        sql`${stockPerLocation.quantityOnHand} > 0`
      ));

    // Out of stock: on-hand = 0
    const [outOfStock] = await db.select({ count: sql<number>`count(*)` }).from(stockPerLocation).where(eq(stockPerLocation.quantityOnHand, 0));

    // Pending receipts (status != done, != canceled)
    const [pendingReceipts] = await db.select({ count: sql<number>`count(*)` }).from(receipts).where(
      sql`${receipts.status} NOT IN ('done','canceled')`
    );

    // Pending deliveries
    const [pendingDeliveries] = await db.select({ count: sql<number>`count(*)` }).from(deliveries).where(
      sql`${deliveries.status} NOT IN ('done','canceled')`
    );

    // Receipt ops breakdown
    const [toReceive] = await db.select({ count: sql<number>`count(*)` }).from(receipts).where(eq(receipts.status, "waiting"));
    const [inInspection] = await db.select({ count: sql<number>`count(*)` }).from(receipts).where(eq(receipts.status, "ready"));
    const [completedReceipts] = await db.select({ count: sql<number>`count(*)` }).from(receipts).where(eq(receipts.status, "done"));

    // Delivery ops breakdown
    const [picking] = await db.select({ count: sql<number>`count(*)` }).from(deliveries).where(eq(deliveries.status, "waiting"));
    const [packing] = await db.select({ count: sql<number>`count(*)` }).from(deliveries).where(eq(deliveries.status, "ready"));
    const [dispatched] = await db.select({ count: sql<number>`count(*)` }).from(deliveries).where(eq(deliveries.status, "done"));

    return {
      totalProducts: Number(totalProducts?.count ?? 0),
      lowStock: Number(lowStockRows[0]?.count ?? 0),
      outOfStock: Number(outOfStock?.count ?? 0),
      pendingReceipts: Number(pendingReceipts?.count ?? 0),
      pendingDeliveries: Number(pendingDeliveries?.count ?? 0),
      receiptOps: {
        toReceive: Number(toReceive?.count ?? 0),
        inInspection: Number(inInspection?.count ?? 0),
        completed: Number(completedReceipts?.count ?? 0),
      },
      deliveryOps: {
        picking: Number(picking?.count ?? 0),
        packing: Number(packing?.count ?? 0),
        dispatched: Number(dispatched?.count ?? 0),
      },
    };
  }),

  /** Get detailed alerts for low stock items */
  alerts: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const alerts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        quantity: stockPerLocation.quantityOnHand,
        minQty: reorderRules.minQuantity,
        location: { name: sql<string>`"locations"."name"` }
      })
      .from(stockPerLocation)
      .innerJoin(reorderRules, eq(stockPerLocation.productId, reorderRules.productId))
      .innerJoin(products, eq(stockPerLocation.productId, products.id))
      .innerJoin(sql`"locations"`, eq(stockPerLocation.locationId, sql`"locations"."id"`))
      .where(and(
        sql`${stockPerLocation.quantityOnHand} < ${reorderRules.minQuantity}`,
        sql`${stockPerLocation.quantityOnHand} > 0`
      ))
      .limit(5);

    return alerts;
  }),
});
