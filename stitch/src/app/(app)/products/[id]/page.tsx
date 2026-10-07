"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box } from "lucide-react";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = trpc.products.byId.useQuery({ id });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/products")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">{product.name}</h1>
            <p className="text-gray-500 text-sm">SKU: {product.sku} • Category: {product.category?.name ?? "None"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-500" /> Stock by Location
            </h2>
            <div className="space-y-3">
              {product.stockPerLocation.length === 0 ? (
                <p className="text-sm text-gray-500">No stock recorded for this product.</p>
              ) : (
                product.stockPerLocation.map((s: { locationId: string; location?: { name: string; warehouse?: { name: string } } | null; quantityOnHand: number }) => (
                  <div key={s.locationId} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-700">
                      {s.location?.warehouse?.name} / {s.location?.name}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {s.quantityOnHand} {product.uom}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
             <h3 className="font-semibold text-gray-900 text-sm">Metrics</h3>
             <ul className="text-sm space-y-2 text-gray-600">
               <li className="flex justify-between"><span>Unit of Measure:</span> <span className="font-medium text-gray-900">{product.uom}</span></li>
               <li className="flex justify-between"><span>Status:</span> <span className="font-medium text-green-600">{product.isActive ? "Active" : "Inactive"}</span></li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
