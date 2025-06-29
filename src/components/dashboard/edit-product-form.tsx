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
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc, DocumentData } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

interface Product extends DocumentData {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
    stock: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama produk harus memiliki setidaknya 2 karakter." }),
  description: z.string().optional(),
  category: z.enum(["Creampuff", "Cheesecake", "Millecrepes", "Minuman", "Snackbox", "Lainnya"], {
    required_error: "Anda harus memilih kategori.",
  }),
  stock: z.coerce.number().min(0, { message: "Stok tidak boleh negatif." }),
  image: z.any().optional(),
});

export function EditProductForm({ product }: { product: Product }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState<string | null>(product.image);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name || "",
            description: product.description || "",
            category: product.category as any,
            stock: product.stock || 0,
            image: undefined,
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
        
        const user = auth?.currentUser;
        if (!user) {
            toast({
                title: "Otentikasi Gagal",
                description: "Sesi Anda tidak valid. Silakan coba masuk lagi.",
                variant: "destructive",
            });
            setIsLoading(false);
            router.push('/');
            return;
        }

        try {
            const productRef = doc(db, "products", product.id);
            const dataToUpdate: any = {
                name: values.name,
                description: values.description,
                category: values.category,
                stock: values.stock,
            };

            // Handle image upload if a new image is provided
            if (values.image instanceof File) {
                const file = values.image;
                const aiHint = file.name.split('.')[0].replace(/[-_]/g, ' ').substring(0, 50);

                // Delete old image from storage if it's not a placeholder
                if (product.image && !product.image.includes('placehold.co')) {
                    try {
                        const oldImageRef = ref(storage, product.image);
                        await deleteObject(oldImageRef);
                    } catch (e) {
                         console.warn("Could not delete old image, it might not exist.", e)
                    }
                }
                
                // Upload new image
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(storageRef);

                dataToUpdate.image = imageUrl;
                dataToUpdate.aiHint = aiHint;
            }

            await updateDoc(productRef, dataToUpdate);
            
            toast({
                title: "Produk Berhasil Diperbarui",
                description: `${values.name} telah diperbarui.`,
            });
            
            router.push('/dashboard/products');

        } catch (error: any) {
            console.error("Gagal memperbarui produk:", error);
            toast({
                title: "Gagal Memperbarui Produk",
                description: error.message || "Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
                                            <SelectItem value="Cheesecake">Cheesecake</SelectItem>
                                            <SelectItem value="Millecrepes">Millecrepes</SelectItem>
                                            <SelectItem value="Minuman">Minuman</SelectItem>
                                            <SelectItem value="Snackbox">Snackbox</SelectItem>
                                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stok</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
