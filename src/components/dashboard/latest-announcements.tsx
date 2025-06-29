'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { BellRing } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface Announcement {
    id: string;
    title: string;
    timestamp: string;
}

export function LatestAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(3));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const announcementsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.timestamp as Timestamp;
                return {
                    id: doc.id,
                    title: data.title || 'Tanpa Judul',
                    timestamp: timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
                };
            });
            setAnnouncements(announcementsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground rounded-md border border-dashed">
                <BellRing className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Tidak Ada Pengumuman</p>
                <p className="text-sm">Saat ini belum ada pengumuman baru.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ul className="space-y-2">
                {announcements.map((announcement) => (
                    <li key={announcement.id} className="flex items-start gap-4 p-2 hover:bg-muted/50 rounded-lg">
                        <div className="mt-1 p-2 bg-secondary rounded-full">
                           <BellRing className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold leading-snug">{announcement.title}</p>
                            <p className="text-xs text-muted-foreground">{announcement.timestamp}</p>
                        </div>
                    </li>
                ))}
            </ul>
             <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/announcements">
                    Lihat Semua Pengumuman
                </Link>
            </Button>
        </div>
    );
}
