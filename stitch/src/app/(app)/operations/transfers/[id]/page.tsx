"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Download, Printer } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { generateTransferPDF, printPDF } from "@/lib/generate-pdf";

export default function TransferDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: transfer, isLoading, refetch } = trpc.transfers.byId.useQuery({ id });
  const validate = trpc.transfers.validate.useMutation({ onSuccess: () => refetch() });

  const handleDownloadPDF = () => {
    if (!transfer) return;
    const doc = generateTransferPDF(transfer);
    doc.save(`${transfer.reference}.pdf`);
  };

  const handlePrintPDF = () => {
    if (!transfer) return;
    const doc = generateTransferPDF(transfer);
    printPDF(doc);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading transfer...</div>;
  if (!transfer) return <div className="p-8 text-center text-red-500">Transfer not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/operations/transfers")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">{transfer.reference}</h1>
              <StatusPill status={transfer.status as "draft" | "waiting" | "ready" | "done" | "canceled"} />
            </div>
            <p className="text-gray-500 text-sm">
              Source: {transfer.sourceLocation?.name ?? "..."} → Destination: {transfer.destinationLocation?.name ?? "..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handlePrintPDF}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          {transfer.status === "ready" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => validate.mutate({ id: transfer.id })}>
              <CheckCircle className="w-4 h-4" /> Validate Transfer
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Transfer Lines</h2>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{transfer.lines.length} Items</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Product</th>
              <th className="text-right px-5 py-3 font-semibold">Transfer Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!transfer.lines.length ? (
              <tr>
                <td colSpan={2} className="text-center py-12 text-gray-400">No items on this transfer.</td>
              </tr>
            ) : (
              transfer.lines.map((l: { id: string; product?: { name: string; sku: string }; quantity: number; uom: string | null }) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-900 font-medium">
                    {l.product?.name} <span className="text-xs text-gray-400 block">{l.product?.sku}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">{l.quantity} {l.uom || "Units"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
