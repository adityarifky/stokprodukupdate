"use client";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  CakeSlice,
  Home,
  Package,
  BarChart2,
  Settings,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardSidebar({ name, position, avatarUrl }: { name?: string; position?: string; avatarUrl?: string; }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CakeSlice className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">Dreampuff</h2>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref>
              <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/products" passHref>
              <SidebarMenuButton tooltip="Produk" isActive={pathname.startsWith('/dashboard/products')}>
                <Package />
                <span>Produk</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton tooltip="Laporan">
                <BarChart2 />
                <span>Laporan</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
            <SidebarMenuItem>
             <Link href="#" passHref>
              <SidebarMenuButton tooltip="Pengaturan">
                <Settings />
                <span>Pengaturan</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3 p-1 rounded-md">
            <Avatar className="h-9 w-9 border">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback>
                    <User className="h-5 w-5" />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0">
                <p className="text-sm font-medium leading-none truncate">{name || "Pengguna"}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                    {position || "Posisi"}
                </p>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
