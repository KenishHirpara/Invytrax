"use client";

import { useSession } from "next-auth/react";
import { Shield, KeyRound, Bell } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs text-gray-500 dark:text-muted-foreground font-black uppercase tracking-widest mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">General Settings</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mt-0.5 font-medium">Manage your account and system preferences.</p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden shadow-sm transition-colors">
        {/* Profile Section */}
        <div className="p-8 border-b border-gray-100 dark:border-border/50 bg-gray-50/30 dark:bg-muted/10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground font-black text-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-foreground uppercase tracking-tight">{session?.user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium mt-1">{session?.user?.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground rounded font-bold uppercase tracking-widest border border-gray-200 dark:border-border">
                  {session?.user?.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-500 rounded font-bold uppercase tracking-widest border border-green-200 dark:border-green-500/20">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Setting Groups */}
        <div className="divide-y divide-gray-100 dark:divide-border/50">
          <div className="p-6 hover:bg-gray-50 dark:hover:bg-muted/20 transition-all flex items-start gap-5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-foreground uppercase tracking-wide">Role & Access</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1.5 leading-relaxed font-medium">
                You are currently logged in with <span className="font-black text-gray-700 dark:text-foreground underline decoration-orange-500/30 capitalize">{session?.user?.role}</span> privileges. 
                {session?.user?.role === "manager" 
                  ? " Complete administrative access to the global supply chain network." 
                  : " Standard inventory control and warehouse operations access."}
              </p>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 dark:hover:bg-muted/20 transition-all flex items-start gap-5">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-primary/10 text-orange-600 dark:text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-foreground uppercase tracking-wide">Security Credential</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1.5 leading-relaxed font-medium">Authorized for cryptographic signature updates and 2FA management.</p>
              <button className="mt-4 text-xs font-black text-indigo-600 dark:text-primary uppercase tracking-widest hover:underline px-4 py-2 border border-indigo-100 dark:border-primary/20 rounded-lg bg-indigo-50/30 dark:bg-primary/5 transition-colors">
                Reset Access Token
              </button>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 dark:hover:bg-muted/20 transition-all flex items-start gap-5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-foreground uppercase tracking-wide">Signal Distribution</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1.5 leading-relaxed font-medium">Dispatch real-time telemetry alerts for low stock and operational anomalies.</p>
              <label className="flex items-center gap-3 mt-4 group cursor-pointer w-fit">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 dark:border-border text-orange-500 focus:ring-orange-500 bg-white dark:bg-muted" defaultChecked />
                <span className="text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-widest group-hover:text-orange-500 transition-colors">Master Distribution List</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
