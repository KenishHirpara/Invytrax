"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [uom, setUom] = useState("Units");
  const [categoryId, setCategoryId] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [locationId, setLocationId] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");

  const { data: locations } = trpc.warehouses.listLocations.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => router.push("/products"),
  });

  const handleSubmit = () => {
    createProduct.mutate({
      name,
      sku,
      uom: uom || "Units",
      categoryId: categoryId || undefined,
      initialStock: initialStock ? Number(initialStock) : undefined,
      locationId: locationId || undefined,
      minQuantity: minQty ? Number(minQty) : undefined,
      maxQuantity: maxQty ? Number(maxQty) : undefined,
    });
  };

  const isValid = name.trim() && sku.trim() &&
    // If initialStock is given, a locationId is required
    (initialStock ? !!locationId : true);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Create Product</h1>
          <p className="text-gray-500 text-sm">Add a new storable product to the catalog.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        {/* General Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            General Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Premium Ergonomic Chair"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="FURN-CHR-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
              >
                {["Units", "kg", "g", "L", "mL", "m", "cm", "Boxes", "Pallets", "Pieces"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Initial Stock */}
        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Initial Stock (Optional)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Quantity
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location{initialStock ? <span className="text-red-500"> *</span> : ""}
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                disabled={!locations?.length}
              >
                <option value="">-- Select Location --</option>
                {locations?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.code ? `(${l.code})` : ""}
                  </option>
                ))}
              </select>
              {!locations?.length && (
                <p className="text-xs text-amber-600 mt-1">
                  No locations found. Add a warehouse first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reorder Rules */}
        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Reorder Rules (Optional)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Quantity (triggers low stock alert)
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 10"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Quantity (optimal level)
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 200"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!isValid || createProduct.isPending}
            onClick={handleSubmit}
          >
            {createProduct.isPending ? "Saving..." : "Create Product"}
          </Button>
        </div>

        {createProduct.isError && (
          <p className="text-sm text-red-500 mt-2">
            {createProduct.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
