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
    <nav className="shrink-0 border-t border-mw-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-2">
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
                'flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-mw-sm transition-colors',
                isActive
                  ? 'text-mw-green-500'
                  : 'text-mw-gray-400 active:bg-mw-gray-50'
              )}
            >
              <Icon size={26} strokeWidth={isActive ? 2 : 1.75} />
              <span className={cn(
                'text-[12px]',
                isActive ? 'font-bold' : 'font-medium'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
