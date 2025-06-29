'use client';

import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

interface ChatDialogProps {
  currentUser: User | null;
  otherUser: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ currentUser, otherUser, open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    if (!currentUser || !otherUser || !db) return;

    const chatId = getChatId(currentUser.id, otherUser.id);
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser, otherUser]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
            viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages, open]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUser || !db) return;

    const chatId = getChatId(currentUser.id, otherUser.id);
    const chatDocRef = doc(db, 'chats', chatId);

    try {
        const chatDocSnap = await getDoc(chatDocRef);
        if (!chatDocSnap.exists()) {
            await setDoc(chatDocRef, {
                participants: [currentUser.id, otherUser.id],
                participantInfo: {
                    [currentUser.id]: { name: currentUser.name, avatar: currentUser.avatar },
                    [otherUser.id]: { name: otherUser.name, avatar: otherUser.avatar },
                },
                lastMessageTimestamp: serverTimestamp(),
            });
        }

        const messagesColRef = collection(chatDocRef, 'messages');
        await addDoc(messagesColRef, {
          text: newMessage,
          senderId: currentUser.id,
          timestamp: serverTimestamp(),
        });
        
        await setDoc(chatDocRef, { lastMessageTimestamp: serverTimestamp() }, { merge: true });

        fetch('/api/send-notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Pesan baru dari ${currentUser.name}`,
                content: newMessage,
                targetUserId: otherUser.id,
                link: '/dashboard/users'
            })
        }).catch(err => console.error("Gagal mengirim notifikasi chat:", err));

        setNewMessage('');
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  if (!otherUser || !currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto,1fr,auto] p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {otherUser.name}
          </DialogTitle>
           <DialogDescription className="sr-only">
            Chat with {otherUser.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
           <div className="p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex items-end gap-2 w-full',
                            msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {msg.senderId !== currentUser.id && (
                            <Avatar className="h-8 w-8 self-start">
                                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                                'max-w-[75%] rounded-lg px-3 py-2 text-sm break-words',
                                msg.senderId === currentUser.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {msg.text}
                        </div>
                        {msg.senderId === currentUser.id && (
                            <Avatar className="h-8 w-8 self-start">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
           </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Kirim</span>
                </Button>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
