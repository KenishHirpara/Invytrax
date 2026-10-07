"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [locationId, setLocationId] = useState("");
  const [reason, setReason] = useState("");

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, {
    staleTime: 5 * 60 * 1000
  });

  const createAdjustment = trpc.adjustments.create.useMutation({
    onSuccess: (data) => router.push(`/operations/adjustments/${data.id}`)
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">New Inventory Adjustment</h1>
          <p className="text-gray-500 text-sm">Update current stock levels at a specific location.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Location</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">-- Select Location --</option>
              {locations?.map(l => (
                <option key={l.id} value={l.id}>{l.name} {l.code ? `(${l.code})` : ''}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the location where the physical count is taking place.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Reason (Optional)</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Annual physical count, Shrinkage, Damaged goods"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!locationId || createAdjustment.isPending}
            onClick={() => createAdjustment.mutate({ locationId, reason, lines: [] })}
          >
            {createAdjustment.isPending ? "Creating..." : "Create Adjustment Draft"}
          </Button>
        </div>
      </div>
    </div>
  );
}
