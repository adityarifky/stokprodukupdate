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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [permissionStatus, setPermissionStatus] = useState<'loading' | 'complete'>('loading');

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserName(userData.name || "");
            setUserPosition(userData.position || "");
            setUserStory(userData.story || "");
            setAvatarUrl(userData.avatarUrl || "");
        }
    }
  };

  useEffect(() => {
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
            
            setPermissionStatus('complete'); // Buka gerbang setelah peran dikonfirmasi
          } else {
            // User diautentikasi tetapi belum memiliki dokumen profil (pengaturan pertama kali)
            // ProfileSetupGuard akan menanganinya.
            setPermissionStatus('complete');
          }
        }, (error) => {
            console.error("Gagal memuat data pengguna:", error);
            // Pertimbangkan untuk mengarahkan pengguna ke halaman error atau login ulang
            setPermissionStatus('complete');
        });
      } else {
        // Tidak ada pengguna yang login, ProfileSetupGuard akan mengarahkan ke halaman utama
        setPermissionStatus('loading');
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
      localStorage.clear(); // Hapus semua data lokal untuk sesi yang bersih
      router.push('/');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  const renderContent = () => {
    if (permissionStatus === 'loading') {
      return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto pb-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8">
                <Skeleton className="h-96 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
            </div>
        </div>
      );
    }
    return <ProfileSetupGuard onProfileComplete={handleProfileUpdate}>{children}</ProfileSetupGuard>;
  }

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
            {renderContent()}
        </main>
        <BottomNav 
          isProfileDialogOpen={isProfileDialogOpen}
          onProfileDialogOpenChange={setProfileDialogOpen}
          userPosition={userPosition}
        />
    </div>
  );
}
