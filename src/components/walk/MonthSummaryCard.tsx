'use client';

import { Footprints, Route, Timer } from 'lucide-react';

interface MonthSummaryCardProps {
  totalWalks: number;
  totalDistanceKm: number;
  totalDurationMin: number;
}

export default function MonthSummaryCard({
  totalWalks,
  totalDistanceKm,
  totalDurationMin,
}: MonthSummaryCardProps) {
  const hours = Math.floor(totalDurationMin / 60);
  const mins = totalDurationMin % 60;
  const timeText = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;

  return (
    <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <div className="flex gap-4">
        <SummaryItem
          icon={<Footprints size={16} className="text-mw-green-500" />}
          value={`${totalWalks}회`}
          label="산책"
        />
        <SummaryItem
          icon={<Route size={16} className="text-mw-green-500" />}
          value={`${totalDistanceKm.toFixed(1)}km`}
          label="거리"
        />
        <SummaryItem
          icon={<Timer size={16} className="text-mw-green-500" />}
          value={timeText}
          label="시간"
        />
      </div>
    </div>
  );
}

function SummaryItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-2">
      {icon}
      <div>
        <p className="text-[17px] font-semibold text-mw-gray-900">{value}</p>
        <p className="text-[12px] font-medium text-mw-gray-500">{label}</p>
      </div>
    </div>
  );
}
