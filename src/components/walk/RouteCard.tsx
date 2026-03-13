'use client';

import { Route, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { GeneratedRoute } from '@/types/route';

interface RouteCardProps {
  route: GeneratedRoute;
  isSelected: boolean;
  onSelect: () => void;
  onStartWalk: () => void;
}

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)}km`
    : `${Math.round(meters)}m`;
}

export default function RouteCard({
  route,
  isSelected,
  onSelect,
  onStartWalk,
}: RouteCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-mw-lg border p-4 transition-all',
        isSelected ? 'border-mw-green-500 bg-white' : 'border-mw-gray-100 bg-white'
      )}
    >
      {/* 루트 미니맵 (추후 정적 지도 이미지로 교체) */}
      <div className="flex h-[120px] items-center justify-center rounded-xl bg-mw-gray-100">
        <Route size={24} className="text-mw-gray-300" strokeWidth={1.75} />
      </div>

      {/* 루트 이름 */}
      <h3 className="mt-3 text-[17px] font-semibold text-mw-gray-900">
        {route.name}
      </h3>

      {/* 태그 */}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {route.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-mw-green-50 px-2 py-0.5 text-[12px] font-medium text-mw-green-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 거리 · 예상시간 */}
      <div className="mt-3 flex items-center gap-4 text-[13px] text-mw-gray-500">
        <span className="flex items-center gap-1">
          <Route size={14} strokeWidth={1.75} />
          {formatDistance(route.totalDistance)}
        </span>
        <span className="flex items-center gap-1">
          <Timer size={14} strokeWidth={1.75} />
          약 {route.estimatedDuration}분
        </span>
      </div>

      {/* CTA — 선택된 카드에만 표시 */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartWalk();
          }}
          className="mt-4 w-full rounded-mw bg-mw-green-500 py-3 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
        >
          이 루트로 산책
        </button>
      )}
    </div>
  );
}
