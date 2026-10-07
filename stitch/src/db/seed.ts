import { db } from "@/db";
import {
  users,
  warehouses,
  locations,
  categories,
  products,
  stockPerLocation,
  reorderRules,
  userWarehouseAssignments,
} from "@/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding CoreInventory database...");

  // ── Categories ──────────────────────────────────────────────────────────────
  const [rawMats, electronics, packaging] = await db
    .insert(categories)
    .values([
      { name: "Raw Materials" },
      { name: "Electronics" },
      { name: "Packaging" },
    ])
    .returning();

  // ── Warehouses ───────────────────────────────────────────────────────────────
  const [mainWh, secondaryWh] = await db
    .insert(warehouses)
    .values([
      {
        name: "Main Warehouse",
        shortCode: "WH-MAIN",
        address: "123 Industrial Pkwy, North Valley, NY 10023",
      },
      {
        name: "Secondary Hub",
        shortCode: "WH-SEC",
        address: "8877 Ocean View Drive, San Francisco, CA 94105",
      },
    ])
    .returning();

  // ── Locations ────────────────────────────────────────────────────────────────
  const [mainStock, mainInput, secStock] = await db
    .insert(locations)
    .values([
      { warehouseId: mainWh.id, name: "WH/Stock", code: "WH-MAIN/STK" },
      { warehouseId: mainWh.id, name: "WH/Input", code: "WH-MAIN/IN" },
      { warehouseId: secondaryWh.id, name: "WH/Stock", code: "WH-SEC/STK" },
    ])
    .returning();

  // ── Users ────────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const [manager, staffUser] = await db
    .insert(users)
    .values([
      {
        name: "Alex Rivers",
        email: "manager@coreinventory.com",
        passwordHash,
        role: "manager",
      },
      {
        name: "Alex Morgan",
        email: "staff@coreinventory.com",
        passwordHash,
        role: "staff",
      },
    ])
    .returning();

  // Assign staff to main warehouse only
  await db.insert(userWarehouseAssignments).values({
    userId: staffUser.id,
    warehouseId: mainWh.id,
  });

  // ── Products ─────────────────────────────────────────────────────────────────
  const [steelBolt, lithiumBattery, cardboardBox, wirelessSensor] = await db
    .insert(products)
    .values([
      {
        name: "Steel Bolt M8",
        sku: "SB-001",
        categoryId: rawMats.id,
        uom: "Units",
      },
      {
        name: "Lithium Battery 18650",
        sku: "BAT-44",
        categoryId: electronics.id,
        uom: "Units",
      },
      {
        name: "Cardboard Box (Large)",
        sku: "PKG-02",
        categoryId: packaging.id,
        uom: "Dozen",
      },
      {
        name: "Wireless Sensor v3",
        sku: "WS-99",
        categoryId: electronics.id,
        uom: "Units",
      },
    ])
    .returning();

  // ── Stock per Location ────────────────────────────────────────────────────────
  await db.insert(stockPerLocation).values([
    {
      productId: steelBolt.id,
      locationId: mainStock.id,
      quantityOnHand: 1250,
    },
    {
      productId: lithiumBattery.id,
      locationId: mainStock.id,
      quantityOnHand: 45,
    },
    {
      productId: cardboardBox.id,
      locationId: mainStock.id,
      quantityOnHand: 300,
    },
    {
      productId: wirelessSensor.id,
      locationId: mainStock.id,
      quantityOnHand: 0,
    },
    {
      productId: steelBolt.id,
      locationId: secStock.id,
      quantityOnHand: 200,
    },
  ]);

  // ── Reorder Rules ─────────────────────────────────────────────────────────────
  await db.insert(reorderRules).values([
    { productId: steelBolt.id, minQuantity: 500, maxQuantity: 2000 },
    { productId: lithiumBattery.id, minQuantity: 100, maxQuantity: 500 },
    { productId: wirelessSensor.id, minQuantity: 20, maxQuantity: 200 },
  ]);

  console.log("✅ Seed complete.");
  console.log("   Manager: manager@coreinventory.com / password123");
  console.log("   Staff:   staff@coreinventory.com   / password123");
}

seed().catch(console.error);
