"use client";

import { trpc } from "@/lib/trpc";
import { Package, AlertTriangle, AlertCircle, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function KpiCard({
  icon: Icon,
  color,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  color: "indigo" | "amber" | "red" | "blue" | "purple";
  label: string;
  value?: number;
  href?: string;
}) {
  const theme = {
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-100/50 hover:shadow-glow-primary dark:bg-primary/10 dark:text-primary dark:border-primary/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-100/50 hover:shadow-glow-amber",
    red: "bg-red-500/10 text-red-600 border-red-100/50 hover:shadow-glow-red",
    blue: "bg-blue-500/10 text-blue-600 border-blue-100/50 hover:shadow-glow-primary dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
    purple: "bg-purple-500/10 text-purple-600 border-purple-100/50 hover:shadow-glow-primary dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800",
  }[color];

  const content = (
    <div className={cn(
      "group relative bg-white/80 dark:bg-card backdrop-blur-xl rounded-2xl border dark:border-border p-5 flex items-start gap-4 transition-all duration-500 ease-spring hover:-translate-y-1 hover:shadow-xl",
      theme
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:rotate-3",
        color === "indigo" ? "bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground" : "",
        color === "amber" ? "bg-amber-500 text-white" : "",
        color === "red" ? "bg-red-500 text-white" : "",
        color === "blue" ? "bg-blue-500 text-white" : "",
        color === "purple" ? "bg-purple-500 text-white" : "",
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-gray-500 dark:group-hover:text-foreground transition-colors">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-gray-900 dark:text-foreground tracking-tight">
            {value === undefined ? (
              <span className="inline-block w-12 h-8 bg-gray-100 dark:bg-muted animate-pulse rounded-lg" />
            ) : (
              value.toLocaleString()
            )}
          </p>
          {value !== undefined && <span className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-tighter">Units</span>}
        </div>
      </div>
      
      {/* Decorative Spatial Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
        <Icon className="w-12 h-12 rotate-[-15deg] dark:text-foreground" />
      </div>
    </div>
  );
  return href ? <Link href={href} className="no-underline">{content}</Link> : content;
}

export default function DashboardPage() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const { data: alerts } = trpc.dashboard.alerts.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Pages / Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">Dashboard</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mt-0.5">
          Overview of your warehouse operations and inventory status.
        </p>
      </div>

      {/* KPI Cards — links navigate to filtered list views */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <KpiCard
          icon={Package}
          color="indigo"
          label="Total Products"
          value={kpis?.totalProducts}
          href="/products"
        />
        <KpiCard
          icon={AlertTriangle}
          color="amber"
          label="Low Stock"
          value={kpis?.lowStock}
          href="/products?filter=low_stock"
        />
        <KpiCard
          icon={AlertCircle}
          color="red"
          label="Out of Stock"
          value={kpis?.outOfStock}
          href="/products?filter=out_of_stock"
        />
        <KpiCard
          icon={Clock}
          color="blue"
          label="Pending Receipts"
          value={kpis?.pendingReceipts}
          href="/operations/receipts?status=waiting"
        />
        <KpiCard
          icon={Truck}
          color="purple"
          label="Pending Deliveries"
          value={kpis?.pendingDeliveries}
          href="/operations/delivery?status=waiting"
        />
      </div>

      {/* Alerts Center */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-900 dark:text-foreground text-sm">Low Stock Alerts</h2>
          </div>
          <Link href="/products?filter=low_stock" className="text-xs text-indigo-600 dark:text-primary hover:underline">
            View All Critical Stock
          </Link>
        </div>
        {!alerts?.length ? (
          <p className="text-xs text-gray-500 dark:text-muted-foreground py-4 text-center">No critical stock levels detected. Warehouse is healthy.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100/50 dark:border-border transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded flex items-center justify-center transition-colors">
                    <Package className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">{alert.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-tight">{alert.sku} • {alert.location.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-500">{alert.quantity} Left</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500/70 italic leading-none">Min: {alert.minQty}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receipts */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500 dark:text-primary" />
              <h2 className="font-semibold text-gray-900 dark:text-foreground text-sm">Receipt Operations</h2>
            </div>
            <Link href="/operations/receipts" className="text-xs text-indigo-600 dark:text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.receiptOps.toReceive ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">TO RECEIVE</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.receiptOps.inInspection ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">IN INSPECTION</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.receiptOps.completed ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">COMPLETED</p>
            </div>
          </div>
          {kpis && kpis.receiptOps.toReceive > 0 && (
            <div className="flex gap-2 mt-4">
              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary px-2.5 py-1 rounded-full uppercase transition-colors">
                +{kpis.receiptOps.toReceive} Pending Shipment{kpis.receiptOps.toReceive !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Deliveries */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500 dark:text-primary" />
              <h2 className="font-semibold text-gray-900 dark:text-foreground text-sm">Delivery Operations</h2>
            </div>
            <Link href="/operations/delivery" className="text-xs text-indigo-600 dark:text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.deliveryOps.picking ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">PICKING</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.deliveryOps.packing ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">PACKING</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-foreground">
                {kpis?.deliveryOps.dispatched ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 uppercase tracking-tighter font-semibold">DISPATCHED</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 px-2.5 py-1 rounded-full uppercase transition-colors">
              Live data · refreshes every 30s
            </span>
          </div>
        </div>
      </div>

      {/* Performance Banner */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-primary/10 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-indigo-600 dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-indigo-600 dark:text-primary text-sm transition-colors">Warehouse performance is tracking live</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Dashboard KPIs auto-refresh every 30 seconds.</p>
          </div>
        </div>
        <Link
          href="/move-history"
          className="bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-primary/80 transition-colors"
        >
          View Ledger
        </Link>
      </div>
    </div>
  );
}
