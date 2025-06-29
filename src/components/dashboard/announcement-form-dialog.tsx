'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
}

interface AnnouncementFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    announcement: Omit<Announcement, 'timestamp'> | null;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Judul harus memiliki setidaknya 2 karakter." }),
  content: z.string().min(10, { message: "Konten harus memiliki setidaknya 10 karakter." }),
});

export function AnnouncementFormDialog({ isOpen, onOpenChange, announcement }: AnnouncementFormDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    });

    React.useEffect(() => {
        if (isOpen) {
            if (announcement) {
                form.reset({
                    title: announcement.title,
                    content: announcement.content,
                });
            } else {
                form.reset({
                    title: "",
                    content: "",
                });
            }
        }
    }, [announcement, isOpen, form]);

    const handleClose = () => {
        onOpenChange(false);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const userName = localStorage.getItem("userName") || "Admin";

        if (!db) {
            toast({ title: "Database tidak tersedia", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            if (announcement) {
                const announcementRef = doc(db, "announcements", announcement.id);
                await updateDoc(announcementRef, { 
                    ...values,
                    author: userName,
                    timestamp: serverTimestamp(),
                });
                toast({ title: "Pengumuman Berhasil Diperbarui" });
            } else {
                await addDoc(collection(db, "announcements"), {
                    ...values,
                    author: userName,
                    timestamp: serverTimestamp(),
                });
                toast({ title: "Pengumuman Berhasil Ditambahkan" });
            }
            handleClose();
        } catch (error) {
            console.error("Gagal menyimpan pengumuman:", error);
            toast({ title: "Gagal Menyimpan Pengumuman", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{announcement ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}</DialogTitle>
                    <DialogDescription>
                        Isi detail di bawah ini untuk {announcement ? "memperbarui" : "membuat"} pengumuman.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul</FormLabel>
                                    <FormControl>
                                        <Input placeholder="cth. Rapat Mingguan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Konten</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[150px] resize-y" placeholder="Tulis konten pengumuman di sini..." {...field} />
                                    </FormControl>
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
