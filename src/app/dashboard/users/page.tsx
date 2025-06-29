'use client';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { collection, query, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/dashboard/chat-dialog";

interface User {
  id: string;
  name: string;
  position: string;
  status: 'Online' | 'Offline';
  avatar: string;
}

export default function UsersStatusPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingAvatar, setViewingAvatar] = useState<User | null>(null);
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!db) {
        setIsLoading(false);
        return;
    }

    const usersQuery = query(collection(db, "users"));
    
    const unsubscribe: Unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            usersData.push({
                id: doc.id,
                name: data.name || 'N/A',
                position: data.position || 'N/A',
                status: data.status === 'online' ? 'Online' : 'Offline',
                avatar: data.avatarUrl || '',
            });
        });
        setUsers(usersData);
        
        if (auth.currentUser) {
            const currentUserData = usersData.find(u => u.id === auth.currentUser!.uid);
            if (currentUserData) {
                setCurrentUser(currentUserData);
            }
        }
        
        setIsLoading(false);
    }, (error) => {
        console.error("Gagal mengambil data pengguna:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Dialog open={!!viewingAvatar} onOpenChange={(isOpen) => !isOpen && setViewingAvatar(null)}>
        <main className="p-4 sm:px-6 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Status Pengguna</CardTitle>
              <CardDescription>
                Lihat daftar pengguna dan status online mereka saat ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Curhat?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-9 w-9 rounded-full" />
                              <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : users.length > 0 ? (
                    users.map((user) => {
                      const isCurrentUser = user.id === auth.currentUser?.uid;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                <DialogTrigger asChild>
                                  <button 
                                    type="button" 
                                    onClick={() => setViewingAvatar(user)} 
                                    disabled={!user.avatar} 
                                    className="disabled:cursor-not-allowed rounded-full"
                                  >
                                    <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  </button>
                                </DialogTrigger>
                                <div className="flex flex-col">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.position}</div>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  user.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                              )} />
                              <span className="text-sm text-muted-foreground">{user.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setChattingWith(user)}
                                  disabled={isCurrentUser}
                              >
                                  Curhat
                              </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Tidak ada pengguna untuk ditampilkan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        {viewingAvatar && (
          <DialogContent className="p-0 border-0 max-w-fit bg-transparent shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Foto Profil {viewingAvatar.name}</DialogTitle>
              <DialogDescription>Tampilan foto profil dalam ukuran penuh.</DialogDescription>
            </DialogHeader>
            <img
              src={viewingAvatar.avatar}
              alt={`Foto Profil ${viewingAvatar.name}`}
              className="max-w-[80vw] max-h-[80vh] rounded-lg object-contain"
            />
          </DialogContent>
        )}
      </Dialog>

      <ChatDialog
        currentUser={currentUser}
        otherUser={chattingWith}
        open={!!chattingWith}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setChattingWith(null);
          }
        }}
      />
    </>
  );
}
