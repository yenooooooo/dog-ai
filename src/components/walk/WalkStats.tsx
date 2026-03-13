'use client';

import { Timer, Route } from 'lucide-react';

interface WalkStatsProps {
  elapsed: number;
  distance: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)}km`
    : `${Math.round(meters)}m`;
}

export default function WalkStats({ elapsed, distance }: WalkStatsProps) {
  return (
    <div className="absolute left-4 right-4 top-3 z-30 flex gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-mw bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <Timer size={18} className="text-mw-green-500" strokeWidth={2} />
        <span className="text-[15px] font-semibold tabular-nums text-mw-gray-900">
          {formatTime(elapsed)}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-mw bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <Route size={18} className="text-mw-green-500" strokeWidth={2} />
        <span className="text-[15px] font-semibold tabular-nums text-mw-gray-900">
          {formatDistance(distance)}
        </span>
      </div>
    </div>
  );
}
