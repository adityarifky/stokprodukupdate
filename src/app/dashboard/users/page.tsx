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

const users: any[] = [];

export default function UsersStatusPage() {
  return (
    <main className="p-4 sm:px-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Status Pengguna</CardTitle>
          <CardDescription>
            Lihat daftar pengguna dan status online mereka saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.aiHint} />
                              <AvatarFallback>{user.fallback}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.position}</div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cn(
                            "h-2 w-2 rounded-full",
                            user.status === 'Online' ? 'bg-green-500' : 'bg-slate-400'
                        )} />
                        <span className="text-sm text-muted-foreground">{user.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Tidak ada pengguna untuk ditampilkan.
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
