"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";

export function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'incomplete' | 'complete'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/');
        setStatus('unauthenticated');
        return;
      }
      
      const profileSetupComplete = localStorage.getItem('profileSetupComplete');
      if (profileSetupComplete !== 'true') {
        router.replace('/profile-setup');
        setStatus('incomplete');
      } else {
        setStatus('complete');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (status !== 'complete') {
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

  return <>{children}</>;
}
