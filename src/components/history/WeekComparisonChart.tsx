'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { buildWeekComparison } from '@/lib/walk-comparison';
import type { WeekComparison } from '@/types/comparison';

interface WeekComparisonChartProps {
  walks: { startedAt: string; distanceMeters: number }[];
}

function ChangeIndicator({ percent }: { percent: number }) {
  if (percent > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[13px] font-bold text-green-600">
        <TrendingUp size={14} />
        {percent}%
      </span>
    );
  }
  if (percent < 0) {
    return (
      <span className="flex items-center gap-0.5 text-[13px] font-bold text-red-500">
        <TrendingDown size={14} />
        {Math.abs(percent)}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[13px] font-bold text-mw-gray-400">
      <Minus size={14} />
      변화 없음
    </span>
  );
}

function BarPair({
  dayLabel,
  thisKm,
  lastKm,
  maxKm,
}: {
  dayLabel: string;
  thisKm: number;
  lastKm: number;
  maxKm: number;
}) {
  const thisH = maxKm > 0 ? Math.max(2, (thisKm / maxKm) * 64) : 2;
  const lastH = maxKm > 0 ? Math.max(2, (lastKm / maxKm) * 64) : 2;
  const showThisH = thisKm === 0 ? 2 : thisH;
  const showLastH = lastKm === 0 ? 2 : lastH;

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div className="flex h-[68px] items-end gap-[3px]">
        <div
          className="w-[10px] rounded-t-sm bg-mw-gray-200"
          style={{ height: `${showLastH}px` }}
          title={`지난주 ${lastKm.toFixed(1)}km`}
        />
        <div
          className="w-[10px] rounded-t-sm bg-green-500"
          style={{ height: `${showThisH}px` }}
          title={`이번주 ${thisKm.toFixed(1)}km`}
        />
      </div>
      <span className="text-[10px] text-mw-gray-500">{dayLabel}</span>
    </div>
  );
}

export default function WeekComparisonChart({ walks }: WeekComparisonChartProps) {
  const comparison: WeekComparison = useMemo(
    () => buildWeekComparison(walks),
    [walks]
  );

  const maxKm = Math.max(
    ...comparison.days.map((d) => Math.max(d.thisWeekKm, d.lastWeekKm)),
    0.1
  );

  const hasData =
    comparison.thisWeekTotalKm > 0 || comparison.lastWeekTotalKm > 0;

  if (!hasData) return null;

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-mw-gray-800">주간 비교</p>
        <ChangeIndicator percent={comparison.changePercent} />
      </div>

      <div className="mt-3 flex items-end justify-between">
        {comparison.days.map((d) => (
          <BarPair
            key={d.dayLabel}
            dayLabel={d.dayLabel}
            thisKm={d.thisWeekKm}
            lastKm={d.lastWeekKm}
            maxKm={maxKm}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-mw-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-green-500" />
          이번주 {comparison.thisWeekTotalKm.toFixed(1)}km
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-mw-gray-200" />
          지난주 {comparison.lastWeekTotalKm.toFixed(1)}km
        </span>
      </div>
    </div>
  );
}
