"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { ProductStockTable } from "@/components/dashboard/product-stock-table";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Cake, Layers, CupSoda, Package, ShoppingBasket } from "lucide-react";
import { motion } from "framer-motion";

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

export default function DashboardPage() {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <motion.div
              key={category.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                  <category.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {renderStockCount(category.name)}
                  <p className="text-xs text-muted-foreground">
                      Total stok tersedia.
                  </p>
                </CardContent>
                <motion.div
                    className="absolute bottom-4 right-4 text-xs text-muted-foreground"
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
        ))}
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
