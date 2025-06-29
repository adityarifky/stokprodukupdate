import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle>Halaman Laporan</CardTitle>
          </div>
          <CardDescription>
            Pusat analisis dan laporan untuk bisnis Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground rounded-md border border-dashed">
            <p className="text-lg font-semibold">Segera Hadir</p>
            <p className="text-sm">Fitur laporan sedang dalam pengembangan.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
