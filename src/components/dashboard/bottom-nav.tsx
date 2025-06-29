"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dasbor", icon: Home },
  { href: "#", label: "Produk", icon: Package },
  { href: "#", label: "Laporan", icon: BarChart2 },
  { href: "#", label: "Pengaturan", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="sticky bottom-0 z-40 mt-auto w-full border-t bg-background/95 backdrop-blur-sm">
      <nav className="flex h-16 items-center justify-center gap-10 px-4 sm:gap-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              pathname === item.href && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
