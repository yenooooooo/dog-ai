'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryMonthNavProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function HistoryMonthNav({ year, month, onChange }: HistoryMonthNavProps) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const handlePrev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const handleNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={handlePrev}
        className="flex h-9 w-9 items-center justify-center rounded-full active:bg-mw-gray-100"
        aria-label="이전 달"
      >
        <ChevronLeft size={18} className="text-mw-gray-600" />
      </button>

      <span className="text-[15px] font-bold text-mw-gray-900">
        {year}년 {month}월
      </span>

      <button
        onClick={handleNext}
        disabled={isCurrentMonth}
        className="flex h-9 w-9 items-center justify-center rounded-full active:bg-mw-gray-100 disabled:opacity-30"
        aria-label="다음 달"
      >
        <ChevronRight size={18} className="text-mw-gray-600" />
      </button>
    </div>
  );
}
