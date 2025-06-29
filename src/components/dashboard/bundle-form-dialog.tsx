'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

interface BundleFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    products: Product[];
    bundle: Bundle | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama bundel harus memiliki setidaknya 2 karakter." }),
  price: z.coerce.number().min(0, { message: "Harga harus angka positif." }),
  productIds: z.array(z.string()).min(1, { message: "Pilih setidaknya satu produk." }),
});

export function BundleFormDialog({ isOpen, onOpenChange, products, bundle }: BundleFormDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            productIds: [],
        },
    });

    React.useEffect(() => {
        if (isOpen) {
            if (bundle) {
                form.reset({
                    name: bundle.name,
                    price: bundle.price,
                    productIds: bundle.productIds,
                });
            } else {
                form.reset({
                    name: "",
                    price: 0,
                    productIds: [],
                });
            }
        }
    }, [bundle, isOpen, form]);

    const handleClose = () => {
        onOpenChange(false);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        if (!db) {
            toast({ title: "Database tidak tersedia", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            if (bundle) {
                const bundleRef = doc(db, "bundles", bundle.id);
                await updateDoc(bundleRef, { ...values });
                toast({ title: "Bundel Berhasil Diperbarui" });
            } else {
                await addDoc(collection(db, "bundles"), {
                    ...values,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Bundel Berhasil Ditambahkan" });
            }
            handleClose();
        } catch (error) {
            console.error("Gagal menyimpan bundel:", error);
            toast({ title: "Gagal Menyimpan Bundel", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
                if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
                    e.preventDefault();
                }
            }}>
                <DialogHeader>
                    <DialogTitle>{bundle ? "Edit Bundel" : "Tambah Bundel Baru"}</DialogTitle>
                    <DialogDescription>
                        Isi detail di bawah ini untuk {bundle ? "memperbarui" : "membuat"} paket bundel.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Bundel</FormLabel>
                                    <FormControl>
                                        <Input placeholder="cth. Paket Hemat A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Harga Bundel</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="cth. 50000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="productIds"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Produk</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-auto min-h-10",
                                                        !field.value?.length && "text-muted-foreground"
                                                    )}
                                                >
                                                    <div className="flex gap-1 flex-wrap">
                                                        {field.value?.length > 0 ? field.value.map(id => {
                                                            const product = products.find(p => p.id === id);
                                                            return <Badge variant="secondary" key={id}>{product?.name || id}</Badge>
                                                        }) : "Pilih produk..."}
                                                    </div>
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
                                                        {products.map((product) => (
                                                            <CommandItem
                                                                value={product.name}
                                                                key={product.id}
                                                                onSelect={() => {
                                                                    const selectedIds = field.value || [];
                                                                    const newSelectedIds = selectedIds.includes(product.id)
                                                                        ? selectedIds.filter(id => id !== product.id)
                                                                        : [...selectedIds, product.id];
                                                                    form.setValue("productIds", newSelectedIds);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value?.includes(product.id)
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
