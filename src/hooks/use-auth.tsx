'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile extends DocumentData {
    id: string;
    name: string;
    position: 'Management' | 'Kitchen' | 'Kasir' | '';
    story: string;
    avatarUrl: string;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isManagement: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isManagement: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (newUser) => {
            if (newUser) {
                // User is signed in. Go into a loading state until the new user's profile is fetched.
                setLoading(true);
                setUser(newUser);
                const userDocRef = doc(db, 'users', newUser.uid);

                // Set up a new snapshot listener for the new user.
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const profile: UserProfile = {
                            id: docSnap.id,
                            name: data.name || '',
                            position: data.position || '',
                            story: data.story || '',
                            avatarUrl: data.avatarUrl || '',
                        };
                        setUserProfile(profile);
                         // This is now the SINGLE SOURCE OF TRUTH for localStorage
                        localStorage.setItem('userName', profile.name);
                        localStorage.setItem('userPosition', profile.position);
                        localStorage.setItem('avatarUrl', profile.avatarUrl);
                        localStorage.setItem('userStory', profile.story);
                        localStorage.setItem('profileSetupComplete', 'true');
                    } else {
                        // User exists in auth, but not in firestore (first time setup)
                        setUserProfile(null);
                        // Clean up any potential stale data and flag that setup is needed
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userPosition');
                        localStorage.removeItem('avatarUrl');
                        localStorage.removeItem('userStory');
                        localStorage.setItem('profileSetupComplete', 'false');
                    }
                    // Stop loading AFTER profile is fetched/checked
                    setLoading(false);
                }, (error) => {
                    console.error("Auth context snapshot error:", error);
                    setUserProfile(null);
                    setLoading(false);
                });

                // Return the cleanup function for the snapshot listener
                return () => unsubscribeSnapshot();
            } else {
                // User is signed out.
                setUser(null);
                setUserProfile(null);
                setLoading(false);
                localStorage.clear(); // Clear all data on logout
                router.replace('/');
            }
        });

        // Return the cleanup function for the auth state listener
        return () => unsubscribe();
    }, [router]);

    const isManagement = userProfile?.position === 'Management';

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isManagement }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
