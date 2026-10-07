"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"draft" | "waiting" | "ready" | "done" | "canceled" | undefined>(undefined);
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data, isLoading, refetch } = trpc.receipts.list.useQuery({ search, status, locationId, page, pageSize: 20 });
  const updateStatus = trpc.receipts.updateStatus.useMutation({ onSuccess: () => refetch() });
  const validate = trpc.receipts.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Supply Chain</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight whitespace-nowrap">Receipt Manifests</h1>
        </div>
        <Link href="/operations/receipts/new">
          <Button className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary/90 text-white dark:text-primary-foreground font-bold shadow-lg shadow-orange-500/20 gap-2 px-6">
            <Plus className="w-4 h-4" /> Inbound Asset
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 flex gap-3 transition-colors shadow-sm">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <Input placeholder="Search receipts..." className="pl-9 h-9 dark:bg-muted/50 border-gray-100 dark:border-border focus-visible:ring-orange-500"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={locationId ?? ""} onChange={e => setLocationId(e.target.value || undefined)}
          className="h-9 border border-gray-200 dark:border-border rounded-lg px-3 text-sm text-gray-700 dark:text-foreground focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-muted/50 transition-colors">
          <option value="">All Locations</option>
          {locations?.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select value={status ?? ""} onChange={e => setStatus((e.target.value as typeof status) || undefined)}
          className="h-9 border border-gray-200 dark:border-border rounded-lg px-3 text-sm text-gray-700 dark:text-foreground focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-muted/50 transition-colors">
          <option value="">All Status</option>
          {["draft","waiting","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden transition-colors shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-muted/50 text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black border-b dark:border-border">
            <tr>
              {["Reference","Supplier","Destination","Scheduled Date","Status","Actions"].map(h => (
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
                  <span className="text-xs font-bold tracking-widest uppercase">No receipts found</span>
                </div>
              </td></tr>
            ) : data.items.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3 font-mono font-bold text-orange-600 dark:text-primary text-[11px] uppercase tracking-tighter">{r.reference}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-foreground font-medium">{r.supplierName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[11px] font-bold">{r.sourceLocation?.name ?? "EXTERNAL VENDOR"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground text-[11px] font-medium">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={r.status as any} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/operations/receipts/${r.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-orange-500/10 hover:text-orange-500"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {r.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-widest border-gray-200 dark:border-border"
                        onClick={() => updateStatus.mutate({ id: r.id, status: "waiting" })}>
                        Confirm
                      </Button>
                    )}
                    {r.status === "ready" && (
                      <Button size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white border-none shadow-sm shadow-green-500/20"
                        onClick={() => validate.mutate({ id: r.id })}>
                        Validate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {data && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-border/50 flex items-center justify-between text-[11px] text-gray-500 dark:text-muted-foreground font-bold tracking-widest uppercase">
            <span className="opacity-60">Manifest Tier: {data.page}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 dark:border-border dark:hover:bg-muted">Previous</Button>
              <Button variant="outline" size="sm" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)} className="h-8 dark:border-border dark:hover:bg-muted">Next Sequence</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
