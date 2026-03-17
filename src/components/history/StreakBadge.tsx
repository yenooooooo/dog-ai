'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';

import { calculateStreak } from '@/lib/walk-calendar';
import type { StreakInfo } from '@/types/calendar';

interface StreakBadgeProps {
  walks: { startedAt: string; distanceMeters: number }[];
}

export default function StreakBadge({ walks }: StreakBadgeProps) {
  const streak: StreakInfo = useMemo(() => calculateStreak(walks), [walks]);

  if (streak.current === 0 && streak.longest === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
        <Flame size={20} className="text-orange-500" />
      </div>
      <div className="flex-1">
        {streak.current > 0 ? (
          <p className="text-[14px] font-bold text-mw-gray-900">
            {streak.current}일 연속 산책 중!
          </p>
        ) : (
          <p className="text-[14px] font-bold text-mw-gray-900">
            오늘 산책을 시작해보세요!
          </p>
        )}
        <p className="text-[12px] text-mw-gray-500">
          최장 연속 기록: {streak.longest}일
        </p>
      </div>
    </div>
  );
}
