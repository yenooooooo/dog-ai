'use client';

import { useWalkStore } from '@/stores/walkStore';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

/** 앱 레이아웃 래퍼 — 산책 중에는 BottomNav를 숨긴다 */
export default function AppShell({ children }: AppShellProps) {
  const isWalking = useWalkStore((s) => s.isWalking);

  return (
    <>
      <main className="relative flex-1 overflow-y-auto">{children}</main>
      {!isWalking && <BottomNav />}
    </>
  );
}
