'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  History,
  Users,
  FileUp,
  FileClock,
  Megaphone,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/update-stock', label: 'Update', icon: FileUp },
  { href: '/dashboard/stock-history', label: 'Riwayat', icon: FileClock },
  { href: '/dashboard/announcements', label: 'Pengumuman', icon: Megaphone },
  { href: '/dashboard/user-activity', label: 'Aktivitas', icon: History },
  { href: '/dashboard/reports', label: 'Laporan', icon: FileText },
  { href: '/dashboard/users', label: 'Pengguna', icon: Users },
];

export function BottomNav({
  isProfileDialogOpen,
  onProfileDialogOpenChange,
}: {
  isProfileDialogOpen: boolean;
  onProfileDialogOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm">
      <nav className="h-16 w-full overflow-x-auto">
        <div className="flex h-full items-center justify-start gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex h-[calc(100%-8px)] w-20 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-md px-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary',
                (pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))) &&
                  'bg-accent text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="w-full truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </footer>
  );
}
