"use client";

import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email({ message: "Silakan masukkan alamat email yang valid." }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi." }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!auth || !db) {
      toast({
        title: "Konfigurasi Firebase Hilang",
        description: "Kunci API Firebase tidak ditemukan. Periksa file .env.local Anda dan pastikan server telah di-restart.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      let ipAddress = 'N/A';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip || 'N/A';
      } catch (ipError) {
        console.error("Gagal mengambil IP:", ipError);
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userDocRef, {
          status: 'online',
          lastLogin: serverTimestamp()
        });

        await addDoc(collection(db, "user-activity"), {
            userId: user.uid,
            name: userData.name,
            position: userData.position,
            loginTime: serverTimestamp(),
            ip: ipAddress,
            avatar: userData.avatarUrl || ''
        });

      } else {
        // The user document doesn't exist yet (first-time login after signup).
        // The ProfileSetupForm will handle creating the user doc and the activity log.
        // We store the IP in sessionStorage temporarily for the setup form to use.
        sessionStorage.setItem('pendingActivityLog', JSON.stringify({ ip: ipAddress }));
      }
      
      router.push("/dashboard");

    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan saat masuk.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Email atau kata sandi salah. Silakan coba lagi.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Format email tidak valid.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "Kunci API Firebase tidak valid. Mohon periksa konfigurasi Anda.";
          break;
        default:
          errorMessage = "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.";
          break;
      }
      toast({
        title: "Gagal Masuk",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-2 border-amber-100/50">
      <CardHeader>
        <CardTitle>Masuk Akun</CardTitle>
        <CardDescription>Setiap hari membawa rasa baru. Kami menghadirkan pembaruan stok harian untuk memastikan selalu ada sesuatu yang berbeda dan selalu menggugah selera.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="nama@contoh.com" className="pl-10" {...field} suppressHydrationWarning />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                        suppressHydrationWarning
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        suppressHydrationWarning
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
              {isLoading ? "Masuk..." : "Masuk"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
