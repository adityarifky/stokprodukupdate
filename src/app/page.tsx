"use client";

import { CakeSlice } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-50 to-background z-0" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <CakeSlice className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
              Wawasan SweetStock
            </h1>
          </div>
          <p className="max-w-xs text-muted-foreground">
            Selamat datang kembali! Masuk untuk mengelola inventaris makanan penutup Anda dengan mudah dan presisi.
          </p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {year ? `© ${year} Wawasan SweetStock. Semua Hak Dilindungi.` : `\u00A0`}
        </p>
      </div>
    </main>
  );
}
