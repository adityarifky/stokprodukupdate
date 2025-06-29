'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, doc, runTransaction, query, onSnapshot, DocumentData, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, Check, Plus, Minus } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  productId: z.string({ required_error: "Anda harus memilih produk." }),
  operation: z.enum(["add", "subtract"], { required_error: "Anda harus memilih operasi." }),
  quantity: z.coerce.number().min(1, { message: "Jumlah harus minimal 1." }),
});

interface Product {
    id: string;
    name: string;
    stock: number;
    category: string;
}

export function UpdateStockForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [isProductListLoading, setIsProductListLoading] = React.useState(true);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
    const [isProductPopoverOpen, setIsProductPopoverOpen] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            operation: "add",
            quantity: 1,
        },
    });

    React.useEffect(() => {
        if (!db) {
            setIsProductListLoading(false);
            return;
        }
        const q = query(collection(db, "products"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: Product[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
            
            const uniqueCategories = [...new Set(productsData.map(p => p.category))].sort();
            setCategories(uniqueCategories);

            setIsProductListLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setIsProductListLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredProducts = React.useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') {
            return products;
        }
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        form.resetField("productId", { defaultValue: undefined });
    };
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        if (!db || !auth.currentUser) {
            toast({ title: "Database tidak tersedia atau Anda tidak login", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        const { productId, operation, quantity } = values;
        const productRef = doc(db, "products", productId);

        try {
            const newStock = await runTransaction(db, async (transaction) => {
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw new Error("Produk tidak ditemukan!");
                }

                const currentStock = productDoc.data().stock || 0;
                let updatedStock = currentStock;

                if (operation === "add") {
                    updatedStock += quantity;
                } else { // subtract
                    if (currentStock < quantity) {
                        throw new Error("Stok tidak mencukupi untuk dikurangi.");
                    }
                    updatedStock -= quantity;
                }
                
                transaction.update(productRef, { stock: updatedStock });
                return updatedStock;
            });
            
            const selectedProduct = products.find(p => p.id === productId);
            const userName = localStorage.getItem('userName') || "Pengguna Tidak Dikenal";

            await addDoc(collection(db, "stock_history"), {
                productId: productId,
                productName: selectedProduct?.name || 'N/A',
                operation: operation,
                quantity: quantity,
                stockAfter: newStock,
                userId: auth.currentUser.uid,
                userName: userName,
                timestamp: serverTimestamp(),
            });
            
            toast({
                title: "Stok Berhasil Diperbarui",
                description: `Stok untuk ${selectedProduct?.name} telah diubah.`,
            });
            
            router.push('/dashboard/products');

        } catch (error: any) {
            console.error("Gagal memperbarui stok:", error);
            toast({
                title: "Gagal Memperbarui Stok",
                description: error.message || "Terjadi kesalahan saat memperbarui stok.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isProductListLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end gap-2 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormItem>
                    <FormLabel>Pilih Kategori</FormLabel>
                     <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori untuk memfilter..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Pilih kategori untuk mempermudah pencarian produk.
                    </FormDescription>
                </FormItem>

                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Pilih Produk</FormLabel>
                            <Popover open={isProductPopoverOpen} onOpenChange={setIsProductPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? filteredProducts.find((p) => p.id === field.value)?.name
                                                : "Pilih produk..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari produk..." />
                                        <CommandList>
                                            <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredProducts.map((product) => (
                                                    <CommandItem
                                                        value={product.name}
                                                        key={product.id}
                                                        onSelect={() => {
                                                            form.setValue("productId", product.id);
                                                            setIsProductPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                product.id === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {product.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Pilih produk yang stoknya ingin Anda perbarui.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="operation"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tambah Stok Atau Kurangin Stok?</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="add" id="add" />
                                        </FormControl>
                                        <Label htmlFor="add" className="flex items-center gap-2 font-normal cursor-pointer">
                                            <Plus className="h-4 w-4" /> Penambahan Stok
                                        </Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="subtract" id="subtract" />
                                        </FormControl>
                                        <Label htmlFor="subtract" className="flex items-center gap-2 font-normal cursor-pointer">
                                            <Minus className="h-4 w-4" /> Pengurangan Stok
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="cth. 10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Memproses..." : "Update Stok"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
