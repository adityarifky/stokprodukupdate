"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { ProfileSetupForm } from "./profile-setup-form";

export function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'incomplete' | 'complete'>('loading');

  const handleProfileSetupComplete = () => {
    setStatus('complete');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/');
        setStatus('unauthenticated');
        return;
      }
      
      const profileSetupComplete = localStorage.getItem('profileSetupComplete');
      if (profileSetupComplete !== 'true') {
        setStatus('incomplete');
      } else {
        setStatus('complete');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                <Skeleton className="lg:col-span-2 h-96 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
            </div>
        </div>
    );
  }

  if (status === 'incomplete') {
    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 blur-sm pointer-events-none">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                    <Skeleton className="lg:col-span-2 h-96 rounded-lg" />
                    <Skeleton className="h-96 rounded-lg" />
                </div>
            </div>
            
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <ProfileSetupForm onComplete={handleProfileSetupComplete} />
            </div>
        </>
    );
  }

  return <>{children}</>;
}
