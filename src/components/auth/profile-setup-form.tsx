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

// Helper function to get IP
const getIpAddress = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'N/A';
    } catch (ipError) {
        console.error("Gagal mengambil IP:", ipError);
        return 'N/A';
    }
}

export function ProfileSetupForm() {
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

    const currentUser = auth?.currentUser;
    if (!currentUser || !db) {
      toast({
        title: "Gagal Menyimpan Profil",
        description: "Pengguna tidak terautentikasi atau database tidak tersedia.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      // Create a clean, new profile.
      await setDoc(userRef, {
        name: values.name,
        position: values.position,
        story: "",
        avatarUrl: "",
        status: "online",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      // Log the very first user activity after the profile is created
      const ipAddress = await getIpAddress();
      await addDoc(collection(db, "user-activity"), {
        userId: currentUser.uid,
        name: values.name,
        position: values.position,
        loginTime: serverTimestamp(),
        ip: ipAddress,
        avatar: '' // New user has no avatar yet
      });

      // After this, the onSnapshot listener in useAuth will automatically
      // pick up the new profile and update the UI. No need for callbacks.
      // The dialog will close automatically as the layout re-renders.

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
