'use client';

import { useMemo } from 'react';

import { calculateLevel } from '@/lib/badge-engine';
import type { LevelProgress } from '@/types/badge';

interface LevelCardProps {
  walks: { distanceMeters: number }[];
}

const LEVEL_EMOJIS: Record<number, string> = {
  1: '🐶',
  2: '🐕',
  3: '🌳',
  4: '🏅',
  5: '🏆',
  6: '👑',
};

export default function LevelCard({ walks }: LevelCardProps) {
  const totalKm = useMemo(
    () => walks.reduce((sum, w) => sum + w.distanceMeters, 0) / 1000,
    [walks]
  );

  const progress: LevelProgress = useMemo(
    () => calculateLevel(totalKm),
    [totalKm]
  );

  const emoji = LEVEL_EMOJIS[progress.current.level] ?? '🐾';

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-[20px]">
          {emoji}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-mw-gray-900">
            Lv.{progress.current.level} {progress.current.name}
          </p>
          <p className="text-[12px] text-mw-gray-500">
            총 {totalKm.toFixed(2)}km 걸었어요
          </p>
        </div>
      </div>

      {progress.next && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-mw-gray-500">
            <span>Lv.{progress.current.level}</span>
            <span>Lv.{progress.next.level} ({progress.next.minKm}km)</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-mw-gray-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-mw-gray-400">
            {progress.progressPercent}%
          </p>
        </div>
      )}

      {!progress.next && (
        <p className="mt-2 text-center text-[12px] font-medium text-green-600">
          최고 레벨 달성!
        </p>
      )}
    </div>
  );
}
