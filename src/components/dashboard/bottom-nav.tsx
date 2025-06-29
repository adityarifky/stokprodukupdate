"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/products", label: "Produk", icon: Package },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm">
      <nav className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/dashboard/user-activity"
          className={cn(
            "flex flex-col items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
            pathname.startsWith("/dashboard/user-activity") && "text-primary"
          )}
        >
          <User className="h-5 w-5" />
          <span className="truncate">Pengguna</span>
        </Link>
      </nav>
    </footer>
  );
}
