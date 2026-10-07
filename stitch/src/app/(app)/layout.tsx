"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Search, Bell, HelpCircle, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useState } from "react";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";

function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Simple breadcrumb logic
  const segments = pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="h-14 border-b bg-white dark:bg-card dark:border-border flex items-center justify-between px-6 sticky top-0 z-10 shrink-0 transition-colors">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-gray-400 dark:text-muted-foreground font-bold tracking-tight">Core</span>
          {segments.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
              <span className={cn(
                "capitalize",
                i === segments.length - 1 ? "text-gray-900 dark:text-foreground font-bold" : "text-gray-500 dark:text-muted-foreground"
              )}>
                {s.replace(/-/g, " ")}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              placeholder="Search catalog... (⌘K)"
              className="h-8 pl-9 pr-3 text-sm rounded-lg border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted focus:outline-none focus:ring-2 focus:ring-orange-500 w-64 text-gray-900 dark:text-foreground transition-all"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-border mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-accent relative transition-all active:scale-95">
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 border-2 border-white dark:border-card rounded-full" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-border mx-1" />

          {/* User Identity */}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 pl-2 group hover:bg-gray-50 dark:hover:bg-muted/50 p-1 rounded-xl transition-all active:scale-95"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-900 dark:text-foreground leading-none group-hover:text-orange-500 transition-colors">{session?.user?.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest mt-1 font-black">
                {session?.user?.role ?? "User"}
              </p>
            </div>
            <Avatar className="w-8 h-8 rounded-lg border border-gray-200 dark:border-border group-hover:border-orange-500/50 transition-colors transition-transform group-hover:scale-105">
              <AvatarFallback className="bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground text-xs font-extrabold">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>
      <EditProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

