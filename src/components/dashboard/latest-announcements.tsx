'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { BellRing } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
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
                    content: data.content || '',
                    author: data.author || 'Admin',
                    timestamp: timestamp ? new Date(timestamp.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A',
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
            <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                        <div className="space-y-2 pt-2">
                           <Skeleton className="h-4 w-full rounded-md" />
                           <Skeleton className="h-4 w-5/6 rounded-md" />
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
            <div className="space-y-6">
                {announcements.map((announcement, index) => (
                   <React.Fragment key={announcement.id}>
                        {index > 0 && <Separator />}
                        <div>
                            <h3 className="font-semibold leading-snug">{announcement.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                {`Diterbitkan oleh ${announcement.author} pada ${announcement.timestamp}`}
                            </p>
                            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                                {announcement.content}
                            </div>
                        </div>
                   </React.Fragment>
                ))}
            </div>
             <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/announcements">
                    Lihat Semua Pengumuman
                </Link>
            </Button>
        </div>
    );
}
