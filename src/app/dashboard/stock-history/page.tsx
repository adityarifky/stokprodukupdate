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
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface StockActivity {
    id: string;
    productName: string;
    operation: 'add' | 'subtract';
    quantity: number;
    stockAfter: number;
    userName: string;
    timestamp: string;
}

export default function StockHistoryPage() {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setIsLoading(false);
        return;
    }

    const q = query(collection(db, "stock_history"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.timestamp as Timestamp;
            return {
                id: doc.id,
                productName: data.productName || 'N/A',
                operation: data.operation,
                quantity: data.quantity,
                stockAfter: data.stockAfter,
                userName: data.userName || 'N/A',
                timestamp: timestamp ? new Date(timestamp.seconds * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A',
            };
        });
        setActivities(activitiesData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching stock history:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Stok</CardTitle>
          <CardDescription>
            Catatan semua penambahan dan pengurangan stok produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Produk</TableHead>
                <TableHead className="text-center">Aktivitas</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Jumlah</TableHead>
                <TableHead className="hidden md:table-cell text-center">Stok Akhir</TableHead>
                <TableHead className="hidden md:table-cell text-center">Tanggal</TableHead>
                <TableHead className="text-center">Nama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                        <TableCell className="hidden sm:table-cell text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                        <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                        <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-5 w-32 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    </TableRow>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium text-center">{activity.productName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={activity.operation === 'add' ? 'default' : 'destructive'} className="w-[105px] justify-center">
                        {activity.operation === 'add' ? 'Penambahan' : 'Pengurangan'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">{activity.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">{activity.stockAfter}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">{activity.timestamp}</TableCell>
                    <TableCell className="text-center">{activity.userName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada riwayat stok.
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
