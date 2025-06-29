'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

interface Reply {
    id: string;
    text: string;
    authorName: string;
    authorAvatar: string;
    timestamp: string;
}

interface AnnouncementRepliesProps {
    announcementId: string;
}

export function AnnouncementReplies({ announcementId }: AnnouncementRepliesProps) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newReply, setNewReply] = useState('');

    useEffect(() => {
        if (!db || !announcementId) {
            setIsLoading(false);
            return;
        }

        const repliesQuery = query(
            collection(db, 'announcements', announcementId, 'replies'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
            const repliesData = snapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.timestamp as Timestamp;
                return {
                    id: doc.id,
                    text: data.text || '',
                    authorName: data.authorName || 'User',
                    authorAvatar: data.authorAvatar || '',
                    timestamp: timestamp ? new Date(timestamp.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A',
                };
            });
            setReplies(repliesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching replies:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [announcementId]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !auth.currentUser || !db) return;

        const userName = localStorage.getItem('userName') || 'Anonymous';
        const avatarUrl = localStorage.getItem('avatarUrl') || '';

        try {
            await addDoc(collection(db, 'announcements', announcementId, 'replies'), {
                text: newReply,
                authorId: auth.currentUser.uid,
                authorName: userName,
                authorAvatar: avatarUrl,
                timestamp: serverTimestamp(),
            });
            setNewReply('');
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    return (
        <div className="pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Balasan</h4>
            <Separator />
            {isLoading ? (
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>
            ) : replies.length > 0 ? (
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="space-y-4">
                        {replies.map(reply => (
                            <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-start gap-3"
                            >
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-semibold text-sm">{reply.authorName}</p>
                                        <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                                    </div>
                                    <p className="text-sm text-foreground">{reply.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-xs text-center text-muted-foreground py-2">Belum ada balasan.</p>
            )}
             <form onSubmit={handleReplySubmit} className="flex items-center gap-2 pt-2">
                <Input
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Tulis balasan..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newReply.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Kirim</span>
                </Button>
            </form>
        </div>
    );
}
