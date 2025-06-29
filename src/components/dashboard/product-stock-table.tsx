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

const products = [
    { id: '1', name: 'Velvet Red Cake', category: 'Cakes', stock: 15, image: 'https://placehold.co/64x64.png', aiHint: 'red cake' },
    { id: '2', name: 'Chocolate Lava Cake', category: 'Cakes', stock: 25, image: 'https://placehold.co/64x64.png', aiHint: 'chocolate cake' },
    { id: '3', name: 'Macarons (Box of 6)', category: 'Pastries', stock: 50, image: 'https://placehold.co/64x64.png', aiHint: 'colorful macarons' },
    { id: '4', name: 'Classic Tiramisu', category: 'Pudding', stock: 5, image: 'https://placehold.co/64x64.png', aiHint: 'tiramisu slice' },
    { id: '5', name: 'Lemon Meringue Tart', category: 'Tarts', stock: 0, image: 'https://placehold.co/64x64.png', aiHint: 'lemon tart' },
    { id: '6', name: 'Strawberry Cheesecake', category: 'Cheesecakes', stock: 32, image: 'https://placehold.co/64x64.png', aiHint: 'strawberry cheesecake' },
]

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
                {products.map((product) => (
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
                ))}
            </TableBody>
        </Table>
    )
}
