import { relations } from "drizzle-orm";
import {
  users,
  otpTokens,
  warehouses,
  locations,
  userWarehouseAssignments,
  categories,
  products,
  stockPerLocation,
  reorderRules,
  receipts,
  receiptLines,
  deliveries,
  deliveryLines,
  transfers,
  transferLines,
  adjustments,
  adjustmentLines,
  stockLedger,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  otpTokens: many(otpTokens),
  warehouseAssignments: many(userWarehouseAssignments),
  receiptsCreated: many(receipts, { relationName: "created_by" }),
  receiptsValidated: many(receipts, { relationName: "validated_by" }),
  deliveriesCreated: many(deliveries, { relationName: "created_by" }),
  deliveriesValidated: many(deliveries, { relationName: "validated_by" }),
  ledgerEntries: many(stockLedger),
}));

export const otpTokensRelations = relations(otpTokens, ({ one }) => ({
  user: one(users, { fields: [otpTokens.userId], references: [users.id] }),
}));

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  locations: many(locations),
  userAssignments: many(userWarehouseAssignments),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [locations.warehouseId],
    references: [warehouses.id],
  }),
  stockPerLocation: many(stockPerLocation),
  ledgerEntries: many(stockLedger),
}));

export const userWarehouseRelations = relations(
  userWarehouseAssignments,
  ({ one }) => ({
    user: one(users, {
      fields: [userWarehouseAssignments.userId],
      references: [users.id],
    }),
    warehouse: one(warehouses, {
      fields: [userWarehouseAssignments.warehouseId],
      references: [warehouses.id],
    }),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stockPerLocation: many(stockPerLocation),
  reorderRules: many(reorderRules),
  ledgerEntries: many(stockLedger),
  receiptLines: many(receiptLines),
  deliveryLines: many(deliveryLines),
  transferLines: many(transferLines),
  adjustmentLines: many(adjustmentLines),
}));

export const stockPerLocationRelations = relations(
  stockPerLocation,
  ({ one }) => ({
    product: one(products, {
      fields: [stockPerLocation.productId],
      references: [products.id],
    }),
    location: one(locations, {
      fields: [stockPerLocation.locationId],
      references: [locations.id],
    }),
  })
);

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  lines: many(receiptLines),
  createdBy: one(users, {
    fields: [receipts.createdById],
    references: [users.id],
    relationName: "created_by",
  }),
  validatedBy: one(users, {
    fields: [receipts.validatedById],
    references: [users.id],
    relationName: "validated_by",
  }),
  sourceLocation: one(locations, {
    fields: [receipts.sourceLocationId],
    references: [locations.id],
  }),
}));

export const receiptLinesRelations = relations(receiptLines, ({ one }) => ({
  receipt: one(receipts, {
    fields: [receiptLines.receiptId],
    references: [receipts.id],
  }),
  product: one(products, {
    fields: [receiptLines.productId],
    references: [products.id],
  }),
}));

export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  lines: many(deliveryLines),
  createdBy: one(users, {
    fields: [deliveries.createdById],
    references: [users.id],
    relationName: "created_by",
  }),
  validatedBy: one(users, {
    fields: [deliveries.validatedById],
    references: [users.id],
    relationName: "validated_by",
  }),
  sourceLocation: one(locations, {
    fields: [deliveries.sourceLocationId],
    references: [locations.id],
  }),
}));

export const deliveryLinesRelations = relations(deliveryLines, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryLines.deliveryId],
    references: [deliveries.id],
  }),
  product: one(products, {
    fields: [deliveryLines.productId],
    references: [products.id],
  }),
}));

export const transfersRelations = relations(transfers, ({ one, many }) => ({
  lines: many(transferLines),
  createdBy: one(users, {
    fields: [transfers.createdById],
    references: [users.id],
  }),
  sourceLocation: one(locations, {
    fields: [transfers.sourceLocationId],
    references: [locations.id],
    relationName: "source",
  }),
  destinationLocation: one(locations, {
    fields: [transfers.destinationLocationId],
    references: [locations.id],
    relationName: "destination",
  }),
}));

export const transferLinesRelations = relations(transferLines, ({ one }) => ({
  transfer: one(transfers, {
    fields: [transferLines.transferId],
    references: [transfers.id],
  }),
  product: one(products, {
    fields: [transferLines.productId],
    references: [products.id],
  }),
}));

export const adjustmentsRelations = relations(adjustments, ({ one, many }) => ({
  lines: many(adjustmentLines),
  createdBy: one(users, {
    fields: [adjustments.createdById],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [adjustments.locationId],
    references: [locations.id],
  }),
}));

export const adjustmentLinesRelations = relations(
  adjustmentLines,
  ({ one }) => ({
    adjustment: one(adjustments, {
      fields: [adjustmentLines.adjustmentId],
      references: [adjustments.id],
    }),
    product: one(products, {
      fields: [adjustmentLines.productId],
      references: [products.id],
    }),
  })
);

export const stockLedgerRelations = relations(stockLedger, ({ one }) => ({
  product: one(products, {
    fields: [stockLedger.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [stockLedger.locationId],
    references: [locations.id],
  }),
  user: one(users, {
    fields: [stockLedger.userId],
    references: [users.id],
  }),
}));

export const reorderRulesRelations = relations(reorderRules, ({ one }) => ({
  product: one(products, {
    fields: [reorderRules.productId],
    references: [products.id],
  }),
}));
