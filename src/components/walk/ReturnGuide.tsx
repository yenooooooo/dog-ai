'use client';

import { Home } from 'lucide-react';

import { getDistanceMeters, getBearingDeg } from '@/lib/geo-utils';
import type { Coordinate } from '@/types/route';

interface ReturnGuideProps {
  startPosition: Coordinate;
  currentPosition: Coordinate;
}

/** 방위각(degree)을 8방향 화살표 문자로 변환 */
function bearingToArrow(deg: number): string {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const idx = Math.round(deg / 45) % 8;
  return arrows[idx];
}

function formatDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
}

export default function ReturnGuide({ startPosition, currentPosition }: ReturnGuideProps) {
  const dist = getDistanceMeters(currentPosition, startPosition);
  const bearing = getBearingDeg(currentPosition, startPosition);
  const arrow = bearingToArrow(bearing);
  const isClose = dist <= 200;

  return (
    <div className="absolute bottom-36 left-4 z-30 flex items-center gap-2 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
      <Home size={14} className="shrink-0 text-mw-green-500" />
      {isClose ? (
        <span className="text-[13px] font-medium text-mw-green-600">
          거의 다 왔어요!
        </span>
      ) : (
        <span className="text-[13px] font-medium text-mw-gray-700">
          출발지까지 {formatDist(dist)} {arrow}
        </span>
      )}
    </div>
  );
}
