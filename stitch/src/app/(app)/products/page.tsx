"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Printer } from "lucide-react";
import Link from "next/link";
import { generateProductListPDF, printPDF } from "@/lib/generate-pdf";

function stockStatus(qty: number, min?: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty === 0) return "out_of_stock";
  if (min && qty < min) return "low_stock";
  return "in_stock";
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.products.list.useQuery({ search, page, pageSize: 20 });

  const handlePrint = () => {
    if (!data?.items) return;
    const doc = generateProductListPDF(data.items);
    printPDF(doc);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-black">Asset Registry</p>
          <div className="w-1 h-1 rounded-full bg-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Product Catalog</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 dark:border-border dark:hover:bg-muted font-bold uppercase tracking-widest text-[10px] h-10 px-5" onClick={handlePrint} disabled={isLoading || !data?.items.length}>
            <Printer className="w-4 h-4" /> Global Catalog
          </Button>
          <Link href="/products/new">
            <Button className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary/90 text-white dark:text-primary-foreground gap-2 transition-all font-black uppercase tracking-widest text-[11px] h-10 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95">
              <Plus className="w-4 h-4" />
              Manifest Asset
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 flex gap-3 transition-colors shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." className="pl-9 h-9 border-gray-200 dark:border-border dark:bg-muted/50"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden transition-colors shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-muted/30 text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest font-bold">
              <tr>
                {["SKU","Product Name","Category","UoM","Total Stock","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 border-b dark:border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-border/50">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-muted-foreground">Loading catalog...</td></tr>
              ) : !data?.items.length ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-muted-foreground">No products found matching your search</td></tr>
              ) : data.items.map(p => {
                const totalQty = p.stockPerLocation.reduce((s, sl) => s + (sl.quantityOnHand ?? 0), 0);
                const minQty = p.reorderRules[0]?.minQuantity;
                const st = stockStatus(totalQty, minQty);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-muted/5 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground">{p.uom}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-foreground">{totalQty.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill status={st} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tight">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-border flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground bg-gray-50/30 dark:bg-muted/10">
          <span className="font-medium">{data?.total?.toLocaleString() ?? "—"} products total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={(data?.items.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
