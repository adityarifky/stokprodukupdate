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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Briefcase } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  position: z.enum(["Management", "Kitchen", "Kasir"], {
    required_error: "Anda harus memilih posisi.",
  }),
});

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('profileSetupComplete') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    localStorage.setItem('userName', values.name);
    localStorage.setItem('userPosition', values.position);
    localStorage.setItem('profileSetupComplete', 'true');
    
    setTimeout(() => {
        router.push("/dashboard");
    }, 500);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-50 to-background z-0" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-lg border-2 border-amber-100/50">
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
                          <Input placeholder="Nama lengkap Anda" className="pl-10" {...field} />
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
                             <SelectTrigger className="pl-10">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan dan Lanjutkan"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
}
