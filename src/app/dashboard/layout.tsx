'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userPosition, setUserPosition] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userName');
      localStorage.removeItem('userPosition');
      localStorage.removeItem('profileSetupComplete');
      localStorage.removeItem('avatarUrl');
      router.push('/');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <Link href="/dashboard" className="flex items-center">
                <Image
                    src="/Logo Dreampuff.png"
                    alt="Dreampuff Logo"
                    width={160}
                    height={40}
                    priority
                />
            </Link>
            <UserNav 
              name={userName} 
              position={userPosition} 
              avatarUrl={avatarUrl} 
              onAvatarChange={onAvatarChange}
              isProfileDialogOpen={isProfileDialogOpen}
              onProfileDialogOpenChange={setProfileDialogOpen}
              onLogout={handleLogout}
            />
        </header>
        <main className="flex-1 pb-16">
            <ProfileSetupGuard onProfileComplete={handleProfileUpdate}>{children}</ProfileSetupGuard>
        </main>
        <BottomNav 
          name={userName} 
          position={userPosition} 
          onProfileClick={() => setProfileDialogOpen(true)} 
          onLogout={handleLogout} 
        />
    </div>
  );
}
