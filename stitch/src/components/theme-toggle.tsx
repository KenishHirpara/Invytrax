"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 p-1.5" aria-hidden="true">
        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
