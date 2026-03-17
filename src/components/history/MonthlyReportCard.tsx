'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

import type { MonthlyReport } from '@/types/report';
import { dayOfWeekLabel } from '@/lib/monthly-report';

interface MonthlyReportCardProps {
  report: MonthlyReport;
}

function formatBestDay(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[12px] text-mw-gray-400">첫 달</span>;
  const isUp = value > 0;
  const isFlat = value === 0;
  const color = isUp ? 'text-mw-green-600' : isFlat ? 'text-mw-gray-400' : 'text-mw-danger';
  const Icon = isUp ? TrendingUp : isFlat ? Minus : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-[12px] font-medium ${color}`}>
      <Icon size={12} />
      {isFlat ? '변동 없음' : `${Math.abs(value)}% ${isUp ? '증가' : '감소'}`}
    </span>
  );
}

export default function MonthlyReportCard({ report }: MonthlyReportCardProps) {
  const [open, setOpen] = useState(false);

  const hours = Math.floor(report.totalDurationMin / 60);
  const mins = report.totalDurationMin % 60;
  const timeText = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 active:bg-mw-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-mw-gray-900">
            {report.month}월 리포트
          </span>
          <ChangeIndicator value={report.changeVsLastMonth} />
        </div>
        {open ? (
          <ChevronUp size={16} className="text-mw-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-mw-gray-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-mw-gray-50 px-4 pb-4 pt-3">
          {/* 주요 통계 */}
          <div className="grid grid-cols-3 gap-2">
            <StatCell label="총 산책" value={`${report.totalWalks}회`} />
            <StatCell label="총 거리" value={`${report.totalDistanceKm.toFixed(1)}km`} />
            <StatCell label="총 시간" value={timeText} />
          </div>

          {/* 평균 + 추가 정보 */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatCell label="평균 거리" value={`${report.avgDistanceKm.toFixed(1)}km`} />
            <StatCell label="평균 시간" value={`${report.avgDurationMin}분`} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatCell label="최고의 날" value={formatBestDay(report.bestDay)} />
            <StatCell
              label="주요 요일"
              value={dayOfWeekLabel(report.busiestDayOfWeek)}
            />
          </div>

          {/* 지난달 대비 */}
          <div className="mt-3 flex items-center justify-between rounded-mw-sm bg-mw-gray-50 px-3 py-2">
            <span className="text-[12px] text-mw-gray-500">지난달 대비</span>
            <ChangeIndicator value={report.changeVsLastMonth} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-mw-sm bg-mw-gray-50 py-2">
      <span className="text-[11px] text-mw-gray-500">{label}</span>
      <span className="mt-0.5 text-[15px] font-bold text-mw-gray-900">{value}</span>
    </div>
  );
}
