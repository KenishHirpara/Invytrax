"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Warehouse, Plus, MapPin, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function InlineForm({
  placeholder,
  label,
  onSave,
  onCancel,
  isPending,
  secondaryField,
}: {
  placeholder: string;
  label: string;
  onSave: (primary: string, secondary: string) => void;
  onCancel: () => void;
  isPending: boolean;
  secondaryField?: { placeholder: string; label: string };
}) {
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");

  return (
    <div className="bg-indigo-50 dark:bg-primary/5 border border-indigo-100 dark:border-primary/20 rounded-xl p-4 space-y-4 animate-in fade-in zoom-in duration-200 shadow-sm shadow-orange-500/5">
      <p className="text-[10px] font-black text-indigo-700 dark:text-primary uppercase tracking-widest pl-1">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
          <input
            autoFocus
            type="text"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-primary text-xs bg-white dark:bg-muted/50 text-gray-900 dark:text-foreground transition-all shadow-inner"
            placeholder={placeholder}
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          />
        </div>
        {secondaryField && (
          <div className="relative group">
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-primary text-xs bg-white dark:bg-muted/50 text-gray-900 dark:text-foreground transition-all shadow-inner"
              placeholder={secondaryField.placeholder}
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary/90 text-white dark:text-primary-foreground gap-1.5 h-9 text-[10px] font-bold uppercase tracking-widest px-4 shadow-lg shadow-orange-500/20"
          disabled={!primary.trim() || isPending}
          onClick={() => onSave(primary.trim(), secondary.trim())}
        >
          {isPending ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {isPending ? "Syncing..." : "Commit"}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-9 text-[10px] font-bold uppercase tracking-widest gap-1 border-gray-200 dark:border-border dark:hover:bg-muted" 
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5" />
          Void
        </Button>
      </div>
    </div>
  );
}

export default function WarehouseSettingsPage() {
  const utils = trpc.useUtils();
  const { data: warehouses, isLoading } = trpc.warehouses.list.useQuery();

  const [showNewWh, setShowNewWh] = useState(false);
  const [addingLocationFor, setAddingLocationFor] = useState<string | null>(null);

  const createWh = trpc.warehouses.create.useMutation({
    onSuccess: () => {
      utils.warehouses.list.invalidate();
      setShowNewWh(false);
    },
  });

  const addLocation = trpc.warehouses.addLocation.useMutation({
    onSuccess: () => {
      utils.warehouses.list.invalidate();
      setAddingLocationFor(null);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground font-black uppercase tracking-widest mb-1">Infrastructure</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Warehouse Network</h1>
        </div>
        <Button
          className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary/90 text-white dark:text-primary-foreground font-bold shadow-lg shadow-orange-500/20 gap-2 transition-all active:scale-95"
          onClick={() => setShowNewWh(true)}
          disabled={showNewWh}
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* New Warehouse form */}
      {showNewWh && (
        <InlineForm
          label="New Warehouse"
          placeholder="Warehouse name"
          secondaryField={{ placeholder: "Short code (e.g. WH-NY)", label: "Code" }}
          isPending={createWh.isPending}
          onCancel={() => setShowNewWh(false)}
          onSave={(name, shortCode) => {
            if (!shortCode) return;
            createWh.mutate({ name, shortCode });
          }}
        />
      )}
      {createWh.isError && (
        <p className="text-sm text-red-500">{createWh.error.message}</p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-primary" />
        </div>
      ) : !warehouses?.length ? (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-12 text-center transition-colors">
          <Warehouse className="w-12 h-12 text-gray-300 dark:text-muted/20 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-muted-foreground font-bold uppercase tracking-tight">No warehouses yet</p>
          <p className="text-xs text-gray-400 dark:text-muted-foreground/60 mt-1 max-w-[200px] mx-auto">
            Create your first storage facility to start assigning stock locations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 transition-colors shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-primary/10 flex items-center justify-center border border-indigo-100 dark:border-primary/20 transition-colors">
                    <Warehouse className="w-5 h-5 text-indigo-600 dark:text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-foreground text-sm uppercase tracking-tight leading-none mb-1">{wh.name}</h2>
                    <p className="text-[10px] text-gray-500 dark:text-muted-foreground font-mono font-bold">{wh.shortCode}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-black border transition-colors",
                    wh.isActive
                      ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-500 border-green-200 dark:border-green-500/30"
                      : "bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground border-gray-200 dark:border-border"
                  )}
                >
                  {wh.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {wh.address && (
                <div className="flex items-start gap-2 mb-6 group">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-500 dark:text-muted-foreground font-medium leading-relaxed">
                    {wh.address}
                  </p>
                </div>
              )}

              {/* Locations */}
              <div className="mt-auto pt-4 border-t border-gray-50 dark:border-border/50">
                <p className="text-[10px] font-black text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-3">
                  Storage Locations
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {wh.locations.map((loc) => (
                    <div key={loc.id} className="bg-gray-50 dark:bg-muted/30 rounded-lg p-2.5 border border-transparent dark:border-border/50 group hover:border-orange-500/30 transition-colors">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-foreground">{loc.name}</p>
                      {loc.code && (
                        <p className="text-[9px] text-gray-400 dark:text-muted-foreground font-mono mt-0.5">{loc.code}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add location form */}
                {addingLocationFor === wh.id ? (
                  <div className="mt-4">
                    <InlineForm
                      label={`Add to ${wh.shortCode}`}
                      placeholder="e.g. Rack A"
                      secondaryField={{ placeholder: "Code", label: "Code" }}
                      isPending={addLocation.isPending}
                      onCancel={() => setAddingLocationFor(null)}
                      onSave={(name, code) =>
                        addLocation.mutate({
                          warehouseId: wh.id,
                          name,
                          code: code || undefined,
                        })
                      }
                    />
                  </div>
                ) : (
                  <button
                    className="group relative mt-1 bg-gray-50/50 dark:bg-muted/20 hover:bg-white dark:hover:bg-muted/40 rounded-xl px-3 py-3 border-2 border-dashed border-gray-200 dark:border-border/50 text-gray-400 dark:text-muted-foreground hover:border-orange-400 dark:hover:border-primary/50 hover:text-orange-600 dark:hover:text-primary transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-full justify-center overflow-hidden"
                    onClick={() => setAddingLocationFor(wh.id)}
                  >
                    <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
                    Add Location
                  </button>
                )}
                {addLocation.isError && addingLocationFor === wh.id && (
                  <p className="text-[10px] text-red-500 font-bold mt-2">{addLocation.error.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
