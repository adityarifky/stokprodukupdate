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
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

interface Activity {
    id: string;
    name: string;
    position: string;
    loginTime: string;
    ip: string;
    avatar: string;
}

interface UserData {
    name: string;
    position: string;
    avatar: string;
}

export default function UserActivityPage() {
  const [userActivity, setUserActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<string | null>(null);

  useEffect(() => {
      const position = localStorage.getItem("userPosition");
      setUserPosition(position);

      if (position !== 'Management') {
          setIsLoading(false);
          return;
      }

      const fetchActivity = async () => {
          if (!db) {
              setIsLoading(false);
              return;
          };
          
          try {
              const usersQuery = query(collection(db, "users"));
              const usersSnapshot = await getDocs(usersQuery);
              const usersMap = new Map<string, UserData>();
              usersSnapshot.forEach(doc => {
                  const data = doc.data();
                  usersMap.set(doc.id, {
                      name: data.name || 'N/A',
                      position: data.position || 'N/A',
                      avatar: data.avatarUrl || '',
                  });
              });

              const activityQuery = query(collection(db, "user-activity"), orderBy("loginTime", "desc"));
              const activitySnapshot = await getDocs(activityQuery);
              
              const activities = activitySnapshot.docs.map(doc => {
                  const data = doc.data();
                  const loginTime = data.loginTime as Timestamp;
                  const userDetails = usersMap.get(data.userId) || { name: data.name || 'Pengguna Tidak Dikenal', position: data.position || 'N/A', avatar: data.avatar || '' };

                  return {
                      id: doc.id,
                      name: userDetails.name,
                      position: userDetails.position,
                      loginTime: loginTime ? new Date(loginTime.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A',
                      ip: data.ip || 'N/A',
                      avatar: userDetails.avatar,
                  };
              });
              setUserActivity(activities);
          } catch (error) {
              console.error("Error fetching user activity:", error);
          } finally {
              setIsLoading(false);
          }
      };

      fetchActivity();
  }, []);

  if (userPosition && userPosition !== 'Management') {
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
              {isLoading ? (
                <>
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
                </>
              ) : userActivity.length > 0 ? (
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
        </CardContent>
      </Card>
    </main>
  );
}
