import {
  pgTable,
  text,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
  boolean,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["manager", "staff"]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "waiting",
  "ready",
  "done",
  "canceled",
]);

export const operationTypeEnum = pgEnum("operation_type", [
  "receipt",
  "delivery",
  "transfer",
  "adjustment",
]);

export const stockLedgerStatusEnum = pgEnum("stock_ledger_status", [
  "completed",
  "pending",
  "in_transit",
  "flagged",
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const otpTokens = pgTable("otp_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Warehouses & Locations ───────────────────────────────────────────────────

export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Staff ↔ Warehouse assignment (many-to-many)
export const userWarehouseAssignments = pgTable(
  "user_warehouse_assignments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.userId, t.warehouseId)]
);

// ─── Product Catalog ──────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  uom: varchar("uom", { length: 50 }).notNull().default("Units"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Stock per Location ───────────────────────────────────────────────────────
// CRITICAL: Composite PK. Never a global stock total.

export const stockPerLocation = pgTable(
  "stock_per_location",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    quantityReserved: integer("quantity_reserved").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.productId, t.locationId)]
);

// ─── Reorder Rules ────────────────────────────────────────────────────────────

export const reorderRules = pgTable("reorder_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  minQuantity: integer("min_quantity").notNull().default(0),
  maxQuantity: integer("max_quantity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Receipts (Inbound) ───────────────────────────────────────────────────────

export const receipts = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 50 }).notNull().unique(),
  supplierId: text("supplier_id"), // external reference; no CRM in V1
  supplierName: varchar("supplier_name", { length: 255 }),
  sourceLocationId: uuid("source_location_id").references(() => locations.id),
  destinationLocationId: uuid("destination_location_id").references(
    () => locations.id
  ),
  scheduledDate: timestamp("scheduled_date"),
  deadline: timestamp("deadline"),
  status: documentStatusEnum("status").notNull().default("draft"),
  responsibleId: uuid("responsible_id").references(() => users.id),
  notes: text("notes"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  validatedAt: timestamp("validated_at"),
  validatedById: uuid("validated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const receiptLines = pgTable("receipt_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  receiptId: uuid("receipt_id")
    .notNull()
    .references(() => receipts.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  uom: varchar("uom", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Deliveries (Outbound) ────────────────────────────────────────────────────

export const deliveries = pgTable("deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }),
  deliveryAddress: text("delivery_address"),
  sourceLocationId: uuid("source_location_id").references(() => locations.id),
  destinationInfo: text("destination_info"),
  scheduledDate: timestamp("scheduled_date"),
  status: documentStatusEnum("status").notNull().default("draft"),
  responsibleId: uuid("responsible_id").references(() => users.id),
  notes: text("notes"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  validatedAt: timestamp("validated_at"),
  validatedById: uuid("validated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryLines = pgTable("delivery_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  deliveryId: uuid("delivery_id")
    .notNull()
    .references(() => deliveries.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  demandQuantity: integer("demand_quantity").notNull(),
  doneQuantity: integer("done_quantity").notNull().default(0),
  uom: varchar("uom", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Internal Transfers ───────────────────────────────────────────────────────

export const transfers = pgTable("transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 50 }).notNull().unique(),
  sourceLocationId: uuid("source_location_id")
    .notNull()
    .references(() => locations.id),
  destinationLocationId: uuid("destination_location_id")
    .notNull()
    .references(() => locations.id),
  scheduledDate: timestamp("scheduled_date"),
  status: documentStatusEnum("status").notNull().default("draft"),
  responsibleId: uuid("responsible_id").references(() => users.id),
  notes: text("notes"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  validatedAt: timestamp("validated_at"),
  validatedById: uuid("validated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transferLines = pgTable("transfer_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  transferId: uuid("transfer_id")
    .notNull()
    .references(() => transfers.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  uom: varchar("uom", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Stock Adjustments ────────────────────────────────────────────────────────

export const adjustments = pgTable("adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 50 }).notNull().unique(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id),
  status: documentStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  reason: text("reason"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  validatedAt: timestamp("validated_at"),
  validatedById: uuid("validated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adjustmentLines = pgTable("adjustment_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  adjustmentId: uuid("adjustment_id")
    .notNull()
    .references(() => adjustments.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  systemQuantity: integer("system_quantity").notNull(),
  countedQuantity: integer("counted_quantity").notNull(),
  delta: integer("delta").notNull(), // counted - system (can be negative)
  uom: varchar("uom", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Stock Ledger (IMMUTABLE — INSERT ONLY) ───────────────────────────────────

export const stockLedger = pgTable(
  "stock_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id),
    quantityDelta: integer("quantity_delta").notNull(), // positive = in, negative = out
    operationType: operationTypeEnum("operation_type").notNull(),
    documentId: uuid("document_id").notNull(), // receipt/delivery/transfer/adjustment id
    documentReference: varchar("document_reference", { length: 50 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("ledger_product_idx").on(t.productId),
    index("ledger_location_idx").on(t.locationId),
    index("ledger_created_idx").on(t.createdAt),
    index("ledger_op_type_idx").on(t.operationType),
  ]
);
