'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, DocumentData, orderBy } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    image: string;
    aiHint: string;
    stock: number;
}

export default function CategoryDetailPage() {
    const params = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const categoryName = params.category ? decodeURIComponent(params.category as string) : '';

    useEffect(() => {
        if (!db || !categoryName) {
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, "products"), 
            where("category", "==", categoryName),
            orderBy("name", "asc")
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: Product[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
            setIsLoading(false);
        }, (error) => {
            console.error(`Error fetching ${categoryName} products:`, error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [categoryName]);
    
    return (
        <main className="p-4 sm:px-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Button asChild variant="outline" size="icon" className="h-7 w-7">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Kembali</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Detail Stok: {categoryName}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Produk</CardTitle>
                    <CardDescription>
                        Berikut adalah semua produk dalam kategori {categoryName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Gambar</span>
                                </TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Skeleton className="h-10 w-10 rounded-md" />
                                        </TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Avatar className="h-10 w-10 rounded-md">
                                                <AvatarImage src={product.image} alt={product.name} data-ai-hint={product.aiHint}/>
                                                <AvatarFallback className="rounded-md">{product.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock > 20 ? 'outline' : product.stock > 0 ? 'secondary' : 'destructive'}>
                                                {product.stock > 20 ? 'Tersedia' : product.stock > 0 ? 'Stok Sedikit' : 'Stok Habis'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{product.stock}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Tidak ada produk untuk ditampilkan di kategori ini.
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
