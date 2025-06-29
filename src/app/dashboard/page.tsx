"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { LatestAnnouncements } from "@/components/dashboard/latest-announcements";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, DocumentData, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Cake, Layers, CupSoda, Package, ShoppingBasket, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { name: 'Creampuff', icon: Utensils },
  { name: 'Cheesecake', icon: Cake },
  { name: 'Millecrepes', icon: Layers },
  { name: 'Minuman', icon: CupSoda },
  { name: 'Snackbox', icon: Package },
  { name: 'Lainnya', icon: ShoppingBasket },
];

interface StockData {
    [key: string]: number;
}

interface StockChartData {
  name: string;
  subtracted: number;
}

export default function DashboardPage() {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [stockChartData, setStockChartData] = useState<StockChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString('id-ID', options));
    }, []);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        };

        const q = query(collection(db, "products"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const counts: StockData = categories.reduce((acc, category) => {
                acc[category.name] = 0;
                return acc;
            }, {} as StockData);

            snapshot.forEach(doc => {
                const product = doc.data() as { category: string; stock: number };
                const categoryName = product.category;
                if (categoryName && counts.hasOwnProperty(categoryName)) {
                    counts[categoryName] += product.stock || 0;
                }
            });
            
            setStockData(counts);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching product data:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!db) {
            setIsLoadingChart(false);
            return;
        }

        const q = query(
            collection(db, "stock_history"),
            where("operation", "==", "subtract")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subtractedData: { [productName: string]: number } = {};

            snapshot.forEach(doc => {
                const activity = doc.data();
                if (activity.productName) {
                    subtractedData[activity.productName] = (subtractedData[activity.productName] || 0) + (activity.quantity || 0);
                }
            });

            const formattedChartData = Object.entries(subtractedData)
                .map(([name, subtracted]) => ({ name, subtracted }))
                .sort((a, b) => b.subtracted - a.subtracted)
                .slice(0, 7);

            setStockChartData(formattedChartData);
            setIsLoadingChart(false);
        }, (error) => {
            console.error("Error fetching stock history for chart:", error);
            setIsLoadingChart(false);
        });

        return () => unsubscribe();
    }, []);

    const renderStockCount = (categoryName: string) => {
        if (isLoading) {
            return <Skeleton className="h-8 w-16" />;
        }
        const count = stockData?.[categoryName] ?? 0;
        return <div className="text-2xl font-bold">{count}</div>;
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-6">
        {categories.map((category) => (
            <Link key={category.name} href={`/dashboard/products/${encodeURIComponent(category.name)}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="relative overflow-hidden h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                    <category.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {renderStockCount(category.name)}
                    <p className="text-xs text-muted-foreground">
                        {currentDate || '\u00A0'}
                    </p>
                  </CardContent>
                  <motion.div
                      className="absolute bottom-4 right-4 text-xs text-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                      }}
                  >
                      Klik untuk melihat detail
                  </motion.div>
                </Card>
              </motion.div>
            </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Megaphone className="h-6 w-6"/>
                Pengumuman
            </CardTitle>
            <CardDescription>
              Informasi dan pembaruan terbaru dari tim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LatestAnnouncements />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ringkasan Grafik Stok</CardTitle>
             <CardDescription>
              Grafik 7 produk teratas yang stoknya paling sering berkurang.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingChart ? (
                <div className="flex justify-center items-center min-h-[240px]">
                    <Skeleton className="h-full w-full" />
                </div>
            ) : (
                <Overview data={stockChartData} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
