"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";

export default function AdjustmentsPage() {
  const [status, setStatus] = useState<"draft" | "waiting" | "ready" | "done" | "canceled" | undefined>(undefined);
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data, isLoading, refetch } = trpc.adjustments.list.useQuery({ status, locationId, page, pageSize: 20 });
  const updateStatus = trpc.adjustments.updateStatus.useMutation({ onSuccess: () => refetch() });
  const validate = trpc.adjustments.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Logistics / Inventory Adjustments</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Inventory Adjustments</h1>
        </div>
        <Link href="/operations/adjustments/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Adjustment
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
        <select value={locationId ?? ""} onChange={e => setLocationId(e.target.value || undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
          <option value="">All Locations</option>
          {locations?.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select value={status ?? ""} onChange={e => setStatus(e.target.value ? (e.target.value as typeof status) : undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
          <option value="">All Status</option>
          {["draft","waiting","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["Reference","Location","Reason","Status","Date","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No adjustments found</td></tr>
            ) : data.items.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{a.reference}</td>
                <td className="px-4 py-3 text-gray-700">{a.location?.warehouse?.name} / {a.location?.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.reason ?? "—"}</td>
                <td className="px-4 py-3"><StatusPill status={a.status as "draft" | "waiting" | "ready" | "done" | "canceled"} /></td>
                <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/operations/adjustments/${a.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {a.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: a.id, status: "waiting" })}>
                        Confirm
                      </Button>
                    )}
                    {a.status === "waiting" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: a.id, status: "ready" })}>
                        Set Ready
                      </Button>
                    )}
                    {a.status === "ready" && (
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => validate.mutate({ id: a.id })}>
                        Validate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {data.page}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
