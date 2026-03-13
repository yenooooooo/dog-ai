'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Footprints, History, User } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/app', icon: Map, label: '지도' },
  { href: '/app/walk', icon: Footprints, label: '산책' },
  { href: '/app/history', icon: History, label: '기록' },
  { href: '/app/profile', icon: User, label: '프로필' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-14 shrink-0 items-center justify-around border-t border-mw-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive =
          href === '/app'
            ? pathname === '/app'
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5',
              isActive ? 'text-mw-green-500' : 'text-mw-gray-400'
            )}
          >
            <Icon size={24} strokeWidth={1.75} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
