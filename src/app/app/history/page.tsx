'use client';

import { useEffect, useState } from 'react';

import { getWalks, type StoredWalk } from '@/lib/walk-storage';
import MonthSummaryCard from '@/components/walk/MonthSummaryCard';
import WalkHistoryCard from '@/components/walk/WalkHistoryCard';

/** 날짜 키 (YYYY-MM-DD) 기준으로 그룹핑 */
function groupByDate(walks: StoredWalk[]) {
  const groups: Record<string, StoredWalk[]> = {};
  walks.forEach((w) => {
    const key = w.startedAt.slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default function HistoryPage() {
  const [walks, setWalks] = useState<StoredWalk[]>([]);

  useEffect(() => {
    setWalks(getWalks());
  }, []);

  // 이번 달 통계
  const now = new Date();
  const thisMonth = walks.filter((w) => {
    const d = new Date(w.startedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalDistance = thisMonth.reduce((s, w) => s + w.distanceMeters, 0);
  const totalDuration = thisMonth.reduce((s, w) => s + w.durationSeconds, 0);
  const grouped = groupByDate(walks);

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-white px-5 pb-3 pt-4">
        <h1 className="text-[20px] font-bold text-mw-gray-900">산책 기록</h1>
        <span className="text-[13px] font-medium text-mw-gray-500">
          이번 달
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {/* 월간 요약 */}
        <MonthSummaryCard
          totalWalks={thisMonth.length}
          totalDistanceKm={totalDistance / 1000}
          totalDurationMin={Math.round(totalDuration / 60)}
        />

        {/* 기록 리스트 */}
        {grouped.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[15px] text-mw-gray-400">
              아직 산책 기록이 없어요
            </p>
            <p className="mt-1 text-[13px] text-mw-gray-300">
              첫 산책을 시작해보세요!
            </p>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} className="mt-4">
              <p className="mb-2 text-[13px] font-medium text-mw-gray-500">
                {formatDateLabel(date)}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((w) => (
                  <WalkHistoryCard
                    key={w.id}
                    id={w.id}
                    distanceMeters={w.distanceMeters}
                    durationSeconds={w.durationSeconds}
                    startedAt={w.startedAt}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
