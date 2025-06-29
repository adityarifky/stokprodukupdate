
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
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CakeSlice className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">SweetStock</h2>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref>
              <SidebarMenuButton asChild tooltip="Dasbor" isActive={pathname === '/dashboard'}>
                <>
                  <Home />
                  <span>Dasbor</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Produk">
                 <>
                  <Package />
                  <span>Produk</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Laporan">
                <>
                  <BarChart2 />
                  <span>Laporan</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Pengaturan">
                <>
                  <Settings />
                  <span>Pengaturan</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
