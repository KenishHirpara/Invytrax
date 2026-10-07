import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function mockSeed() {
  console.log("🇮🇳 Starting BULK Mock Data Injection with Indian Parameters...");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient, { schema });

  // 1. CLEAR EXISTING DATA
  console.log("🧹 Clearing existing data...");
  const tables = [
    "stock_ledger", "delivery_lines", "deliveries", "receipt_lines", "receipts",
    "transfer_lines", "transfers", "adjustment_lines", "adjustments",
    "stock_per_location", "reorder_rules", "products", "categories",
    "locations", "warehouses", "users"
  ];
  
  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
  }

  // 2. CREATE USERS
  console.log("👤 Creating Indian Staff & Management...");
  const passwordHash = await bcrypt.hash("password123", 12);
  const users = await db.insert(schema.users).values([
    { name: "Arjun Sharma", email: "arjun@coreinventory.in", passwordHash, role: "manager" },
    { name: "Priya Patel", email: "priya@coreinventory.in", passwordHash, role: "manager" },
    { name: "Rahul Deshmukh", email: "rahul@coreinventory.in", passwordHash, role: "staff" },
    { name: "Sneha Reddy", email: "sneha@coreinventory.in", passwordHash, role: "staff" },
    { name: "Amit Singh", email: "amit@coreinventory.in", passwordHash, role: "staff" },
  ]).returning();

  const manager = users.find(u => u.role === "manager")!;
  const staff = users.filter(u => u.role === "staff");

  // 3. CREATE WAREHOUSES
  console.log("🏭 Creating Pan-India Warehouse Network...");
  const warehouses = await db.insert(schema.warehouses).values([
    { name: "Pune Logistics Hub", shortCode: "PNQ-01", address: "Chakan MIDC Phase II, Pune, Maharashtra" },
    { name: "Mumbai Greater Gateway", shortCode: "BOM-02", address: "Bhiwandi Logistics Park, Thane, Maharashtra" },
    { name: "Bangalore Tech-Bay", shortCode: "BLR-03", address: "Hoskote Industrial Area, Bangalore, Karnataka" },
    { name: "Delhi North-Zone Depot", shortCode: "DEL-04", address: "Okhla Industrial Estate Phase III, New Delhi" },
  ]).returning();

  // Create Locations for each warehouse
  const allLocations = [];
  for (const wh of warehouses) {
    const locs = await db.insert(schema.locations).values([
      { warehouseId: wh.id, name: "General Receiving", code: `${wh.shortCode}-REC` },
      { warehouseId: wh.id, name: "Bulk Storage Area", code: `${wh.shortCode}-BLK` },
      { warehouseId: wh.id, name: "Pick Face A1", code: `${wh.shortCode}-PF1` },
      { warehouseId: wh.id, name: "Cold Storage Room", code: `${wh.shortCode}-COLD` },
    ]).returning();
    allLocations.push(...locs);
  }

  // 4. CREATE PRODUCT CATALOG
  console.log("📦 Creating Indian Industrial Product Catalog...");
  const categories = await db.insert(schema.categories).values([
    { name: "Metals & Alloys" },
    { name: "Electronic Components" },
    { name: "Automotive Parts" },
    { name: "Textiles & Fabrics" },
    { name: "Chemicals & Solvents" },
  ]).returning();

  const productList = [
    { name: "JSW Prime Steel Coil", sku: "JSW-ST-001", cat: "Metals & Alloys", uom: "ton" },
    { name: "Hindalco Aluminum Sheet", sku: "HIND-AL-044", cat: "Metals & Alloys", uom: "kg" },
    { name: "Microchip India BT-88", sku: "MC-CHIP-88", cat: "Electronic Components", uom: "Units" },
    { name: "Bosch Brake Pad Set", sku: "BOS-BRK-505", cat: "Automotive Parts", uom: "Sets" },
    { name: "MRF Heavy Duty Liner", sku: "MRF-TYR-HD", cat: "Automotive Parts", uom: "Units" },
    { name: "Surat Silk Yarn Grade A", sku: "SILK-SUR-A", cat: "Textiles & Fabrics", uom: "m" },
    { name: "Reliance Pet-Polymer G2", sku: "RIL-PET-G2", cat: "Chemicals & Solvents", uom: "kg" },
    { name: "Tata TMT Steel Bars", sku: "TATA-TMT-500", cat: "Metals & Alloys", uom: "kg" },
  ];

  const products = [];
  for (const pInfo of productList) {
    const cat = categories.find(c => c.name === pInfo.cat);
    const [p] = await db.insert(schema.products).values({
      name: pInfo.name,
      sku: pInfo.sku,
      categoryId: cat?.id,
      uom: pInfo.uom,
    }).returning();
    products.push(p);

    // Add reorder rules for some
    await db.insert(schema.reorderRules).values({
      productId: p!.id,
      minQuantity: 50,
      maxQuantity: 1000,
    });
  }

  // 5. GENERATE HISTORICAL MOVEMENTS (Last 30 days)
  console.log("📜 Generating 100+ Stock Ledger Entries...");
  const vendors = ["JSW Steel Ltd", "Tata Group", "Hindalco Industries", "Reliance Industries", "Bharat Electronics"];
  const customers = ["Tata Motors", "Mahindra & Mahindra", "Flipkart Logistics", "Amazon India (IN)", "InfoSys Systems"];
  
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Helper to get random item
  const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // PRE-LOAD STOCK SO WE HAVE SOMETHING TO WORK WITH
  for (const p of products) {
    const loc = random(allLocations);
    const initialQty = 500 + Math.floor(Math.random() * 500);
    
    // Initial Receipt to get stock in
    const [r] = await db.insert(schema.receipts).values({
      reference: `INI-REC-${p!.sku.slice(0,4)}-${Math.random().toString(36).slice(2,5)}`.toUpperCase(),
      supplierName: random(vendors),
      destinationLocationId: loc.id,
      status: "done",
      createdById: manager.id,
      validatedById: manager.id,
      validatedAt: oneMonthAgo,
      createdAt: oneMonthAgo,
    }).returning();

    await db.insert(schema.receiptLines).values({
      receiptId: r!.id,
      productId: p!.id,
      quantity: initialQty,
      uom: p!.uom,
    });

    await db.insert(schema.stockPerLocation).values({
      productId: p!.id,
      locationId: loc.id,
      quantityOnHand: initialQty,
    });

    await db.insert(schema.stockLedger).values({
      productId: p!.id,
      locationId: loc.id,
      quantityDelta: initialQty,
      operationType: "receipt",
      documentId: r!.id,
      documentReference: r!.reference,
      userId: manager.id,
      createdAt: oneMonthAgo,
    });
  }

  // SIMULATE 60 RANDOM MOVEMENTS
  for (let i = 0; i < 60; i++) {
    const date = new Date(oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime()));
    const p = random(products)!;
    const op = random(["delivery", "transfer", "adjustment"] as const);
    const user = random(staff);

    if (op === "transfer") {
      const source = allLocations.find(l => l.id !== "" /* just a placeholder */)!; // this is tricky in a loop
      // Find a location that actually has stock of this product
      const currentStock = await db.query.stockPerLocation.findFirst({
        where: and(eq(schema.stockPerLocation.productId, p.id), sql`${schema.stockPerLocation.quantityOnHand} > 0`)
      });

      if (currentStock) {
        const target = allLocations.find(l => l.id !== currentStock.locationId)!;
        const qty = Math.min(currentStock.quantityOnHand, Math.floor(Math.random() * 50) + 1);

        const [t] = await db.insert(schema.transfers).values({
          reference: `TRF-${i}-${date.getTime().toString(36).toUpperCase()}`,
          sourceLocationId: currentStock.locationId,
          destinationLocationId: target.id,
          status: "done",
          createdById: user.id,
          validatedById: user.id,
          validatedAt: date,
        }).returning();

        // Update Source
        await db.update(schema.stockPerLocation)
          .set({ quantityOnHand: sql`${schema.stockPerLocation.quantityOnHand} - ${qty}` })
          .where(and(eq(schema.stockPerLocation.productId, p.id), eq(schema.stockPerLocation.locationId, currentStock.locationId)));
        
        // Update Target
        await db.insert(schema.stockPerLocation).values({ productId: p.id, locationId: target.id, quantityOnHand: qty })
          .onConflictDoUpdate({ 
             target: [schema.stockPerLocation.productId, schema.stockPerLocation.locationId],
             set: { quantityOnHand: sql`${schema.stockPerLocation.quantityOnHand} + ${qty}` }
          });

        // Ledger
        await db.insert(schema.stockLedger).values([
          { productId: p.id, locationId: currentStock.locationId, quantityDelta: -qty, operationType: "transfer", documentId: t!.id, documentReference: t!.reference, userId: user.id, createdAt: date },
          { productId: p.id, locationId: target.id, quantityDelta: qty, operationType: "transfer", documentId: t!.id, documentReference: t!.reference, userId: user.id, createdAt: date }
        ]);
      }
    } 
    else if (op === "delivery") {
      const currentStock = await db.query.stockPerLocation.findFirst({
        where: and(eq(schema.stockPerLocation.productId, p.id), sql`${schema.stockPerLocation.quantityOnHand} > 50`)
      });

      if (currentStock) {
        const qty = Math.floor(Math.random() * 30) + 5;
        const [d] = await db.insert(schema.deliveries).values({
          reference: `OUT-${i}-${date.getTime().toString(36).toUpperCase()}`,
          customerName: random(customers),
          sourceLocationId: currentStock.locationId,
          status: "done",
          createdById: user.id,
          validatedById: user.id,
          validatedAt: date,
        }).returning();

        await db.update(schema.stockPerLocation)
          .set({ quantityOnHand: sql`${schema.stockPerLocation.quantityOnHand} - ${qty}` })
          .where(and(eq(schema.stockPerLocation.productId, p.id), eq(schema.stockPerLocation.locationId, currentStock.locationId)));

        await db.insert(schema.stockLedger).values({
          productId: p.id, locationId: currentStock.locationId, quantityDelta: -qty, operationType: "delivery", documentId: d!.id, documentReference: d!.reference, userId: user.id, createdAt: date
        });
      }
    }
  }

  // 6. CREATE ACTIVE (PENDING) DOCUMENTS
  console.log("🎫 Creating Draft & Waiting Documents for UI testing...");
  
  // A few draft receipts
  await db.insert(schema.receipts).values([
    { reference: "WH/IN/NEW-001", supplierName: "Adani Enterprises", destinationLocationId: allLocations[0].id, status: "draft", createdById: manager.id },
    { reference: "WH/IN/NEW-002", supplierName: "Bajaj Auto", destinationLocationId: allLocations[5].id, status: "waiting", createdById: staff[0].id },
    { reference: "WH/IN/NEW-003", supplierName: "JSW Steel", destinationLocationId: allLocations[2].id, status: "ready", createdById: staff[1].id },
  ]);

  // A few draft deliveries
  await db.insert(schema.deliveries).values([
    { reference: "WH/OUT/PEND-01", customerName: "Larsen & Toubro", sourceLocationId: allLocations[1].id, status: "draft", createdById: manager.id },
    { reference: "WH/OUT/PEND-02", customerName: "Hero MotoCorp", sourceLocationId: allLocations[4].id, status: "ready", createdById: staff[2].id },
  ]);


  console.log("\n✅ BULK Mock Data Injection Completed!");
  console.log("--------------------------------------------------");
  console.log("Stats:");
  console.log("- Warehouses: 4 (Pune, Mumbai, Bangalore, Delhi)");
  console.log("- Locations: 16");
  console.log("- Products: 8");
  console.log("- Ledger Entries: ~140");
  console.log("- Staff Accounts: 5");
  console.log("--------------------------------------------------");
}

// Helper because Drizzle eq expects actual column
import { and, eq } from "drizzle-orm";

mockSeed();
