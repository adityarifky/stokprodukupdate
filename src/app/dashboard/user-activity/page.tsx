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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userActivity: any[] = [];

export default function UserActivityPage() {
  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
          <CardDescription>
            Lacak siapa saja yang login dan kapan mereka masuk ke sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead className="hidden sm:table-cell">Posisi</TableHead>
                <TableHead className="hidden md:table-cell">Waktu Login</TableHead>
                <TableHead className="text-right">Alamat IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivity.length > 0 ? (
                userActivity.map((activity) => (
                  <TableRow key={activity.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={activity.avatar} alt={activity.name} data-ai-hint={activity.aiHint} />
                              <AvatarFallback>{activity.fallback}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{activity.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{activity.position}</TableCell>
                    <TableCell className="hidden md:table-cell">{activity.loginTime}</TableCell>
                    <TableCell className="text-right">{activity.ip}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada aktivitas untuk ditampilkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
