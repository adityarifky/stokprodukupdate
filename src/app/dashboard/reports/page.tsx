
'use client';

import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar as CalendarIcon, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { format, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CSVLink } from "react-csv";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportData {
    productName: string;
    totalAdded: number;
    totalSubtracted: number;
    netChange: number;
}

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState<Date | DateRange | undefined>(new Date());
    const [filterType, setFilterType] = useState<'daily' | 'range'>('daily');

    useEffect(() => {
        const fetchReportData = async () => {
            if (!db || !date) {
                setReportData([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            let fromDate, toDate;

            if (date instanceof Date) { // Single day
                fromDate = startOfDay(date);
                toDate = endOfDay(date);
            } else if (date?.from) { // Date range
                fromDate = startOfDay(date.from);
                toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);
            } else {
                 setReportData([]);
                 setIsLoading(false);
                 return;
            }
            
            const q = query(
                collection(db, "stock_history"),
                where("timestamp", ">=", fromDate),
                where("timestamp", "<=", toDate)
            );

            const querySnapshot = await getDocs(q);
            const aggregatedData: { [productName: string]: { added: number; subtracted: number } } = {};

            querySnapshot.forEach(doc => {
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

            const formattedReportData = Object.entries(aggregatedData)
                .map(([name, { added, subtracted }]) => ({
                    productName: name,
                    totalAdded: added,
                    totalSubtracted: subtracted,
                    netChange: added - subtracted,
                }))
                .sort((a, b) => a.productName.localeCompare(b.productName));

            setReportData(formattedReportData);
            setIsLoading(false);
        };

        fetchReportData();
    }, [date]);

    const handleFilterChange = (value: 'daily' | 'range') => {
        setFilterType(value);
        if (value === 'daily') {
            setDate(new Date());
        } else {
            setDate({
                from: new Date(),
                to: new Date()
            });
        }
    };
    
    const handleDateSelect = (selectedDate: Date | DateRange | undefined) => {
        setDate(selectedDate);
    };
    
    const csvHeaders = [
        { label: "Produk", key: "productName" },
        { label: "Stok Masuk", key: "totalAdded" },
        { label: "Stok Keluar", key: "totalSubtracted" },
        { label: "Perubahan Bersih", key: "netChange" },
    ];

    const getCsvFilename = () => {
        if (!date) return "laporan-stok.csv";

        if (date instanceof Date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            return `laporan-stok-harian_${formattedDate}.csv`;
        }

        if (date.from) {
            const from = format(date.from, "yyyy-MM-dd");
            if (date.to && format(date.from, 'yyyy-MM-dd') !== format(date.to, 'yyyy-MM-dd')) {
                const to = format(date.to, "yyyy-MM-dd");
                return `laporan-stok_${from}_sampai_${to}.csv`;
            }
            return `laporan-stok-harian_${from}.csv`;
        }

        return "laporan-stok.csv";
    };


    return (
        <main className="p-4 sm:px-6 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                <CardTitle>Laporan Stok</CardTitle>
                            </div>
                            <CardDescription>
                                Analisis penambahan dan pengurangan stok produk untuk periode yang dipilih.
                            </CardDescription>
                        </div>
                         <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2">
                            <Select value={filterType} onValueChange={handleFilterChange as (value: string) => void}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Pilih Tipe Laporan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Laporan Harian</SelectItem>
                                    <SelectItem value="range">Rentang Kustom</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full sm:w-[260px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            filterType === 'daily' && date instanceof Date ? (
                                                format(date, "d LLL y", { locale: id })
                                            ) : filterType === 'range' && !(date instanceof Date) && date?.from ? (
                                                date.to ? (
                                                    <>
                                                        {format(date.from, "d LLL y", { locale: id })} - {format(date.to, "d LLL y", { locale: id })}
                                                    </>
                                                ) : (
                                                    format(date.from, "d LLL y", { locale: id })
                                                )
                                            ) : (
                                                <span>Pilih tanggal</span>
                                            )
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode={filterType}
                                        selected={date as any}
                                        onSelect={handleDateSelect}
                                        locale={id}
                                        numberOfMonths={filterType === 'range' ? 2 : 1}
                                    />
                                </PopoverContent>
                            </Popover>
                            <CSVLink
                                data={reportData}
                                headers={csvHeaders}
                                filename={getCsvFilename()}
                                className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    (isLoading || reportData.length === 0) && "pointer-events-none opacity-50"
                                )}
                                target="_blank"
                                aria-disabled={isLoading || reportData.length === 0}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                <span>Export CSV</span>
                            </CSVLink>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produk</TableHead>
                                <TableHead className="text-center">Stok Masuk</TableHead>
                                <TableHead className="text-center">Stok Keluar</TableHead>
                                <TableHead className="text-center">Perubahan Bersih</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : reportData.length > 0 ? (
                                reportData.map((item) => (
                                    <TableRow key={item.productName}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-center text-green-600 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <ArrowUp className="h-4 w-4" />
                                                {item.totalAdded}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-red-600 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <ArrowDown className="h-4 w-4" />
                                                {item.totalSubtracted}
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-center font-bold",
                                            item.netChange > 0 && "text-green-700",
                                            item.netChange < 0 && "text-red-700",
                                            item.netChange === 0 && "text-muted-foreground"
                                        )}>
                                            <div className="flex items-center justify-center gap-1">
                                                {item.netChange > 0 ? <ArrowUp className="h-4 w-4" /> : item.netChange < 0 ? <ArrowDown className="h-4 w-4" /> : null}
                                                {item.netChange > 0 ? `+${item.netChange}` : item.netChange}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Tidak ada data aktivitas untuk periode yang dipilih.
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
