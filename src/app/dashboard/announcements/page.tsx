'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from '@/components/ui/skeleton';
import { BellRing } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    author: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));

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

    return (
        <main className="p-4 sm:px-6 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Papan Pengumuman</CardTitle>
                    <CardDescription>
                        Informasi dan pengumuman penting untuk semua tim.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-3 border p-4 rounded-md">
                                    <Skeleton className="h-6 w-3/4 rounded-md" />
                                    <Skeleton className="h-4 w-1/2 rounded-md" />
                                </div>
                            ))}
                        </div>
                    ) : announcements.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {announcements.map((announcement) => (
                                <AccordionItem value={announcement.id} key={announcement.id}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-3 text-left">
                                          <BellRing className="h-5 w-5 text-primary flex-shrink-0" />
                                          <div className="flex flex-col items-start">
                                            <span className="font-semibold">{announcement.title}</span>
                                            <span className="text-xs text-muted-foreground">{`Diterbitkan oleh ${announcement.author} pada ${announcement.timestamp}`}</span>
                                          </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap pl-8">
                                            {announcement.content}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground rounded-md border border-dashed">
                             <BellRing className="h-12 w-12 mb-4" />
                            <p className="text-lg font-semibold">Tidak Ada Pengumuman</p>
                            <p className="text-sm">Saat ini belum ada pengumuman baru.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
