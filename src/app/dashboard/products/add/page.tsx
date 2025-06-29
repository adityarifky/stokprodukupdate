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
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AddNewProductPage() {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user && db) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().position === 'Management') {
                        setIsAllowed(true);
                    } else {
                        setIsAllowed(false);
                    }
                } catch {
                    setIsAllowed(false);
                }
            } else {
                setIsAllowed(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (isAllowed === null) {
        return (
            <main className="p-4 sm:px-6 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </main>
        );
    }

    if (isAllowed === false) {
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
