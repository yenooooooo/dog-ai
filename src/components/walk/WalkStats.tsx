'use client';

import { Timer, Route, Flame } from 'lucide-react';

interface WalkStatsProps {
  elapsed: number;
  distance: number;
  targetDistance?: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)}km` : `${Math.round(meters)}m`;
}

// 평균 체중 65kg 기준, 도보 0.5kcal/kg/km
function estimateCalories(meters: number): number {
  return Math.round((meters / 1000) * 65 * 0.5);
}

export default function WalkStats({ elapsed, distance, targetDistance }: WalkStatsProps) {
  const progress = targetDistance && targetDistance > 0
    ? Math.min(Math.round((distance / targetDistance) * 100), 100) : null;

  return (
    <div className="absolute left-4 right-4 top-3 z-30">
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-mw bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur">
          <Timer size={16} className="text-mw-green-500" strokeWidth={2} />
          <span className="text-[14px] font-semibold tabular-nums text-mw-gray-900">{formatTime(elapsed)}</span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-mw bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur">
          <Route size={16} className="text-mw-green-500" strokeWidth={2} />
          <span className="text-[14px] font-semibold tabular-nums text-mw-gray-900">{formatDistance(distance)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-mw bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur">
          <Flame size={16} className="text-mw-amber-500" strokeWidth={2} />
          <span className="text-[14px] font-semibold tabular-nums text-mw-gray-900">{estimateCalories(distance)}</span>
          <span className="text-[11px] text-mw-gray-400">kcal</span>
        </div>
      </div>
      {progress !== null && (
        <div className="mt-1.5 overflow-hidden rounded-full bg-white/60">
          <div className="h-1.5 rounded-full bg-mw-green-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
