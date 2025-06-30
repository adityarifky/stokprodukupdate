'use client';

import { UserNav } from "@/components/dashboard/user-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProfileSetupForm } from "@/components/auth/profile-setup-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db, messaging } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getToken, onMessage } from "firebase/messaging";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const { user, userProfile, loading, logout } = useAuth();
  
  const isProfileSetupComplete = !!userProfile;

  const onProfileUpdateDialog = async () => {
    if(auth.currentUser && db && userProfile) {
        const newAvatarUrl = localStorage.getItem("avatarUrl") || userProfile.avatarUrl;
        const newStory = localStorage.getItem("userStory") || userProfile.story;
        
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { 
              avatarUrl: newAvatarUrl,
              story: newStory,
            });
            // The onSnapshot in useAuth will handle the state update automatically
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    }
  }

  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging && user) {
        unsubscribeOnMessage = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            toast({
                title: payload.notification?.title || "Notifikasi Baru",
                description: payload.notification?.body || "",
            });
        });

        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            getToken(messaging).then(async (currentToken) => {
              if (currentToken) {
                const userRef = doc(db, 'users', user.uid);
                // Check against firestore data, not just local state, to be sure
                if (userProfile && (userProfile as any).fcmToken !== currentToken) {
                  await updateDoc(userRef, { fcmToken: currentToken });
                }
              }
            }).catch((err) => console.error('An error occurred while retrieving token.', err));
          }
        });
    }
    return () => {
      if (unsubscribeOnMessage) unsubscribeOnMessage();
    };
  }, [toast, user, userProfile]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold">Memuat Sesi...</h1>
            <p className="text-muted-foreground">Harap tunggu sebentar.</p>
        </div>
      </div>
    );
  }
  
  if (!isProfileSetupComplete && user) {
     return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 blur-sm pointer-events-none">
                <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto pb-2">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-8">
                    <Skeleton className="h-96 rounded-lg" />
                    <Skeleton className="h-96 rounded-lg" />
                </div>
            </div>
            
            <Dialog open={true} modal={true}>
              <DialogContent
                hideCloseButton
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="bg-transparent p-0 border-none shadow-none w-full max-w-md flex items-center justify-center"
              >
                <DialogHeader className="sr-only">
                  <DialogTitle>Absen dulu ya guys</DialogTitle>
                  <DialogDescription>Sebelum melanjutkan, dimohon untuk berikan nama dan posisi yang sesuai yess.</DialogDescription>
                </DialogHeader>
                <ProfileSetupForm />
              </DialogContent>
            </Dialog>
        </>
    );
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
              name={userProfile?.name} 
              position={userProfile?.position} 
              story={userProfile?.story}
              avatarUrl={userProfile?.avatarUrl} 
              onProfileUpdate={onProfileUpdateDialog}
              isProfileDialogOpen={isProfileDialogOpen}
              onProfileDialogOpenChange={setProfileDialogOpen}
              onLogout={logout}
            />
        </header>
        <main className="flex-1 pb-16">
            {children}
        </main>
        <BottomNav 
          isProfileDialogOpen={isProfileDialogOpen}
          onProfileDialogOpenChange={setProfileDialogOpen}
          userPosition={userProfile?.position || null}
        />
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardAppLayout>{children}</DashboardAppLayout>
    </AuthProvider>
  )
}
