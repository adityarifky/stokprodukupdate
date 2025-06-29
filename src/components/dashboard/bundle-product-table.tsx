'use client';

import { useEffect, useState } from 'react';
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
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, DocumentData, doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { BundleFormDialog } from './bundle-form-dialog';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface Product {
    id: string;
    name: string;
}

interface Bundle {
    id: string;
    name: string;
    price: number;
    productIds: string[];
}

export function BundleProductTable() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "products"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: Product[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }
        const q = query(collection(db, "bundles"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bundlesData: Bundle[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                bundlesData.push({ id: doc.id, ...doc.data() } as Bundle);
            });
            setBundles(bundlesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching bundles:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleAddBundle = () => {
        setEditingBundle(null);
        setIsDialogOpen(true);
    };

    const handleEditBundle = (bundle: Bundle) => {
        setEditingBundle(bundle);
        setIsDialogOpen(true);
    };

    const handleDeleteBundle = async (bundleId: string) => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, "bundles", bundleId));
        } catch (error) {
            console.error("Error deleting bundle:", error);
        }
    };

    const getProductNames = (productIds: string[]) => {
        return productIds.map(id => {
            const product = products.find(p => p.id === id);
            return product ? product.name : 'Produk Dihapus';
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Produk Bundling</CardTitle>
                            <CardDescription>
                                Kelola paket produk bundling Anda.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddBundle}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Bundel
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Bundling</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Produk Termasuk</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(2)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : bundles.length > 0 ? (
                                bundles.map((bundle) => (
                                    <TableRow key={bundle.id}>
                                        <TableCell className="font-medium">{bundle.name}</TableCell>
                                        <TableCell>Rp {bundle.price.toLocaleString('id-ID')}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {getProductNames(bundle.productIds).map((name, index) => (
                                                    <Badge key={index} variant="secondary">{name}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditBundle(bundle)}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
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
                                                            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus bundel secara permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteBundle(bundle.id)}>Hapus</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Belum ada bundel yang dibuat.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <BundleFormDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                products={products}
                bundle={editingBundle}
            />
        </>
    );
}
