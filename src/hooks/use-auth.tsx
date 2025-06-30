'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData, setDoc, serverTimestamp, addDoc, collection, updateDoc, getDoc } from 'firebase/firestore';
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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isManagement: false,
    logout: async () => {},
});

// Helper function to get IP, moved here for centralization
const getIpAddress = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'N/A';
    } catch (ipError) {
        console.error("Gagal mengambil IP:", ipError);
        return 'N/A';
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(async () => {
        if (auth.currentUser && db) {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            // Ensure document exists before trying to update it
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                await updateDoc(userDocRef, {
                    status: 'offline',
                    fcmToken: ""
                }).catch(e => console.error("Failed to update user status on logout:", e));
            }
        }
        await auth.signOut();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
            if (newUser) {
                // User is signed in.
                if (newUser.uid !== user?.uid) { // Only run full logic for a *new* user session
                    setLoading(true);
                    setUser(newUser);

                    const userDocRef = doc(db, 'users', newUser.uid);
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
                            localStorage.setItem('userName', profile.name);
                            localStorage.setItem('userPosition', profile.position);
                            localStorage.setItem('avatarUrl', profile.avatarUrl);
                            localStorage.setItem('userStory', profile.story);
                            
                            router.replace('/dashboard');
                        } else {
                            // User exists in auth, but not in firestore (first time setup)
                            setUserProfile(null);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Auth context snapshot error:", error);
                        setUserProfile(null);
                        setLoading(false);
                    });

                    // Log activity only after confirming profile exists
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        await updateDoc(userDocRef, {
                            status: 'online',
                            lastLogin: serverTimestamp()
                        });
                        await addDoc(collection(db, "user-activity"), {
                            userId: newUser.uid,
                            name: userDoc.data().name,
                            position: userDoc.data().position,
                            loginTime: serverTimestamp(),
                            ip: await getIpAddress(),
                            avatar: userDoc.data().avatarUrl || ''
                        });
                    }
                    
                    return () => unsubscribeSnapshot();
                }
            } else {
                // User is signed out.
                setUser(null);
                setUserProfile(null);
                localStorage.clear();
                router.replace('/');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router, user]);

    const isManagement = userProfile?.position === 'Management';

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isManagement, logout }}>
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
