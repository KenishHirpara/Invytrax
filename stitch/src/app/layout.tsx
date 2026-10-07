import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoreInventory | Warehouse Management System",
  description: "Real-time inventory management for small-to-medium businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="core-inventory-theme">
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
