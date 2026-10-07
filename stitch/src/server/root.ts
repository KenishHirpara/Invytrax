import { createTRPCRouter } from "@/server/trpc";
import { productsRouter } from "./routers/products";
import { warehousesRouter } from "./routers/warehouses";
import { receiptsRouter } from "./routers/receipts";
import { deliveriesRouter } from "./routers/deliveries";
import { transfersRouter } from "./routers/transfers";
import { adjustmentsRouter } from "./routers/adjustments";
import { ledgerRouter } from "./routers/ledger";
import { dashboardRouter } from "./routers/dashboard";
import { userRouter } from "./routers/users";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  warehouses: warehousesRouter,
  receipts: receiptsRouter,
  deliveries: deliveriesRouter,
  transfers: transfersRouter,
  adjustments: adjustmentsRouter,
  ledger: ledgerRouter,
  dashboard: dashboardRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
