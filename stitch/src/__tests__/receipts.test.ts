import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/db';
import { receipts, receiptLines, stockPerLocation, stockLedger, products, warehouses, locations, users, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { appRouter } from '@/server/root';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = { db, session: { user: { id: "test-admin", role: "manager" } } } as any;
const caller = appRouter.createCaller(ctx);

describe('Stock Transactions', () => {
  let warehouseId: string;
  let locationId: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Create User (passwordHash is required by schema)
    await db.insert(users).values({ id: "test-admin", name: "Test Admin", email: "test-admin@test.com", passwordHash: "dummy-hash", role: "manager" }).onConflictDoNothing();

    // 2. Create Warehouse + Location
    const [w] = await db.insert(warehouses).values({ name: "Test Warehouse", shortCode: "TST" }).returning();
    warehouseId = w.id;
    const [l] = await db.insert(locations).values({ name: "Stock", warehouseId }).returning();
    locationId = l.id;

    // 3. Create Product
    const [c] = await db.insert(categories).values({ name: "Test Category" }).returning();
    const [p] = await db.insert(products).values({ name: "Test Product", sku: "TEST-01", categoryId: c.id }).returning();
    productId = p.id;
  });

  it('validating a receipt increments stock and creates an immutable ledger entry', async () => {
    // 1. Create a draft receipt directly via DB
    const [r] = await db.insert(receipts).values({
      reference: "REC-TEST-001",
      destinationLocationId: locationId,
      status: "draft",
      createdById: "test-admin"
    }).returning();

    await db.insert(receiptLines).values({
      receiptId: r.id,
      productId,
      quantity: 50,
    });

    const receiptId = r.id;

    // 2. Initial stock check
    const initialStock = await db.query.stockPerLocation.findFirst({
      where: (s, { and, eq }) => and(eq(s.productId, productId), eq(s.locationId, locationId))
    });
    expect(initialStock?.quantityOnHand || 0).toBe(0);

    // 3. Validate receipt via tRPC
    await caller.receipts.validate({ id: receiptId });

    // 4. Check stock updated
    const finalStock = await db.query.stockPerLocation.findFirst({
      where: (s, { and, eq }) => and(eq(s.productId, productId), eq(s.locationId, locationId))
    });
    expect(finalStock?.quantityOnHand).toBe(50);

    // 5. Check ledger entry was created
    const ledgerEntries = await db.query.stockLedger.findMany({
      where: eq(stockLedger.documentId, receiptId)
    });
    
    expect(ledgerEntries).toHaveLength(1);
    expect(ledgerEntries[0].quantityDelta).toBe(50);
    expect(ledgerEntries[0].locationId).toBe(locationId);
    expect(ledgerEntries[0].operationType).toBe("receipt");
  });
});
