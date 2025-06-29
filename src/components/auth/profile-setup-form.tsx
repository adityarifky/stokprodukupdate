"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Briefcase } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  position: z.enum(["Management", "Kitchen", "Kasir"], {
    required_error: "Anda harus memilih posisi.",
  }),
});

export function ProfileSetupForm({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!auth?.currentUser || !db) {
      toast({
        title: "Gagal Menyimpan Profil",
        description: "Pengguna tidak terautentikasi atau database tidak tersedia.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        name: values.name,
        position: values.position,
        story: "",
        avatarUrl: localStorage.getItem('avatarUrl') || '',
        status: "online",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }, { merge: true });

      localStorage.setItem('userName', values.name);
      localStorage.setItem('userPosition', values.position);
      localStorage.setItem('userStory', '');
      localStorage.setItem('profileSetupComplete', 'true');
      
      const pendingActivity = sessionStorage.getItem('pendingActivityLog');
      if (pendingActivity) {
        const { ip } = JSON.parse(pendingActivity);
        await addDoc(collection(db, "user-activity"), {
          userId: auth.currentUser.uid,
          name: values.name,
          position: values.position,
          loginTime: serverTimestamp(),
          ip: ip,
          avatar: localStorage.getItem('avatarUrl') || ''
        });
        sessionStorage.removeItem('pendingActivityLog');
      }

      onComplete();
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
       toast({
        title: "Gagal Menyimpan Profil",
        description: "Terjadi kesalahan saat menyimpan data Anda. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-2 border-amber-100/50">
      <CardHeader>
        <CardTitle>Absen dulu ya guys</CardTitle>
        <CardDescription>
          Sebelum melanjutkan, dimohon untuk berikan nama dan posisi yang sesuai yess.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Nama lengkap Anda" className="pl-10" {...field} suppressHydrationWarning />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posisi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <SelectTrigger className="pl-10" suppressHydrationWarning>
                            <SelectValue placeholder="Pilih posisi Anda" />
                         </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Kitchen">Kitchen</SelectItem>
                      <SelectItem value="Kasir">Kasir</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
              {isLoading ? "Menyimpan..." : "Simpan dan Lanjutkan"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
