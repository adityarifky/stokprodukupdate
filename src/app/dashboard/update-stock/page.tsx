import { UpdateStockForm } from "@/components/dashboard/update-stock-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UpdateStockPage() {
    return (
        <main className="p-4 sm:px-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button asChild variant="outline" size="icon" className="h-7 w-7">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Kembali</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Update Stok Produk
                    </h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Perbarui Jumlah Stok</CardTitle>
                        <CardDescription>
                            Pilih produk dan masukkan jumlah untuk menambah atau mengurangi stok yang ada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdateStockForm />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
