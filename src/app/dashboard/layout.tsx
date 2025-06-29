'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import Link from "next/link";
import Image from "next/image";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("");
  const [userPosition, setUserPosition] = useState("");

  const handleProfileUpdate = () => {
    setUserName(localStorage.getItem("userName") || "");
    setUserPosition(localStorage.getItem("userPosition") || "");
  };

  useEffect(() => {
    handleProfileUpdate();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/Logo Dreampuff.png"
            alt="Dreampuff Logo"
            width={192}
            height={48}
            priority
          />
        </Link>
        <div className="ml-auto">
          <UserNav name={userName} position={userPosition} />
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <ProfileSetupGuard onProfileComplete={handleProfileUpdate}>{children}</ProfileSetupGuard>
      </main>
      <BottomNav />
    </div>
  );
}
