import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const salesData = [
    { invoice: "INV001", status: "Lunas", method: "Kartu Kredit", total: "Rp 250.000" },
    { invoice: "INV002", status: "Tertunda", method: "Transfer Bank", total: "Rp 150.000" },
    { invoice: "INV003", status: "Lunas", method: "GoPay", total: "Rp 350.000" },
    { invoice: "INV004", status: "Dibatalkan", method: "OVO", total: "Rp 75.000" },
    { invoice: "INV005", status: "Lunas", method: "Kartu Kredit", total: "Rp 450.000" },
    { invoice: "INV006", status: "Lunas", method: "GoPay", total: "Rp 120.000" },
    { invoice: "INV007", status: "Tertunda", method: "Kartu Debit", total: "Rp 90.000" },
];

export default function SalesDetailsPage() {
  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Detail Penjualan</CardTitle>
          <CardDescription>
            Rincian transaksi penjualan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Faktur</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Metode</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.invoice}>
                  <TableCell className="hidden sm:table-cell font-medium">
                    {sale.invoice}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      sale.status === 'Lunas' ? 'default' :
                      sale.status === 'Tertunda' ? 'secondary' :
                      'destructive'
                    }>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{sale.method}</TableCell>
                  <TableCell className="text-right">{sale.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
