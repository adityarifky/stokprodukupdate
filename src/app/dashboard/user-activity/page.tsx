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

interface Activity {
    id: string;
    name: string;
    position: string;
    loginTime: string;
    ip: string;
    avatar: string;
}

export default function UserActivityPage() {
  const [userActivity, setUserActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchActivity = async () => {
          if (!db) {
              setIsLoading(false);
              return;
          };
          
          try {
              const activityQuery = query(collection(db, "user-activity"), orderBy("loginTime", "desc"));
              const querySnapshot = await getDocs(activityQuery);
              const activities = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  const loginTime = data.loginTime as Timestamp;
                  return {
                      id: doc.id,
                      name: data.name || 'N/A',
                      position: data.position || 'N/A',
                      loginTime: loginTime ? new Date(loginTime.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A',
                      ip: data.ip || 'N/A',
                      avatar: data.avatar || '',
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

  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
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
                      <TableCell><Skeleton className="h-9 w-32" /></TableCell>
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
