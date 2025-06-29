
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Boxes, CakeSlice, Package, PackageCheck, PackageMinus, Trophy } from "lucide-react";
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
import { collection, onSnapshot, query, DocumentData } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  totalCreampuffStock: number;
  totalOtherStock: number;
  bestSellingProduct: string;
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    setCurrentDate(today.toLocaleDateString('id-ID', options));
    
    if (!db) {
      setIsLoading(false);
      return;
    }

    const productsQuery = query(collection(db, "products"));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      let totalCreampuffStock = 0;
      let totalOtherStock = 0;
      let bestSeller = { name: "N/A", stock: -1 };
      
      const products: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
          products.push(doc.data());
      });

      products.forEach(product => {
        if (product.category === 'Creampuff') {
          totalCreampuffStock += product.stock || 0;
        } else {
          totalOtherStock += product.stock || 0;
        }
        if (product.stock > bestSeller.stock) {
            bestSeller = { name: product.name, stock: product.stock };
        }
      });

      setStats({
        totalProducts: querySnapshot.size,
        totalCreampuffStock,
        totalOtherStock,
        bestSellingProduct: querySnapshot.empty ? "N/A" : bestSeller.name,
      });
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching dashboard stats:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const cardAnimation = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95 },
  };
  
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const renderStat = (value: number | undefined) => {
    if (isLoading) return <Skeleton className="h-8 w-16" />;
    return <div className="text-2xl font-bold">{value ?? 0}</div>;
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Link href="/dashboard/products">
          <motion.div 
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk Terdaftar</CardTitle>
                <CakeSlice className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalProducts)}
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
            <motion.div
              variants={overlayVariants}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </motion.div>
          </motion.div>
        </Link>
        <Link href="/dashboard/products">
          <motion.div 
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stok Creampuff</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalCreampuffStock)}
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
            <motion.div
              variants={overlayVariants}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </motion.div>
          </motion.div>
        </Link>
        <Link href="/dashboard/products">
          <motion.div 
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sisa Stok Creampuff</CardTitle>
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {renderStat(stats?.totalCreampuffStock)}
                  <p className="text-xs text-muted-foreground">
                    {currentDate || "Memuat tanggal..."}
                  </p>
                </CardContent>
              </Card>
              <motion.div
                variants={overlayVariants}
                className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
              >
                Klik untuk melihat detail
              </motion.div>
          </motion.div>
        </Link>
        <Link href="/dashboard/products">
          <motion.div
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stok Produk Lainnya</CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalOtherStock)}
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
            <motion.div
              variants={overlayVariants}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </motion.div>
          </motion.div>
        </Link>
        <Link href="/dashboard/products">
          <motion.div
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sisa Stok Produk Lainnya</CardTitle>
                <PackageMinus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderStat(stats?.totalOtherStock)}
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
            <motion.div
              variants={overlayVariants}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </motion.div>
          </motion.div>
        </Link>
        <Link href="/dashboard/products">
          <motion.div
            className="relative"
            initial="hidden"
            whileHover="visible"
            {...cardAnimation}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-7 w-40" /> : <div className="text-lg font-bold">{stats?.bestSellingProduct ?? "N/A"}</div>}
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
            <motion.div
              variants={overlayVariants}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none"
            >
              Klik untuk melihat detail
            </motion.div>
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
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
