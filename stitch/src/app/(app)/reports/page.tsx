"use client";

import { trpc } from "@/lib/trpc";
import { BarChart2, Download, Package, Clock, AlertTriangle, Truck, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMoveHistoryPDF, generateStockReportPDF, printPDF } from "@/lib/generate-pdf";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-indigo-500",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 transition-colors shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", color.includes("indigo") ? "text-indigo-500 dark:text-primary" : color)} />
        <h3 className="text-sm font-medium text-gray-900 dark:text-foreground">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
        {value === undefined ? (
          <span className="inline-block w-20 h-8 bg-gray-100 dark:bg-muted animate-pulse rounded" />
        ) : (
          value
        )}
      </p>
      {sub && <p className="text-xs text-gray-400 dark:text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: ledger } = trpc.ledger.list.useQuery({ pageSize: 5 });
  const { data: products } = trpc.products.list.useQuery({ pageSize: 100 });

  const totalMovements = ledger?.items.length;

  const handlePrintLedger = () => {
    if (!ledger?.items) return;
    const doc = generateMoveHistoryPDF(ledger.items);
    printPDF(doc);
  };

  const handlePrintStock = () => {
    if (!products?.items) return;
    const doc = generateStockReportPDF(products.items);
    printPDF(doc);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Intelligence</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Analytics & Reports</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 dark:border-border dark:hover:bg-muted font-bold uppercase tracking-widest text-[10px] h-10 px-5" onClick={handlePrintStock}>
            <Printer className="w-4 h-4" /> Global Stock Report
          </Button>
          <Link
            href="/move-history"
            className="bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground hover:bg-indigo-700 dark:hover:bg-primary/90 transition-all flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Full Audit Path
          </Link>
        </div>
      </div>

      {/* Live KPI Stats (from dashboard router — single source of truth) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Package}
          label="Total Active Products"
          value={kpis?.totalProducts}
          sub="Products in catalog with isActive = true"
          color="text-indigo-500 dark:text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={kpis?.lowStock}
          sub="Products below minimum reorder quantity"
          color="text-amber-500"
        />
        <StatCard
          icon={Truck}
          label="Pending Deliveries"
          value={kpis?.pendingDeliveries}
          sub="Deliveries not yet dispatched"
          color="text-purple-500 dark:text-purple-400"
        />
        <StatCard
          icon={Clock}
          label="Pending Receipts"
          value={kpis?.pendingReceipts}
          sub="Inbound shipments awaiting validation"
          color="text-blue-500 dark:text-blue-400"
        />
        <StatCard
          icon={Package}
          label="Out of Stock"
          value={kpis?.outOfStock}
          sub="Locations with on-hand quantity = 0"
          color="text-red-500"
        />
        <StatCard
          icon={BarChart2}
          label="Recent Ledger Entries"
          value={totalMovements !== undefined ? `${totalMovements} this page` : undefined}
          sub="Latest stock movements across all ops"
          color="text-indigo-500 dark:text-primary"
        />
      </div>

      {/* Recent Movements Table (dynamic from ledger) */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden transition-colors shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/30 dark:bg-muted/10">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-foreground">Recent Movement Summary</h2>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
              Latest 5 stock ledger entries — immutable audit trail.
            </p>
          </div>
          <Link href="/move-history" className="text-xs text-indigo-600 dark:text-primary font-semibold hover:underline transition-colors">
            View All →
          </Link>
        </div>

        {!ledger?.items.length ? (
          <div className="p-8 flex items-center justify-center bg-gray-50/50 dark:bg-muted/5">
            <div className="text-center space-y-3">
              <BarChart2 className="w-12 h-12 text-gray-300 dark:text-muted/20 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">No movements recorded yet</p>
              <p className="text-xs text-gray-400 dark:text-muted-foreground/60 max-w-sm">
                Create and validate a Receipt or Delivery to start tracking inventory movements.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-muted/30 text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-bold">
                <tr>
                  {["Date", "Operation", "Product", "Location", "Delta"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 border-b dark:border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border/50">
                {ledger.items.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/80 dark:hover:bg-muted/5 transition-colors group">
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap text-[11px]">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium capitalize text-gray-700 dark:text-foreground/80">{e.operationType}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-foreground">{e.product?.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[11px]">
                      {e.location?.warehouse?.name} / {e.location?.name}
                    </td>
                    <td className={`px-4 py-3 font-bold ${e.quantityDelta > 0 ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                      {e.quantityDelta > 0 ? "+" : ""}{e.quantityDelta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
