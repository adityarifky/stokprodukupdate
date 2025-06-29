
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
import { db } from "@/lib/firebase";
import { collection, query, orderBy, Timestamp, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Activity {
    id: string;
    name: string;
    position: string;
    loginTime: string;
    ip: string;
    avatar: string;
}

interface ActivityTableProps {
  isManagement: boolean;
}

function ActivityTable({ isManagement }: ActivityTableProps) {
    const [userActivity, setUserActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Guard: Jika pengguna bukan Management, jangan pernah coba membuat query.
        // Ini juga menangani kasus ketika prop isManagement berubah dari true menjadi false.
        if (!isManagement) {
            setIsLoading(false);
            setUserActivity([]); // Kosongkan data jika ada sisa dari sesi sebelumnya
            return;
        }

        setIsLoading(true);
        const activityQuery = query(collection(db, "user-activity"), orderBy("loginTime", "desc"));
        const unsubscribe = onSnapshot(activityQuery, (activitySnapshot) => {
            const activities = activitySnapshot.docs.map(doc => {
                const data = doc.data();
                const loginTime = data.loginTime as Timestamp;
                return {
                    id: doc.id,
                    name: data.name || 'Pengguna Tidak Dikenal',
                    position: data.position || 'N/A',
                    loginTime: loginTime ? new Date(loginTime.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A',
                    ip: data.ip || 'N/A',
                    avatar: data.avatar || '',
                };
            });
            setUserActivity(activities);
            setIsLoading(false);
        }, (error) => {
            // Error ini sekarang jauh lebih kecil kemungkinannya terjadi.
            console.error("Snapshot listener error on user-activity:", error);
            setIsLoading(false);
        });
        
        // Cleanup function ini sekarang terikat dengan prop isManagement.
        // Jika prop berubah, listener lama akan dibersihkan sebelum effect baru dijalankan.
        return () => unsubscribe();
    }, [isManagement]); // <-- Dependensi krusial ditambahkan

    if (isLoading) {
        return (
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead className="hidden sm:table-cell">Posisi</TableHead>
                    <TableHead className="hidden md:table-cell">Waktu Login</TableHead>
                    <TableHead className="text-right">Alamat IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead className="hidden sm:table-cell">Posisi</TableHead>
                <TableHead className="hidden md:table-cell">Waktu Login</TableHead>
                <TableHead className="text-right">Alamat IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivity.length > 0 ? (
                userActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={activity.avatar} alt={activity.name} />
                              <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{activity.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{activity.position}</TableCell>
                    <TableCell className="hidden md:table-cell">{activity.loginTime}</TableCell>
                    <TableCell className="text-right">{activity.ip}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada aktivitas untuk ditampilkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
    )
}

export default function UserActivityPage() {
  const { isManagement, loading } = useAuth();

  if (loading) {
    return (
        <main className="p-4 sm:px-6 md:p-8">
            <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-72" /></CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
            </Card>
        </main>
    );
  }

  if (!isManagement) {
    return (
        <main className="p-4 sm:px-6 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Akses Ditolak
                    </CardTitle>
                    <CardDescription>
                        Anda tidak memiliki izin untuk melihat halaman ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Hanya pengguna dengan posisi 'Management' yang dapat mengakses riwayat aktivitas login. Silakan hubungi admin jika Anda merasa ini adalah sebuah kesalahan.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
  }

  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Login</CardTitle>
          <CardDescription>
            Lacak siapa saja yang login dan kapan mereka masuk ke sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ActivityTable isManagement={isManagement} />
        </CardContent>
      </Card>
    </main>
  );
}
