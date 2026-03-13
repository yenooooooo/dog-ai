'use client';

import Link from 'next/link';
import { Route, Timer, ChevronRight } from 'lucide-react';

interface WalkHistoryCardProps {
  id: string;
  distanceMeters: number;
  durationSeconds: number;
  startedAt: string;
}

export default function WalkHistoryCard({
  id,
  distanceMeters,
  durationSeconds,
  startedAt,
}: WalkHistoryCardProps) {
  const km = (distanceMeters / 1000).toFixed(2);
  const mins = Math.round(durationSeconds / 60);
  const time = new Date(startedAt);
  const timeStr = time.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/app/history/${id}`}
      className="flex items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4 transition-colors active:bg-mw-gray-50"
    >
      {/* 루트 아이콘 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-mw-sm bg-mw-green-50">
        <Route size={20} className="text-mw-green-500" />
      </div>

      {/* 정보 */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[15px] font-semibold text-mw-gray-900">
            {km}km
          </span>
          <span className="flex items-center gap-1 text-[13px] text-mw-gray-500">
            <Timer size={12} />
            {mins}분
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-mw-gray-400">{timeStr}</p>
      </div>

      <ChevronRight size={18} className="text-mw-gray-300" />
    </Link>
  );
}
