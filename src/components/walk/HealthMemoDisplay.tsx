'use client';

import { useEffect, useState } from 'react';

import { getHealthMemo } from '@/lib/health-memo';
import { POOP_OPTIONS } from '@/types/health-memo';
import type { HealthMemo } from '@/types/health-memo';

interface HealthMemoDisplayProps {
  walkId: string;
}

export default function HealthMemoDisplay({ walkId }: HealthMemoDisplayProps) {
  const [memo, setMemo] = useState<HealthMemo | null>(null);

  useEffect(() => {
    setMemo(getHealthMemo(walkId));
  }, [walkId]);

  if (!memo) return null;

  const poopOption = POOP_OPTIONS.find((o) => o.value === memo.poopStatus);
  const energyDots = Array.from({ length: 5 }, (_, i) => i < memo.energyLevel);

  return (
    <div className="mt-4 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="text-[14px] font-semibold text-mw-gray-800">건강 메모</p>

      <div className="mt-3 flex items-center gap-4">
        {/* 배변 상태 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">{poopOption?.emoji ?? '🚫'}</span>
          <span className="text-[13px] text-mw-gray-600">
            {poopOption?.label ?? '없음'}
          </span>
        </div>

        {/* 에너지 레벨 */}
        <div className="flex items-center gap-0.5">
          {energyDots.map((active, i) => (
            <span
              key={i}
              className={`text-[14px] ${active ? 'opacity-100' : 'opacity-20'}`}
            >
              🐾
            </span>
          ))}
        </div>
      </div>

      {memo.note && (
        <p className="mt-2 text-[13px] text-mw-gray-600">{memo.note}</p>
      )}
    </div>
  );
}
