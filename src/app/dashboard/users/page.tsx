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
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

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
        setIsLoading(false);
    }, (error) => {
        console.error("Gagal mengambil data pengguna:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
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
                  <TableHead className="text-right">Status</TableHead>
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
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : users.length > 0 ? (
                  users.map((user) => (
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={cn(
                              "h-2 w-2 rounded-full animate-pulse",
                              user.status === 'Online' ? 'bg-green-500' : 'bg-slate-400'
                          )} />
                          <span className="text-sm text-muted-foreground">{user.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
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
  );
}
