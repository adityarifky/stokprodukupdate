
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
import { PlusCircle } from "lucide-react";

const products: any[] = []

export default function ProductsPage() {
    return (
        <main className="p-4 sm:px-6 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Produk</CardTitle>
                            <CardDescription>
                                Kelola produk Anda dan lihat inventarisnya.
                            </CardDescription>
                        </div>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Produk
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
                                <TableHead className="hidden md:table-cell">Harga</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
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
                                        <TableCell className="hidden md:table-cell">{product.price}</TableCell>
                                        <TableCell className="text-right font-medium">{product.stock}</TableCell>
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
        </main>
    );
}
