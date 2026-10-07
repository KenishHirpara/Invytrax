"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewDeliveryPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [sourceLocationId, setSourceLocationId] = useState("");

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, {
    staleTime: 5 * 60 * 1000
  });

  const createDelivery = trpc.deliveries.createDraft.useMutation({
    onSuccess: () => router.push("/operations/delivery")
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">New Delivery</h1>
          <p className="text-gray-500 text-sm">Create a draft delivery note for outbound stock.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Reference</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="OUT-YYYYMMDD-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={sourceLocationId}
              onChange={(e) => setSourceLocationId(e.target.value)}
            >
              <option value="">-- Select Source --</option>
              {locations?.map(l => (
                <option key={l.id} value={l.id}>{l.name} {l.code ? `(${l.code})` : ''}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!reference || !sourceLocationId || createDelivery.isPending}
            onClick={() => createDelivery.mutate({ reference, sourceLocationId, lines: [] })}
          >
            {createDelivery.isPending ? "Creating..." : "Save Draft"}
          </Button>
        </div>
      </div>
    </div>
  );
}
