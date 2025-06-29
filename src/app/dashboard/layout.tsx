'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userPosition, setUserPosition] = useState("");
  const [userStory, setUserStory] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleProfileUpdate = () => {
    setUserName(localStorage.getItem("userName") || "");
    setUserPosition(localStorage.getItem("userPosition") || "");
    setUserStory(localStorage.getItem("userStory") || "");
    setAvatarUrl(localStorage.getItem("avatarUrl") || "");
  };

  useEffect(() => {
    // Initial load from local storage to prevent flicker on page refresh.
    handleProfileUpdate();

    let unsubscribe: Unsubscribe | undefined;

    // The auth state is already handled by ProfileSetupGuard,
    // so we can assume auth.currentUser is available.
    if (auth.currentUser && db) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const newName = userData.name || "";
          const newPosition = userData.position || "";
          const newStory = userData.story || "";
          const newAvatar = userData.avatarUrl || "";

          // Update state to re-render the UI with the latest data
          setUserName(newName);
          setUserPosition(newPosition);
          setUserStory(newStory);
          setAvatarUrl(newAvatar);

          // Also update localStorage to keep it in sync for the next initial load.
          localStorage.setItem('userName', newName);
          localStorage.setItem('userPosition', newPosition);
          localStorage.setItem('userStory', newStory);
          localStorage.setItem('avatarUrl', newAvatar);
        }
      });
    }

    // Cleanup the listener when the component unmounts.
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount.
  
  const onProfileUpdate = () => {
    const newAvatarUrl = localStorage.getItem("avatarUrl") || "";
    const newStory = localStorage.getItem("userStory") || "";
    
    if(auth.currentUser && db) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        // This update will be picked up by the onSnapshot listener,
        // which will then update the state and UI automatically.
        updateDoc(userRef, { 
          avatarUrl: newAvatarUrl,
          story: newStory,
        });
    }
  }

  const handleLogout = async () => {
    try {
      if (auth.currentUser && db) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
            status: 'offline'
        });
      }
      await signOut(auth);
      localStorage.removeItem('userName');
      localStorage.removeItem('userPosition');
      localStorage.removeItem('profileSetupComplete');
      localStorage.removeItem('avatarUrl');
      localStorage.removeItem('userStory');
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
              story={userStory}
              avatarUrl={avatarUrl} 
              onProfileUpdate={onProfileUpdate}
              isProfileDialogOpen={isProfileDialogOpen}
              onProfileDialogOpenChange={setProfileDialogOpen}
              onLogout={handleLogout}
            />
        </header>
        <main className="flex-1 pb-16">
            <ProfileSetupGuard onProfileComplete={handleProfileUpdate}>{children}</ProfileSetupGuard>
        </main>
        <BottomNav 
          isProfileDialogOpen={isProfileDialogOpen}
          onProfileDialogOpenChange={setProfileDialogOpen}
        />
    </div>
  );
}
