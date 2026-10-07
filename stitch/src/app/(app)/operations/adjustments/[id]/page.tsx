"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, CheckCircle, PackageSearch, Download, Printer } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { generateAdjustmentPDF, printPDF } from "@/lib/generate-pdf";

export default function AdjustmentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  // Use string array or simple state instead of any to satisfy ESLint
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [countedQty, setCountedQty] = useState<number | "">("");

  const { data: adj, isLoading, refetch } = trpc.adjustments.byId.useQuery({ id });
  
  // Use a smaller page size or custom search if needed, but for now just list top products
  const { data: productsData } = trpc.products.list.useQuery({ pageSize: 100 }, {
    enabled: adj?.status === "draft"
  });

  const updateStatus = trpc.adjustments.updateStatus.useMutation({ onSuccess: () => refetch() });
  const validate = trpc.adjustments.validate.useMutation({ onSuccess: () => refetch() });

  const handleDownloadPDF = () => {
    if (!adj) return;
    const doc = generateAdjustmentPDF(adj);
    doc.save(`${adj.reference}.pdf`);
  };

  const handlePrintPDF = () => {
    if (!adj) return;
    const doc = generateAdjustmentPDF(adj);
    printPDF(doc);
  };
  
  const addLine = trpc.adjustments.addLine.useMutation({ 
    onSuccess: () => {
      setSelectedProductId("");
      setCountedQty("");
      refetch();
    }
  });

  const removeLine = trpc.adjustments.removeLine.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading adjustment...</div>;
  if (!adj) return <div className="p-8 text-center text-red-500">Adjustment not found.</div>;

  const handleAddLine = () => {
    if (!selectedProductId || countedQty === "") return;
    
    // Find system quantity for this product at this location
    const product = productsData?.items.find((p: { id: string; uom: string; stockPerLocation?: { locationId: string; quantityOnHand: number }[] }) => p.id === selectedProductId);
    const stockRecord = product?.stockPerLocation?.find((s: { locationId: string; quantityOnHand: number }) => s.locationId === adj.locationId);
    const systemQuantity = stockRecord?.quantityOnHand ?? 0;

    addLine.mutate({
      adjustmentId: adj.id,
      productId: selectedProductId,
      systemQuantity,
      countedQuantity: Number(countedQty),
      uom: product?.uom ?? "Units"
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/operations/adjustments")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">{adj.reference}</h1>
              <StatusPill status={adj.status as "draft" | "waiting" | "ready" | "done" | "canceled"} />
            </div>
            <p className="text-gray-500 text-sm">
              {adj.location?.warehouse?.name} / {adj.location?.name}
              {adj.reason ? ` • ${adj.reason}` : ""}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handlePrintPDF}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          {adj.status === "draft" && (
            <Button variant="outline" onClick={() => updateStatus.mutate({ id: adj.id, status: "canceled" })}>Cancel</Button>
          )}
          {adj.status === "draft" && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => updateStatus.mutate({ id: adj.id, status: "waiting" })}>Confirm Count</Button>
          )}
          {adj.status === "waiting" && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => updateStatus.mutate({ id: adj.id, status: "ready" })}>Set Ready</Button>
          )}
          {adj.status === "ready" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => validate.mutate({ id: adj.id })}>
              <CheckCircle className="w-4 h-4" /> Validate
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lines Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Inventory Lines</h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{adj.lines.length} Items</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Product</th>
                  <th className="text-right px-5 py-3 font-semibold">System Qty</th>
                  <th className="text-right px-5 py-3 font-semibold">Counted Qty</th>
                  <th className="text-right px-5 py-3 font-semibold">Difference</th>
                  {adj.status === "draft" && <th className="text-right px-5 py-3 font-semibold"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!adj.lines.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <PackageSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      No lines added to this adjustment yet.
                    </td>
                  </tr>
                ) : (
                  adj.lines.map((l: { id: string; product?: { name: string; sku: string }; systemQuantity: number; countedQuantity: number; uom: string | null; delta: number }) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-900 font-medium">{l.product?.name} <span className="text-xs text-gray-400 block">{l.product?.sku}</span></td>
                      <td className="px-5 py-3 text-right text-gray-500">{l.systemQuantity} {l.uom}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{l.countedQuantity} {l.uom}</td>
                      <td className={`px-5 py-3 text-right font-bold ${l.delta > 0 ? "text-green-600" : l.delta < 0 ? "text-red-500" : "text-gray-400"}`}>
                        {l.delta > 0 ? "+" : ""}{l.delta}
                      </td>
                      {adj.status === "draft" && (
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => removeLine.mutate({ id: l.id })} disabled={removeLine.isPending} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {adj.status === "draft" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Add Product Count</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Product</label>
                  <select 
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Choose... --</option>
                    {productsData?.items.map((p: { id: string; name: string; sku: string }) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Actual Count</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <Button 
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700" 
                  disabled={!selectedProductId || countedQty === "" || addLine.isPending}
                  onClick={handleAddLine}
                >
                  {addLine.isPending ? "Adding..." : "Add to List"}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
             <h3 className="font-semibold text-gray-900 text-sm">Status Details</h3>
             <ul className="text-sm space-y-2 text-gray-600">
               <li className="flex justify-between"><span>Created On:</span> <span className="font-medium text-gray-900">{new Date(adj.createdAt).toLocaleDateString()}</span></li>
               <li className="flex justify-between"><span>Location ID:</span> <span className="font-mono text-xs">{adj.locationId.split("-")[0]}</span></li>
               {adj.validatedAt && <li className="flex justify-between"><span>Validated:</span> <span className="font-medium text-green-600">{new Date(adj.validatedAt).toLocaleDateString()}</span></li>}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
