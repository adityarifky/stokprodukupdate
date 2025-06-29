'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db, messaging } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, type Unsubscribe, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getToken, onMessage } from "firebase/messaging";

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
  const { toast } = useToast();

  const handleProfileUpdate = () => {
    setUserName(localStorage.getItem("userName") || "");
    setUserPosition(localStorage.getItem("userPosition") || "");
    setUserStory(localStorage.getItem("userStory") || "");
    setAvatarUrl(localStorage.getItem("avatarUrl") || "");
  };

  useEffect(() => {
    handleProfileUpdate();

    let unsubscribeOnMessage: (() => void) | undefined;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
        unsubscribeOnMessage = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            toast({
                title: payload.notification?.title || "Notifikasi Baru",
                description: payload.notification?.body || "",
            });
        });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      let unsubscribeSnapshot: Unsubscribe | undefined;

      if (user && db) {
        if (messaging) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              getToken(messaging).then(async (currentToken) => {
                if (currentToken) {
                  const userRef = doc(db, 'users', user.uid);
                  const docSnap = await getDoc(userRef);
                  if (docSnap.exists() && docSnap.data().fcmToken !== currentToken) {
                    await updateDoc(userRef, { fcmToken: currentToken });
                  }
                }
              }).catch((err) => console.error('An error occurred while retrieving token.', err));
            }
          });
        }

        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const newName = userData.name || "";
            const newPosition = userData.position || "";
            const newStory = userData.story || "";
            const newAvatar = userData.avatarUrl || "";

            setUserName(newName);
            setUserPosition(newPosition);
            setUserStory(newStory);
            setAvatarUrl(newAvatar);

            localStorage.setItem('userName', newName);
            localStorage.setItem('userPosition', newPosition);
            localStorage.setItem('userStory', newStory);
            localStorage.setItem('avatarUrl', newAvatar);
          }
        });
      }

      return () => {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      };
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOnMessage) unsubscribeOnMessage();
    };
  }, [toast]);
  
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
            status: 'offline',
            fcmToken: ""
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4">
            <Link href="/dashboard" className="flex items-center">
                <Image
                    src="/Logo Dreampuff.png"
                    alt="Dreampuff Logo"
                    width={140}
                    height={35}
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
