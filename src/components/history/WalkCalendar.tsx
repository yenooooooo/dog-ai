'use client';

import { useMemo, useState } from 'react';

import { buildCalendarGrid, getColorLevel } from '@/lib/walk-calendar';
import type { DayActivity } from '@/types/calendar';

interface WalkCalendarProps {
  walks: { startedAt: string; distanceMeters: number }[];
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const COLOR_MAP: Record<number, string> = {
  0: 'bg-mw-gray-100',
  1: 'bg-green-200',
  2: 'bg-green-400',
  3: 'bg-green-600',
};

export default function WalkCalendar({ walks }: WalkCalendarProps) {
  const weeks = useMemo(() => buildCalendarGrid(walks), [walks]);
  const [selected, setSelected] = useState<DayActivity | null>(null);

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="text-[14px] font-semibold text-mw-gray-800">산책 캘린더</p>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-2">
        {/* 요일 라벨 */}
        <div className="flex shrink-0 flex-col gap-[3px]">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="flex h-[14px] w-[14px] items-center justify-center text-[9px] text-mw-gray-400"
            >
              {label}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
            {week.days.map((day, di) => {
              if (!day) {
                return (
                  <div
                    key={di}
                    className="h-[14px] w-[14px] rounded-[2px] bg-transparent"
                  />
                );
              }
              const level = getColorLevel(day.walkCount);
              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={`h-[14px] w-[14px] rounded-[2px] ${COLOR_MAP[level]} active:scale-110`}
                  title={day.date}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-mw-gray-400">
        <span>적음</span>
        {[0, 1, 2, 3].map((lv) => (
          <div key={lv} className={`h-[10px] w-[10px] rounded-[2px] ${COLOR_MAP[lv]}`} />
        ))}
        <span>많음</span>
      </div>

      {/* 선택된 날짜 정보 */}
      {selected && selected.walkCount > 0 && (
        <div className="mt-2 rounded-mw-sm bg-mw-green-50 px-3 py-2 text-[12px] text-mw-gray-700">
          <span className="font-semibold">{selected.date}</span>
          {' — '}
          {selected.walkCount}회 산책, {selected.totalKm.toFixed(2)}km
        </div>
      )}
    </div>
  );
}
