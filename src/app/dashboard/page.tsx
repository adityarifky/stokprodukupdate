"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, CakeSlice, Package, PackageCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { ProductStockTable } from "@/components/dashboard/product-stock-table";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    setCurrentDate(today.toLocaleDateString('id-ID', options));
  }, []);
  
  const cardAnimation = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95 },
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <motion.div {...cardAnimation}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk Terdaftar</CardTitle>
              <CakeSlice className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                {currentDate || "Memuat tanggal..."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...cardAnimation}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stok Creampuff</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                {currentDate || "Memuat tanggal..."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...cardAnimation}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sisa Stok Creampuff</CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  {currentDate || "Memuat tanggal..."}
                </p>
              </CardContent>
            </Card>
        </motion.div>
        <motion.div {...cardAnimation}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Sekarang</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                {currentDate || "Memuat tanggal..."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
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
