"use client";

import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { BarChart2, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStockReportPDF, printPDF } from "@/lib/generate-pdf";
import { cn } from "@/lib/utils";

function stockStatus(qty: number, min?: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty === 0) return "out_of_stock";
  if (min && qty < min) return "low_stock";
  return "in_stock";
}

export default function StockViewPage() {
  const { data, isLoading } = trpc.products.list.useQuery({ pageSize: 100 });

  const handlePrint = () => {
    if (!data?.items) return;
    const doc = generateStockReportPDF(data.items);
    printPDF(doc);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Visibility</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Stock Inventory</h1>
        </div>
        <Button variant="outline" className="gap-2 dark:border-border dark:hover:bg-muted font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-all active:scale-95 shadow-sm" onClick={handlePrint} disabled={isLoading || !data?.items.length}>
          <Printer className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.items.filter(p => p.stockPerLocation.length > 0).map(p => {
            const min = p.reorderRules[0]?.minQuantity;
            const max = p.reorderRules[0]?.maxQuantity;
            const totalQty = p.stockPerLocation.reduce((s, sl) => s + sl.quantityOnHand, 0);
            const pct = max ? Math.min(100, Math.round((totalQty / max) * 100)) : null;
            const st = stockStatus(totalQty, min);

            return (
              <div key={p.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-gray-900 dark:text-foreground text-[13px] uppercase tracking-tight truncate leading-tight">{p.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-muted-foreground font-black mt-1 uppercase tracking-widest opacity-60">{p.sku} · {p.uom}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-2xl font-black text-gray-900 dark:text-foreground tracking-tighter leading-none">{totalQty.toLocaleString()}</span>
                    <StatusPill status={st as any} />
                  </div>
                </div>

                {/* Progress bar */}
                {pct !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-muted-foreground mb-1.5 font-semibold">
                      <span>MIN: {min}</span>
                      <span className={cn(
                        "tracking-wider",
                        pct < 30 ? "text-red-500" : pct < 60 ? "text-orange-500" : "text-green-600 dark:text-green-500"
                      )}>{pct}% {pct >= 100 ? "FULL" : "STOCK"}</span>
                      <span>MAX: {max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-muted/50 rounded-full overflow-hidden border dark:border-border/30">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          pct < 30 ? "bg-red-500" : pct < 60 ? "bg-orange-500" : "bg-green-600 dark:bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Per-location breakdown */}
                <div className="flex flex-wrap gap-1.5">
                  {p.stockPerLocation.map(sl => (
                    <div key={`${sl.productId}-${sl.locationId}`}
                      className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-muted/20 hover:bg-gray-100 dark:hover:bg-muted/40 transition-colors rounded-lg px-2.5 py-1.5 text-[10px] border border-gray-100/80 dark:border-border/50">
                      <span className="text-gray-500 dark:text-muted-foreground font-bold uppercase tracking-tighter truncate max-w-[120px]">{sl.location?.warehouse?.name} / {sl.location?.name}:</span>
                      <span className="font-black text-gray-900 dark:text-foreground">{sl.quantityOnHand}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
