
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Package, DollarSign, History, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { ProductStockTable } from "@/components/dashboard/product-stock-table";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts?: number;
  totalSales?: number;
  totalActivities?: number;
  totalUsers?: number;
}

const salesData = [
    { invoice: "INV001", status: "Lunas", method: "Kartu Kredit", total: "Rp 250.000" },
    { invoice: "INV002", status: "Tertunda", method: "Transfer Bank", total: "Rp 150.000" },
    { invoice: "INV003", status: "Lunas", method: "GoPay", total: "Rp 350.000" },
    { invoice: "INV004", status: "Dibatalkan", method: "OVO", total: "Rp 75.000" },
    { invoice: "INV005", status: "Lunas", method: "Kartu Kredit", total: "Rp 450.000" },
    { invoice: "INV006", status: "Lunas", method: "GoPay", total: "Rp 120.000" },
    { invoice: "INV007", status: "Tertunda", method: "Kartu Debit", total: "Rp 90.000" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const totalSales = salesData.reduce((acc, sale) => {
        if (sale.status === 'Lunas') {
            return acc + parseInt(sale.total.replace(/Rp|\.| /g, ''));
        }
        return acc;
    }, 0);

    const unsubscribes: (() => void)[] = [];
    const queries = [
        { key: 'totalProducts', collectionName: 'products' },
        { key: 'totalUsers', collectionName: 'users' },
        { key: 'totalActivities', collectionName: 'user-activity' }
    ];

    let loadedQueries = 0;

    queries.forEach(({ key, collectionName }) => {
        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setStats(prev => ({ ...prev, [key]: snapshot.size, totalSales }));
            
            if (isLoading && loadedQueries < queries.length) {
                loadedQueries++;
                if (loadedQueries === queries.length) {
                    setIsLoading(false);
                }
            }
        }, (error) => {
            console.error(`Error fetching ${collectionName} count:`, error);
             if (isLoading && loadedQueries < queries.length) {
                loadedQueries++;
                if (loadedQueries === queries.length) {
                    setIsLoading(false);
                }
            }
        });
        unsubscribes.push(unsubscribe);
    });
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [isLoading]);
  
  const cardAnimation = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95 },
  };

  const renderStat = (value: number | undefined, isCurrency = false) => {
    if (isLoading) return <Skeleton className="h-8 w-16" />;
    const displayValue = value ?? 0;
    if (isCurrency) {
        return <div className="text-2xl font-bold">Rp{displayValue.toLocaleString('id-ID')}</div>;
    }
    return <div className="text-2xl font-bold">{displayValue}</div>;
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Link href="/dashboard/products">
          <motion.div 
            className="relative"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manajemen Produk</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalProducts)}
                <p className="text-xs text-muted-foreground">
                  Kelola produk, stok, dan bundel.
                </p>
              </CardContent>
            </Card>
            <div
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </div>
          </motion.div>
        </Link>
        <Link href="/dashboard/sales-details">
          <motion.div 
            className="relative"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Laporan Penjualan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalSales, true)}
                <p className="text-xs text-muted-foreground">
                  Lihat riwayat transaksi penjualan.
                </p>
              </CardContent>
            </Card>
            <div
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </div>
          </motion.div>
        </Link>
        <Link href="/dashboard/user-activity">
          <motion.div 
            className="relative"
            {...cardAnimation}
          >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktivitas Pengguna</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {renderStat(stats?.totalActivities)}
                  <p className="text-xs text-muted-foreground">
                    Lacak aktivitas login pengguna.
                  </p>
                </CardContent>
              </Card>
              <div
                className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
              >
                Klik untuk melihat detail
              </div>
          </motion.div>
        </Link>
        <Link href="/dashboard/users">
          <motion.div
            className="relative"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Pengguna</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalUsers)}
                <p className="text-xs text-muted-foreground">
                  Lihat status online pengguna.
                </p>
              </CardContent>
            </Card>
            <div
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </div>
          </motion.div>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Stok Produk</CardTitle>
            <CardDescription>
              Gambaran umum tingkat inventaris saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductStockTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Penjualan Mingguan</CardTitle>
             <CardDescription>
              Ringkasan kinerja penjualan Anda minggu ini.
            </CardDescription>
          </Header>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
