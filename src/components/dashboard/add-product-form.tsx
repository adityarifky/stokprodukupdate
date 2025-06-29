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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama produk harus memiliki setidaknya 2 karakter." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Harga tidak boleh negatif." }),
  stock: z.coerce.number().int().min(0, { message: "Stok tidak boleh negatif." }),
  category: z.enum(["Creampuff", "Minuman", "Kue", "Lainnya"], {
    required_error: "Anda harus memilih kategori.",
  }),
  image: z.any().optional(),
});

export function AddProductForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        console.log("Form values:", values);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Fitur Dalam Pengembangan",
            description: "Penyimpanan produk ke database belum diimplementasikan.",
        });
        
        setIsLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Produk</FormLabel>
                                    <FormControl>
                                        <Input placeholder="cth. Velvet Red Creampuff" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Deskripsi singkat tentang produk..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Jelaskan produk Anda secara singkat. (Opsional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori produk" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Creampuff">Creampuff</SelectItem>
                                            <SelectItem value="Minuman">Minuman</SelectItem>
                                            <SelectItem value="Kue">Kue</SelectItem>
                                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga (Rp)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="cth. 25000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stok Awal</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="cth. 50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gambar Produk</FormLabel>
                                    <FormControl>
                                        <div 
                                            className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center text-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {imagePreview ? (
                                                <Image src={imagePreview} alt="Pratinjau" width={200} height={200} className="object-contain h-full w-full" />
                                            ) : (
                                                <div className="text-muted-foreground">
                                                    <Upload className="mx-auto h-10 w-10" />
                                                    <p className="mt-2 text-sm">Klik untuk mengunggah</p>
                                                    <p className="text-xs">PNG atau JPG</p>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/products')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Produk"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
