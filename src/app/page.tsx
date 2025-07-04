"use client";

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
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
            Dreampuff Stock Update
          </h1>
          <p className="text-sm text-muted-foreground">
            What’s Hot Today?
          </p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {year ? `© ${year} Dreampuff. Hak Untuk Karyawan` : `\u00A0`}
        </p>
      </div>
    </main>
  );
}
