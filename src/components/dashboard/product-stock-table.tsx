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

const products: any[] = []

export function ProductStockTable() {
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
                {products.length > 0 ? (
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
