"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Users, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/user-activity", label: "Aktivitas", icon: Users },
];

export function BottomNav({
  name,
  position,
  onProfileClick,
  onLogout,
}: {
  name?: string;
  position?: string;
  onProfileClick: () => void;
  onLogout: () => void;
}) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              )}
            >
              <User className="h-5 w-5" />
              <span className="truncate">Pengguna</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 mb-2"
            align="end"
            side="top"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {name || "Pengguna"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {position || "Posisi"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={onProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </footer>
  );
}
