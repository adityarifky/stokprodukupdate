'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, DocumentData, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Product {
    id: string;
    name: string;
    image: string;
    aiHint: string;
    stock: number;
}

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
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

    const handleDeleteProduct = async (product: Product) => {
        if (!db || !storage) return;
        try {
            // Delete the document from Firestore
            await deleteDoc(doc(db, "products", product.id));

            // Delete the image from Storage, unless it's a placeholder
            if (product.image && !product.image.includes('placehold.co')) {
                const imageRef = ref(storage, product.image);
                await deleteObject(imageRef);
            }

            toast({
                title: "Produk Dihapus",
                description: `${product.name} telah berhasil dihapus.`,
            });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast({
                title: "Gagal Menghapus Produk",
                description: "Terjadi kesalahan saat menghapus produk.",
                variant: "destructive",
            });
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Produk Satuan</CardTitle>
                        <CardDescription>
                            Kelola produk Anda dan lihat inventarisnya.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/products/add">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>
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
                            <TableHead className="text-right">Aksi</TableHead>
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
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
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
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button asChild variant="outline" size="icon" className="h-8 w-8">
                                                <Link href={`/dashboard/products/edit/${product.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Hapus</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk secara permanen dari database.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProduct(product)}>Hapus</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Tidak ada produk untuk ditampilkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
