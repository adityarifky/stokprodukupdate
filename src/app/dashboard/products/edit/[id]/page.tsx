'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProductForm } from "@/components/dashboard/edit-product-form";
import { useAuth } from "@/hooks/use-auth";

interface Product extends DocumentData {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
    aiHint: string;
    stock: number;
}

export default function EditProductPage() {
    const params = useParams();
    const { id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [isFetchingProduct, setIsFetchingProduct] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { isManagement, loading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return; // Wait for auth check to complete
        if (!isManagement) {
            setIsFetchingProduct(false);
            return;
        };
        
        if (!id || typeof id !== 'string') {
             setIsFetchingProduct(false);
             setError("ID produk tidak valid.");
             return;
        }

        const fetchProduct = async () => {
            if (!db) return;
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                } else {
                    setError("Produk tidak ditemukan.");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Gagal memuat produk.");
            } finally {
                setIsFetchingProduct(false);
            }
        };

        fetchProduct();
    }, [id, isManagement, isAuthLoading]);

    const renderContent = () => {
        if (isAuthLoading || isFetchingProduct) {
            return (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-full max-w-sm" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="lg:col-span-1">
                                <Skeleton className="aspect-square w-full rounded-lg" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-28" />
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (!isManagement) {
             return (
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
                            Hanya pengguna dengan posisi 'Management' yang dapat mengedit produk.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        if (error) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            );
        }

        if (product) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Detail Produk</CardTitle>
                        <CardDescription>
                            Lakukan perubahan pada produk Anda di bawah ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditProductForm product={product} />
                    </CardContent>
                </Card>
            );
        }

        return null;
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
                        Edit Produk
                    </h1>
                </div>
                {renderContent()}
            </div>
        </main>
    );
}
