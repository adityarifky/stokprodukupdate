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
                      <TableCell><Skeleton className="h-9 w-40" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
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
  );
}
