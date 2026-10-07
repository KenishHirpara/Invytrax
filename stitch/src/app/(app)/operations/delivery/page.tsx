"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Search } from "lucide-react";
import Link from "next/link";

export default function DeliveriesPage() {
  const [status, setStatus] = useState<"draft" | "waiting" | "ready" | "done" | "canceled" | undefined>(undefined);
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data, isLoading, refetch } = trpc.deliveries.list.useQuery({ status, locationId, page, pageSize: 20 });
  const validate = trpc.deliveries.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Outbound</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Delivery Orders</h1>
        </div>
        <Link href="/operations/delivery/new">
          <Button className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary/90 text-white dark:text-primary-foreground font-bold shadow-lg shadow-orange-500/20 gap-2 px-6">
            <Plus className="w-4 h-4" /> New Dispatch
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 flex gap-3 transition-colors shadow-sm">
        <select value={locationId ?? ""} onChange={e => setLocationId(e.target.value || undefined)}
          className="h-9 border border-gray-200 dark:border-border rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-muted/50 text-gray-700 dark:text-foreground transition-colors">
          <option value="">Origin Point</option>
          {locations?.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select value={status ?? ""} onChange={e => setStatus(e.target.value ? (e.target.value as any) : undefined)}
          className="h-9 border border-gray-200 dark:border-border rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-muted/50 text-gray-700 dark:text-foreground transition-colors">
          <option value="">Status Class</option>
          {["draft","waiting","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden transition-colors shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-muted/50 text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black border-b dark:border-border">
            <tr>
              {["Reference","Customer","Departure","Scheduled","Status","Actions"].map(h => (
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
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <span className="text-xs font-bold tracking-widest uppercase">No deliveries found</span>
                </div>
              </td></tr>
            ) : data.items.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3 font-mono font-bold text-orange-600 dark:text-primary text-[11px] uppercase tracking-tighter">{d.reference}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-foreground font-medium">{d.customerName ?? "PRIVATE CLIENT"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[11px] font-bold">{d.sourceLocation?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[11px] font-medium">{d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={d.status as any} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/operations/delivery/${d.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-orange-500/10 hover:text-orange-500"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {d.status === "ready" && (
                      <Button size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white border-none shadow-sm shadow-green-500/20 px-4"
                        onClick={() => validate.mutate({ id: d.id })}>Dispatch</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-border/50 flex items-center justify-between text-[11px] text-gray-500 dark:text-muted-foreground font-bold tracking-widest uppercase">
          <span className="opacity-60">Sequence ID: {data?.page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 dark:border-border dark:hover:bg-muted">Previous</Button>
            <Button variant="outline" size="sm" disabled={(data?.items.length ?? 0) < 20} onClick={() => setPage(p => p + 1)} className="h-8 dark:border-border dark:hover:bg-muted">Next Segment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
