'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
    id: string;
    name: string;
    category: string;
    image: string;
    aiHint: string;
    stock: number;
}

export function ProductStockTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: Product[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);


    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Makanan Penutup</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="hidden h-10 w-10 sm:flex rounded-md" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-10 w-10 sm:flex rounded-md">
                                        <AvatarImage src={product.image} alt={product.name} data-ai-hint={product.aiHint}/>
                                        <AvatarFallback className="rounded-md">{product.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{product.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{product.category}</TableCell>
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
                            Tidak ada produk untuk ditampilkan.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
