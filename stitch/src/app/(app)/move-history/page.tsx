"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { History, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateMoveHistoryPDF, printPDF } from "@/lib/generate-pdf";
import { cn } from "@/lib/utils";

export default function MoveHistoryPage() {
  const [opType, setOpType] = useState<"receipt" | "delivery" | "transfer" | "adjustment" | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.ledger.list.useQuery({ operationType: opType, page, pageSize: 20 });

  const handlePrint = () => {
    if (!data?.items) return;
    const doc = generateMoveHistoryPDF(data.items);
    printPDF(doc);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Audit Trail</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Stock Ledger</h1>
        </div>
        <Button variant="outline" className="gap-2 dark:border-border dark:hover:bg-muted font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-all active:scale-95" onClick={handlePrint} disabled={isLoading || !data?.items.length}>
          <Printer className="w-4 h-4" /> Export Manifest
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 flex gap-3 flex-wrap transition-colors shadow-sm">
        <select value={opType ?? ""} onChange={e => setOpType(e.target.value ? (e.target.value as typeof opType) : undefined)}
          className="h-9 border border-gray-200 dark:border-border rounded-lg px-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-muted/50 text-gray-700 dark:text-foreground transition-colors">
          <option value="">Full Traceability</option>
          <option value="receipt">Inbound Units</option>
          <option value="delivery">Outbound Units</option>
          <option value="transfer">Internal Shifts</option>
          <option value="adjustment">Balance Correct</option>
        </select>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden transition-colors shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-muted/50 text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black border-b dark:border-border">
            <tr>
              {["Date","Operation","Reference","Product","Location","Delta"].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-border/50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-xs font-bold tracking-widest uppercase">Syncing...</span>
                </div>
              </td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No movements detected</span>
              </td></tr>
            ) : data.items.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap text-[11px] font-medium">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border dark:border-border/50", 
                    e.operationType === 'receipt' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                    e.operationType === 'delivery' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                    e.operationType === 'transfer' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}>
                    {e.operationType}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[10px] font-bold text-orange-600 dark:text-primary uppercase">{e.documentReference}</td>
                <td className="px-4 py-3 font-bold text-gray-900 dark:text-foreground text-[12px]">{e.product?.name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[10px] font-medium">{e.location?.warehouse?.name} / {e.location?.name}</td>
                <td className={`px-4 py-3 font-black text-[12px] ${e.quantityDelta > 0 ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                  {e.quantityDelta > 0 ? "+" : ""}{e.quantityDelta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-border/50 flex items-center justify-between text-[11px] text-gray-500 dark:text-muted-foreground font-bold tracking-widest uppercase">
          <span className="opacity-60">Sequence: {data?.page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 dark:border-border dark:hover:bg-muted">Prev</Button>
            <Button variant="outline" size="sm" disabled={(data?.items.length ?? 0) < 20} onClick={() => setPage(p => p + 1)} className="h-8 dark:border-border dark:hover:bg-muted">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
