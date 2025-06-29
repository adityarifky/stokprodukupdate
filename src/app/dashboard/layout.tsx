'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("");
  const [userPosition, setUserPosition] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleProfileUpdate = () => {
    setUserName(localStorage.getItem("userName") || "");
    setUserPosition(localStorage.getItem("userPosition") || "");
    setAvatarUrl(localStorage.getItem("avatarUrl") || "");
  };

  useEffect(() => {
    handleProfileUpdate();
  }, []);
  
  const onAvatarChange = () => {
    setAvatarUrl(localStorage.getItem("avatarUrl") || "");
  }

  return (
    <SidebarProvider>
        <DashboardSidebar name={userName} position={userPosition} avatarUrl={avatarUrl} />
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 md:justify-end">
                <div className="flex items-center gap-4 md:hidden">
                    <SidebarTrigger />
                    <Link href="/dashboard" className="flex items-center">
                        <Image
                            src="/Logo Dreampuff.png"
                            alt="Dreampuff Logo"
                            width={160}
                            height={40}
                            priority
                        />
                    </Link>
                </div>
                <UserNav name={userName} position={userPosition} avatarUrl={avatarUrl} onAvatarChange={onAvatarChange} />
            </header>
            <div className="flex flex-1 flex-col">
                <main className="flex-1">
                    <ProfileSetupGuard onProfileComplete={handleProfileUpdate}>{children}</ProfileSetupGuard>
                </main>
                <div className="md:hidden">
                    <BottomNav />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
