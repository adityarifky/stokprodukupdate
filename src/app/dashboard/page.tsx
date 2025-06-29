
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
import { Utensils, Cake, Layers, CupSoda, Package, ShoppingBasket, Megaphone, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


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
  added: number;
  subtracted: number;
}

export default function DashboardPage() {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [stockChartData, setStockChartData] = useState<StockChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [filterType, setFilterType] = useState('weekly');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfWeek(new Date(), { locale: id }),
        to: endOfWeek(new Date(), { locale: id }),
    });

    const handleFilterChange = (value: string) => {
        setFilterType(value);
        const now = new Date();
        if (value === 'daily') {
            setDateRange({ from: startOfDay(now), to: endOfDay(now) });
        } else if (value === 'weekly') {
            setDateRange({ from: startOfWeek(now, { locale: id }), to: endOfWeek(now, { locale: id }) });
        } else if (value === 'monthly') {
            setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        }
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range) {
            setFilterType('custom');
        }
    };

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
        if (!db || !dateRange?.from) {
            setIsLoadingChart(false);
            return;
        }

        setIsLoadingChart(true);
        
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

        const q = query(
            collection(db, "stock_history"),
            where("timestamp", ">=", fromDate),
            where("timestamp", "<=", toDate)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const aggregatedData: { [productName: string]: { added: number; subtracted: number } } = {};

            snapshot.forEach(doc => {
                const activity = doc.data();
                if (activity.productName) {
                    if (!aggregatedData[activity.productName]) {
                        aggregatedData[activity.productName] = { added: 0, subtracted: 0 };
                    }
                    if (activity.operation === 'add') {
                        aggregatedData[activity.productName].added += activity.quantity || 0;
                    } else if (activity.operation === 'subtract') {
                        aggregatedData[activity.productName].subtracted += activity.quantity || 0;
                    }
                }
            });

            const formattedChartData = Object.entries(aggregatedData)
                .map(([name, { added, subtracted }]) => ({ name, added, subtracted }))
                .sort((a, b) => (b.subtracted + b.added) - (a.subtracted + a.added))
                .slice(0, 7);

            setStockChartData(formattedChartData);
            setIsLoadingChart(false);
        }, (error) => {
            console.error("Error fetching stock history for chart:", error);
            setIsLoadingChart(false);
        });

        return () => unsubscribe();
    }, [dateRange]);

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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="font-headline">Ringkasan Grafik Stok</CardTitle>
                        <CardDescription>
                          Grafik aktivitas stok masuk dan keluar untuk 7 produk teratas.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Select value={filterType} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-full sm:w-[120px]">
                                <SelectValue placeholder="Pilih Rentang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Harian</SelectItem>
                                <SelectItem value="weekly">Mingguan</SelectItem>
                                <SelectItem value="monthly">Bulanan</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full sm:w-[260px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "d LLL y", { locale: id })} - {format(dateRange.to, "d LLL y", { locale: id })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "d LLL y", { locale: id })
                                        )
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={handleDateSelect}
                                    numberOfMonths={2}
                                    locale={id}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
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

