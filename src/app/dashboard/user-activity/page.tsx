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
import { cn } from "@/lib/utils";

const userActivity = [
    { name: 'Siti Aminah', position: 'Management', loginTime: '29 Jun 2024, 08:05', ip: '103.45.21.12', avatar: 'https://placehold.co/40x40.png', fallback: 'SA', aiHint: 'woman portrait', status: 'Online' },
    { name: 'Budi Santoso', position: 'Kitchen', loginTime: '29 Jun 2024, 07:59', ip: '112.78.54.90', avatar: 'https://placehold.co/40x40.png', fallback: 'BS', aiHint: 'man portrait', status: 'Online' },
    { name: 'Rina Wijaya', position: 'Kasir', loginTime: '29 Jun 2024, 07:55', ip: '180.25.11.34', avatar: 'https://placehold.co/40x40.png', fallback: 'RW', aiHint: 'woman smiling', status: 'Offline' },
    { name: 'Agus Salim', position: 'Kitchen', loginTime: '28 Jun 2024, 16:30', ip: '202.15.76.55', avatar: 'https://placehold.co/40x40.png', fallback: 'AS', aiHint: 'man glasses', status: 'Offline' },
    { name: 'Dewi Lestari', position: 'Management', loginTime: '28 Jun 2024, 09:15', ip: '36.88.101.21', avatar: 'https://placehold.co/40x40.png', fallback: 'DL', aiHint: 'woman professional', status: 'Online' },
];

export default function UserActivityPage() {
  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Pengguna</CardTitle>
          <CardDescription>
            Lacak siapa saja yang login dan kapan mereka masuk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Posisi</TableHead>
                <TableHead className="hidden md:table-cell">Waktu Login</TableHead>
                <TableHead className="text-right">Alamat IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivity.map((activity) => (
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                          "h-2 w-2 rounded-full",
                          activity.status === 'Online' ? 'bg-green-500' : 'bg-slate-400'
                      )} />
                      <span className="text-sm text-muted-foreground">{activity.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{activity.position}</TableCell>
                  <TableCell className="hidden md:table-cell">{activity.loginTime}</TableCell>
                  <TableCell className="text-right">{activity.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
