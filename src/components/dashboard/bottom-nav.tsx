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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/products/add', label: 'Update', icon: FileUp },
  { href: '/dashboard/stock-history', label: 'Riwayat', icon: FileClock },
  { href: '/dashboard/announcements', label: 'Pengumuman', icon: Megaphone },
  { href: '/dashboard/user-activity', label: 'Aktivitas', icon: History },
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
      <nav className="grid h-16 grid-cols-7 items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary',
              (pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))) &&
                'text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
