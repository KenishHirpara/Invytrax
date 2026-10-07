/**
 * full-seed.ts  —  wipes the database and refills EVERY table with consistent data.
 *
 * Put this file in:  stitch/src/db/full-seed.ts
 * Run (from the stitch folder):
 *   npx tsx -r dotenv/config src/db/full-seed.ts dotenv_config_path=.env.local
 *
 * Dry run (no database needed, just prints the plan + final stock):
 *   set DRY_RUN=1            (Windows cmd)
 *   npx tsx src/db/full-seed.ts
 *
 * Logins afterwards (password for all: password123):
 *   manager@invytrax.com   (manager)
 *   staff@invytrax.com     (staff)
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const DRY = !!process.env.DRY_RUN;

// ─── helpers ─────────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();
/** date N days ago at a given hour */
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(NOW - n * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const chunk = <T,>(arr: T[], size = 100): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ─── static data ─────────────────────────────────────────────────────────────
const USERS = [
  { key: "mgr", name: "Kenish Hirpara", email: "manager@invytrax.com", role: "manager" as const },
  { key: "mgr2", name: "Priya Patel", email: "priya@invytrax.com", role: "manager" as const },
  { key: "st1", name: "Rahul Deshmukh", email: "staff@invytrax.com", role: "staff" as const },
  { key: "st2", name: "Sneha Reddy", email: "sneha@invytrax.com", role: "staff" as const },
  { key: "st3", name: "Amit Singh", email: "amit@invytrax.com", role: "staff" as const },
];

const WAREHOUSES = [
  { key: "pune", name: "Pune Logistics Hub", shortCode: "PNQ-01", address: "Chakan MIDC Phase II, Pune, Maharashtra" },
  { key: "mumbai", name: "Mumbai Gateway Warehouse", shortCode: "BOM-02", address: "Bhiwandi Logistics Park, Thane, Maharashtra" },
  { key: "delhi", name: "Delhi North-Zone Depot", shortCode: "DEL-03", address: "Okhla Industrial Estate Phase III, New Delhi" },
  { key: "ahm", name: "Ahmedabad Depot", shortCode: "AMD-04", address: "Sanand GIDC, Ahmedabad, Gujarat" },
];

// 3 locations per warehouse → key = `${wh}.${loc}`
const LOC_DEFS = [
  { k: "rec", name: "General Receiving", suffix: "REC" },
  { k: "stk", name: "Bulk Storage", suffix: "STK" },
  { k: "pf", name: "Pick Face A1", suffix: "PF1" },
];

const CATEGORIES = ["Raw Materials", "Electronics", "Packaging", "Automotive Parts", "Safety & Equipment"];

const PRODUCTS = [
  { key: "bolt", name: "Steel Bolt M8", sku: "SB-001", cat: "Raw Materials", uom: "Units", min: 500, max: 3000 },
  { key: "wire", name: "Copper Wire 2mm", sku: "RM-1002", cat: "Raw Materials", uom: "kg", min: 100, max: 800 },
  { key: "alu", name: "Aluminium Sheet 2mm", sku: "RM-1003", cat: "Raw Materials", uom: "Units", min: 80, max: 600 },
  { key: "bat", name: "Lithium Battery 18650", sku: "BAT-44", cat: "Electronics", uom: "Units", min: 100, max: 800 },
  { key: "sensor", name: "Wireless Sensor v3", sku: "WS-99", cat: "Electronics", uom: "Units", min: 40, max: 300 },
  { key: "led", name: "LED Panel 24W", sku: "EL-2001", cat: "Electronics", uom: "Units", min: 60, max: 500 },
  { key: "box", name: "Cardboard Box (Large)", sku: "PKG-02", cat: "Packaging", uom: "Dozen", min: 100, max: 1000 },
  { key: "wrap", name: "Bubble Wrap Roll", sku: "PK-3002", cat: "Packaging", uom: "Roll", min: 60, max: 500 },
  { key: "brake", name: "Brake Pad Set", sku: "AUTO-505", cat: "Automotive Parts", uom: "Sets", min: 50, max: 400 },
  { key: "gloves", name: "Safety Gloves", sku: "SF-4001", cat: "Safety & Equipment", uom: "Pairs", min: 200, max: 600 },
];

// ─── plan model ──────────────────────────────────────────────────────────────
type Status = "draft" | "waiting" | "ready" | "done" | "canceled";
type Line = { p: string; q: number };

interface Receipt { ref: string; supplier: string; dest: string; lines: Line[]; status: Status; day: number; by: string; notes?: string }
interface Transfer { ref: string; from: string; to: string; lines: Line[]; status: Status; day: number; by: string; notes?: string }
interface Delivery { ref: string; customer: string; address: string; from: string; lines: Line[]; status: Status; day: number; by: string; notes?: string }
interface Adjustment { ref: string; loc: string; reason: string; lines: { p: string; counted: number }[]; status: Status; day: number; by: string }

// Everything below is ordered by day (bigger day = older). Done ops are applied in
// chronological order so stock never goes negative.
const RECEIPTS: Receipt[] = [
  { ref: "WH/IN/0001", supplier: "JSW Steel Ltd", dest: "pune.rec", status: "done", day: 28, by: "mgr", lines: [{ p: "bolt", q: 2500 }, { p: "alu", q: 400 }] },
  { ref: "WH/IN/0002", supplier: "Havells Electricals", dest: "pune.rec", status: "done", day: 27, by: "st1", lines: [{ p: "bat", q: 600 }, { p: "led", q: 300 }, { p: "sensor", q: 150 }] },
  { ref: "WH/IN/0003", supplier: "Pack India Pvt Ltd", dest: "mumbai.rec", status: "done", day: 26, by: "st2", lines: [{ p: "box", q: 700 }, { p: "wrap", q: 350 }] },
  { ref: "WH/IN/0004", supplier: "Hindalco Industries", dest: "delhi.rec", status: "done", day: 25, by: "mgr", lines: [{ p: "alu", q: 350 }, { p: "wire", q: 500 }] },
  { ref: "WH/IN/0005", supplier: "Bosch India", dest: "ahm.rec", status: "done", day: 24, by: "st3", lines: [{ p: "brake", q: 300 }] },
  { ref: "WH/IN/0006", supplier: "Safex Industrial", dest: "mumbai.rec", status: "done", day: 22, by: "st1", lines: [{ p: "gloves", q: 450 }] },
  { ref: "WH/IN/0007", supplier: "Bharat Electronics", dest: "delhi.rec", status: "done", day: 20, by: "mgr2", lines: [{ p: "sensor", q: 100 }, { p: "bat", q: 200 }] },
  { ref: "WH/IN/0008", supplier: "Tata Steel Suppliers", dest: "ahm.rec", status: "done", day: 18, by: "st2", lines: [{ p: "bolt", q: 800 }, { p: "wire", q: 200 }] },
  { ref: "WH/IN/0009", supplier: "Gujarat Packaging Co", dest: "ahm.rec", status: "ready", day: 3, by: "st3", notes: "Truck arriving Friday", lines: [{ p: "box", q: 300 }] },
  { ref: "WH/IN/0010", supplier: "Adani Enterprises", dest: "pune.rec", status: "waiting", day: 2, by: "st1", lines: [{ p: "alu", q: 200 }, { p: "wire", q: 150 }] },
  { ref: "WH/IN/0011", supplier: "Local Traders", dest: "mumbai.rec", status: "draft", day: 1, by: "mgr", lines: [{ p: "wrap", q: 100 }] },
  { ref: "WH/IN/0012", supplier: "Bajaj Auto Parts", dest: "delhi.rec", status: "canceled", day: 15, by: "mgr2", notes: "Supplier cancelled order", lines: [{ p: "brake", q: 100 }] },
];

const TRANSFERS: Transfer[] = [
  { ref: "WH/INT/0001", from: "pune.rec", to: "pune.stk", status: "done", day: 25, by: "st1", lines: [{ p: "bolt", q: 2000 }, { p: "alu", q: 300 }] },
  { ref: "WH/INT/0002", from: "pune.rec", to: "pune.pf", status: "done", day: 24, by: "st1", lines: [{ p: "bat", q: 400 }, { p: "led", q: 200 }, { p: "sensor", q: 100 }] },
  { ref: "WH/INT/0003", from: "mumbai.rec", to: "mumbai.stk", status: "done", day: 23, by: "st2", lines: [{ p: "box", q: 500 }, { p: "wrap", q: 250 }] },
  { ref: "WH/INT/0004", from: "delhi.rec", to: "delhi.stk", status: "done", day: 22, by: "mgr", lines: [{ p: "alu", q: 250 }, { p: "wire", q: 400 }] },
  { ref: "WH/INT/0005", from: "pune.stk", to: "mumbai.stk", status: "done", day: 19, by: "mgr2", notes: "Rebalancing stock", lines: [{ p: "bolt", q: 700 }] },
  { ref: "WH/INT/0006", from: "ahm.rec", to: "ahm.stk", status: "done", day: 17, by: "st3", lines: [{ p: "brake", q: 250 }, { p: "bolt", q: 600 }] },
  { ref: "WH/INT/0007", from: "mumbai.rec", to: "mumbai.pf", status: "done", day: 15, by: "st2", lines: [{ p: "gloves", q: 300 }] },
  { ref: "WH/INT/0008", from: "pune.pf", to: "delhi.stk", status: "done", day: 12, by: "st1", lines: [{ p: "bat", q: 100 }, { p: "led", q: 80 }] },
  { ref: "WH/INT/0009", from: "delhi.stk", to: "delhi.pf", status: "ready", day: 2, by: "mgr", lines: [{ p: "wire", q: 100 }] },
  { ref: "WH/INT/0010", from: "ahm.stk", to: "ahm.pf", status: "draft", day: 1, by: "st3", lines: [{ p: "brake", q: 50 }] },
];

const DELIVERIES: Delivery[] = [
  { ref: "WH/OUT/0001", customer: "Tata Motors", address: "Pimpri, Pune, Maharashtra", from: "pune.stk", status: "done", day: 21, by: "st1", lines: [{ p: "bolt", q: 600 }, { p: "alu", q: 100 }] },
  { ref: "WH/OUT/0002", customer: "Reliance Retail", address: "Navi Mumbai, Maharashtra", from: "pune.pf", status: "done", day: 20, by: "st1", lines: [{ p: "led", q: 100 }, { p: "bat", q: 150 }] },
  { ref: "WH/OUT/0003", customer: "Amazon Fulfilment", address: "Bhiwandi, Maharashtra", from: "mumbai.stk", status: "done", day: 19, by: "st2", lines: [{ p: "box", q: 250 }, { p: "wrap", q: 120 }] },
  { ref: "WH/OUT/0004", customer: "Larsen & Toubro", address: "Powai, Mumbai", from: "mumbai.stk", status: "done", day: 16, by: "mgr", lines: [{ p: "bolt", q: 300 }] },
  { ref: "WH/OUT/0005", customer: "Hero MotoCorp", address: "Gurugram, Haryana", from: "ahm.stk", status: "done", day: 14, by: "st3", lines: [{ p: "brake", q: 120 }, { p: "bolt", q: 200 }] },
  { ref: "WH/OUT/0006", customer: "Mahindra & Mahindra", address: "Kandivali, Mumbai", from: "mumbai.pf", status: "done", day: 11, by: "mgr2", lines: [{ p: "gloves", q: 150 }] },
  { ref: "WH/OUT/0007", customer: "Flipkart Logistics", address: "Kolkata, West Bengal", from: "delhi.stk", status: "done", day: 9, by: "st2", lines: [{ p: "alu", q: 120 }, { p: "wire", q: 150 }] },
  { ref: "WH/OUT/0008", customer: "Infosys Facilities", address: "Electronic City, Bengaluru", from: "delhi.stk", status: "done", day: 6, by: "st1", lines: [{ p: "wire", q: 100 }] },
  { ref: "WH/OUT/0009", customer: "Adani Infra", address: "Ahmedabad, Gujarat", from: "ahm.stk", status: "ready", day: 2, by: "st3", lines: [{ p: "bolt", q: 100 }] },
  { ref: "WH/OUT/0010", customer: "Wipro Campus", address: "Hinjewadi, Pune", from: "pune.pf", status: "waiting", day: 2, by: "st1", lines: [{ p: "led", q: 50 }] },
  { ref: "WH/OUT/0011", customer: "Bajaj Electricals", address: "Worli, Mumbai", from: "mumbai.stk", status: "draft", day: 1, by: "mgr", lines: [{ p: "box", q: 50 }] },
  { ref: "WH/OUT/0013", customer: "TVS Motor Company", address: "Hosur, Tamil Nadu", from: "ahm.rec", status: "done", day: 3, by: "st3", lines: [{ p: "brake", q: 50 }] },
  { ref: "WH/OUT/0014", customer: "Maruti Suzuki", address: "Manesar, Haryana", from: "ahm.stk", status: "done", day: 3, by: "mgr", lines: [{ p: "brake", q: 100 }] },
  { ref: "WH/OUT/0015", customer: "Zomato Hyperpure", address: "Andheri, Mumbai", from: "mumbai.rec", status: "done", day: 3, by: "st2", lines: [{ p: "gloves", q: 140 }] },
  { ref: "WH/OUT/0012", customer: "Test Customer", address: "—", from: "pune.stk", status: "canceled", day: 8, by: "mgr2", notes: "Customer cancelled", lines: [{ p: "bolt", q: 10 }] },
];

// Adjustments set the counted quantity at a location; delta = counted - system at that moment.
const ADJUSTMENTS: Adjustment[] = [
  { ref: "WH/ADJ/0001", loc: "mumbai.stk", reason: "Water damage in monsoon", status: "done", day: 10, by: "st2", lines: [{ p: "wrap", counted: 100 }] },
  { ref: "WH/ADJ/0002", loc: "delhi.stk", reason: "Cycle count correction", status: "done", day: 8, by: "mgr", lines: [{ p: "alu", counted: 475 }] },
  { ref: "WH/ADJ/0003", loc: "pune.stk", reason: "Damaged bolts written off", status: "done", day: 7, by: "st1", lines: [{ p: "bolt", counted: 570 }] },
  { ref: "WH/ADJ/0004", loc: "ahm.stk", reason: "Found extra stock during audit", status: "done", day: 5, by: "st3", lines: [{ p: "brake", counted: 100 }] },
  { ref: "WH/ADJ/0005", loc: "pune.pf", reason: "Failed quality check", status: "done", day: 4, by: "mgr2", lines: [{ p: "sensor", counted: 20 }] },
  { ref: "WH/ADJ/0006", loc: "mumbai.pf", reason: "Monthly count (pending approval)", status: "draft", day: 1, by: "mgr", lines: [{ p: "gloves", counted: 140 }] },
];

// ─── build the simulated history ─────────────────────────────────────────────
interface LedgerRow {
  p: string; loc: string; delta: number;
  type: "receipt" | "delivery" | "transfer" | "adjustment";
  docRef: string; user: string; at: Date; notes?: string;
}
interface Event { day: number; order: number; apply: () => void }

function buildPlan() {
  const stock = new Map<string, number>(); // `${product}|${loc}` → qty
  const get = (p: string, l: string) => stock.get(`${p}|${l}`) ?? 0;
  const add = (p: string, l: string, q: number) => stock.set(`${p}|${l}`, get(p, l) + q);

  const ledger: LedgerRow[] = [];
  const adjSystemQty = new Map<string, number>(); // `${ref}|${product}` → system qty at validation time
  const events: Event[] = [];
  let order = 0;

  for (const r of RECEIPTS) {
    if (r.status !== "done") continue;
    events.push({ day: r.day, order: order++, apply: () => {
      r.lines.forEach((l, i) => {
        add(l.p, r.dest, l.q);
        ledger.push({ p: l.p, loc: r.dest, delta: l.q, type: "receipt", docRef: r.ref, user: r.by, at: daysAgo(r.day, 9 + i) });
      });
    }});
  }
  for (const t of TRANSFERS) {
    if (t.status !== "done") continue;
    events.push({ day: t.day, order: order++, apply: () => {
      t.lines.forEach((l, i) => {
        if (get(l.p, t.from) < l.q) throw new Error(`${t.ref}: not enough ${l.p} at ${t.from} (${get(l.p, t.from)} < ${l.q})`);
        add(l.p, t.from, -l.q);
        add(l.p, t.to, l.q);
        const at = daysAgo(t.day, 11 + i);
        ledger.push({ p: l.p, loc: t.from, delta: -l.q, type: "transfer", docRef: t.ref, user: t.by, at });
        ledger.push({ p: l.p, loc: t.to, delta: l.q, type: "transfer", docRef: t.ref, user: t.by, at });
      });
    }});
  }
  for (const d of DELIVERIES) {
    if (d.status !== "done") continue;
    events.push({ day: d.day, order: order++, apply: () => {
      d.lines.forEach((l, i) => {
        if (get(l.p, d.from) < l.q) throw new Error(`${d.ref}: not enough ${l.p} at ${d.from} (${get(l.p, d.from)} < ${l.q})`);
        add(l.p, d.from, -l.q);
        ledger.push({ p: l.p, loc: d.from, delta: -l.q, type: "delivery", docRef: d.ref, user: d.by, at: daysAgo(d.day, 13 + i) });
      });
    }});
  }
  for (const a of ADJUSTMENTS) {
    if (a.status !== "done") continue;
    events.push({ day: a.day, order: order++, apply: () => {
      a.lines.forEach((l, i) => {
        const system = get(l.p, a.loc);
        adjSystemQty.set(`${a.ref}|${l.p}`, system);
        const delta = l.counted - system;
        stock.set(`${l.p}|${a.loc}`, l.counted);
        if (delta !== 0) ledger.push({ p: l.p, loc: a.loc, delta, type: "adjustment", docRef: a.ref, user: a.by, at: daysAgo(a.day, 15 + i), notes: a.reason });
      });
    }});
  }

  // oldest first; same day → receipts, transfers, deliveries, adjustments (insertion order)
  events.sort((x, y) => (y.day - x.day) || (x.order - y.order));
  events.forEach((e) => e.apply());

  // draft adjustments need a system qty too
  for (const a of ADJUSTMENTS) {
    if (a.status === "done") continue;
    a.lines.forEach((l) => adjSystemQty.set(`${a.ref}|${l.p}`, get(l.p, a.loc)));
  }

  ledger.sort((x, y) => x.at.getTime() - y.at.getTime());
  return { stock, ledger, adjSystemQty };
}

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Building plan…");
  const { stock, ledger, adjSystemQty } = buildPlan();

  // summary
  const totals = new Map<string, number>();
  stock.forEach((q, k) => { const p = k.split("|")[0]; totals.set(p, (totals.get(p) ?? 0) + q); });
  console.log("\nFinal stock per product (all locations):");
  for (const p of PRODUCTS) {
    const t = totals.get(p.key) ?? 0;
    const status = t === 0 ? "OUT OF STOCK" : t < p.min ? "LOW STOCK" : "in stock";
    console.log(`  ${p.name.padEnd(26)} ${String(t).padStart(6)}   (min ${p.min})  ${status}`);
  }
  console.log(`\nLedger rows: ${ledger.length}`);
  for (const [name, n] of [
    ["Receipts", RECEIPTS.length], ["Transfers", TRANSFERS.length],
    ["Deliveries", DELIVERIES.length], ["Adjustments", ADJUSTMENTS.length],
  ] as const) console.log(`  ${name}: ${n}`);

  if (DRY) { console.log("\n(dry run — nothing written)"); return; }
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL (run with dotenv_config_path=.env.local)");

  const db = drizzle(neon(process.env.DATABASE_URL), { schema });

  // 1. wipe
  console.log("\n🧹 Clearing existing data…");
  for (const t of [
    "stock_ledger", "delivery_lines", "deliveries", "receipt_lines", "receipts",
    "transfer_lines", "transfers", "adjustment_lines", "adjustments",
    "stock_per_location", "reorder_rules", "user_warehouse_assignments", "otp_tokens",
    "products", "categories", "locations", "warehouses", "users",
  ]) await db.execute(sql.raw(`TRUNCATE TABLE "${t}" CASCADE;`));

  // 2. users
  console.log("👤 Users…");
  const passwordHash = await bcrypt.hash("password123", 12);
  const userRows = await db.insert(schema.users)
    .values(USERS.map((u) => ({ name: u.name, email: u.email, passwordHash, role: u.role })))
    .returning();
  const userId: Record<string, string> = {};
  USERS.forEach((u) => { userId[u.key] = userRows.find((r) => r.email === u.email)!.id; });

  // 3. warehouses + locations
  console.log("🏭 Warehouses & locations…");
  const whRows = await db.insert(schema.warehouses)
    .values(WAREHOUSES.map((w) => ({ name: w.name, shortCode: w.shortCode, address: w.address })))
    .returning();
  const whId: Record<string, string> = {};
  WAREHOUSES.forEach((w) => { whId[w.key] = whRows.find((r) => r.shortCode === w.shortCode)!.id; });

  const locDefs = WAREHOUSES.flatMap((w) =>
    LOC_DEFS.map((l) => ({ key: `${w.key}.${l.k}`, warehouseId: whId[w.key], name: l.name, code: `${w.shortCode}-${l.suffix}` })));
  const locRows = await db.insert(schema.locations)
    .values(locDefs.map(({ warehouseId, name, code }) => ({ warehouseId, name, code })))
    .returning();
  const locId: Record<string, string> = {};
  locDefs.forEach((l) => { locId[l.key] = locRows.find((r) => r.code === l.code)!.id; });

  // staff → warehouse assignments
  await db.insert(schema.userWarehouseAssignments).values([
    { userId: userId.st1, warehouseId: whId.pune },
    { userId: userId.st1, warehouseId: whId.mumbai },
    { userId: userId.st2, warehouseId: whId.mumbai },
    { userId: userId.st2, warehouseId: whId.delhi },
    { userId: userId.st3, warehouseId: whId.ahm },
  ]);

  // 4. categories + products + reorder rules
  console.log("📦 Categories, products, reorder rules…");
  const catRows = await db.insert(schema.categories).values(CATEGORIES.map((name) => ({ name }))).returning();
  const prodRows = await db.insert(schema.products)
    .values(PRODUCTS.map((p) => ({ name: p.name, sku: p.sku, uom: p.uom, categoryId: catRows.find((c) => c.name === p.cat)!.id })))
    .returning();
  const prodId: Record<string, string> = {};
  const prodUom: Record<string, string> = {};
  PRODUCTS.forEach((p) => { prodId[p.key] = prodRows.find((r) => r.sku === p.sku)!.id; prodUom[p.key] = p.uom; });
  await db.insert(schema.reorderRules)
    .values(PRODUCTS.map((p) => ({ productId: prodId[p.key], minQuantity: p.min, maxQuantity: p.max })));

  // 5. documents
  console.log("📥 Receipts…");
  const docId: Record<string, string> = {};
  const validated = (s: Status, day: number, by: string) =>
    s === "done" ? { validatedAt: daysAgo(day, 17), validatedById: userId[by] } : {};

  const recRows = await db.insert(schema.receipts).values(RECEIPTS.map((r) => ({
    reference: r.ref, supplierName: r.supplier, destinationLocationId: locId[r.dest],
    status: r.status, notes: r.notes, createdById: userId[r.by], responsibleId: userId[r.by],
    scheduledDate: daysAgo(r.day, 9), createdAt: daysAgo(r.day + 1, 9), ...validated(r.status, r.day, r.by),
  }))).returning();
  recRows.forEach((r) => { docId[r.reference] = r.id; });
  await db.insert(schema.receiptLines).values(RECEIPTS.flatMap((r) =>
    r.lines.map((l) => ({ receiptId: docId[r.ref], productId: prodId[l.p], quantity: l.q, uom: prodUom[l.p] }))));

  console.log("🔄 Transfers…");
  const trRows = await db.insert(schema.transfers).values(TRANSFERS.map((t) => ({
    reference: t.ref, sourceLocationId: locId[t.from], destinationLocationId: locId[t.to],
    status: t.status, notes: t.notes, createdById: userId[t.by], responsibleId: userId[t.by],
    scheduledDate: daysAgo(t.day, 11), createdAt: daysAgo(t.day + 1, 9), ...validated(t.status, t.day, t.by),
  }))).returning();
  trRows.forEach((r) => { docId[r.reference] = r.id; });
  await db.insert(schema.transferLines).values(TRANSFERS.flatMap((t) =>
    t.lines.map((l) => ({ transferId: docId[t.ref], productId: prodId[l.p], quantity: l.q, uom: prodUom[l.p] }))));

  console.log("📤 Deliveries…");
  const delRows = await db.insert(schema.deliveries).values(DELIVERIES.map((d) => ({
    reference: d.ref, customerName: d.customer, deliveryAddress: d.address, sourceLocationId: locId[d.from],
    status: d.status, notes: d.notes, createdById: userId[d.by], responsibleId: userId[d.by],
    scheduledDate: daysAgo(d.day, 13), createdAt: daysAgo(d.day + 1, 9), ...validated(d.status, d.day, d.by),
  }))).returning();
  delRows.forEach((r) => { docId[r.reference] = r.id; });
  await db.insert(schema.deliveryLines).values(DELIVERIES.flatMap((d) =>
    d.lines.map((l) => ({
      deliveryId: docId[d.ref], productId: prodId[l.p], demandQuantity: l.q,
      doneQuantity: d.status === "done" ? l.q : 0, uom: prodUom[l.p],
    }))));

  console.log("✏️  Adjustments…");
  const adjRows = await db.insert(schema.adjustments).values(ADJUSTMENTS.map((a) => ({
    reference: a.ref, locationId: locId[a.loc], status: a.status, reason: a.reason,
    createdById: userId[a.by], createdAt: daysAgo(a.day + 1, 9), ...validated(a.status, a.day, a.by),
  }))).returning();
  adjRows.forEach((r) => { docId[r.reference] = r.id; });
  await db.insert(schema.adjustmentLines).values(ADJUSTMENTS.flatMap((a) =>
    a.lines.map((l) => {
      const system = adjSystemQty.get(`${a.ref}|${l.p}`) ?? 0;
      return { adjustmentId: docId[a.ref], productId: prodId[l.p], systemQuantity: system, countedQuantity: l.counted, delta: l.counted - system, uom: prodUom[l.p] };
    })));

  // 6. stock per location (final state of the simulation)
  console.log("📊 Stock per location…");
  const stockValues = [...stock.entries()].map(([k, q]) => {
    const [p, l] = k.split("|");
    return { productId: prodId[p], locationId: locId[l], quantityOnHand: q };
  });
  for (const c of chunk(stockValues)) await db.insert(schema.stockPerLocation).values(c);

  // 7. ledger (Move History)
  console.log("📜 Move history (stock ledger)…");
  const ledgerValues = ledger.map((e) => ({
    productId: prodId[e.p], locationId: locId[e.loc], quantityDelta: e.delta, operationType: e.type,
    documentId: docId[e.docRef], documentReference: e.docRef, userId: userId[e.user],
    notes: e.notes, createdAt: e.at,
  }));
  for (const c of chunk(ledgerValues)) await db.insert(schema.stockLedger).values(c);

  console.log("\n✅ Done! Log in with:");
  console.log("   manager@invytrax.com / password123  (manager)");
  console.log("   staff@invytrax.com   / password123  (staff)");
}

main().catch((e) => { console.error("❌ Failed:", e); process.exit(1); });
