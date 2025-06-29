'use client';

import { AddProductForm } from "@/components/dashboard/add-product-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddNewProductPage() {
    const [userPosition, setUserPosition] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const position = localStorage.getItem("userPosition");
        setUserPosition(position);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <main className="p-4 sm:px-6 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </main>
        );
    }

    if (userPosition !== 'Management') {
        return (
            <main className="p-4 sm:px-6 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                            Akses Ditolak
                        </CardTitle>
                        <CardDescription>
                            Anda tidak memiliki izin untuk mengakses halaman ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Hanya pengguna dengan posisi 'Management' yang dapat menambah produk baru.
                        </p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="p-4 sm:px-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button asChild variant="outline" size="icon" className="h-7 w-7">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Kembali</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Tambah Produk Baru
                    </h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Produk</CardTitle>
                        <CardDescription>
                            Isi informasi di bawah ini untuk menambahkan produk baru. Stok awal akan diatur ke 0.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AddProductForm />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
