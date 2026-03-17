'use client';

import { useState } from 'react';

import type { PoopStatus, EnergyLevel, HealthMemo } from '@/types/health-memo';
import { POOP_OPTIONS } from '@/types/health-memo';

interface HealthMemoFormProps {
  onSave: (memo: HealthMemo) => void;
}

const ENERGY_LABELS = ['매우 낮음', '낮음', '보통', '높음', '매우 높음'];

export default function HealthMemoForm({ onSave }: HealthMemoFormProps) {
  const [poopStatus, setPoopStatus] = useState<PoopStatus>('none');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    onSave({ poopStatus, energyLevel, note: note.trim() });
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-3 w-full rounded-mw-lg border border-dashed border-mw-green-300 bg-mw-green-50/50 py-3 text-[13px] font-medium text-mw-green-600 active:scale-[0.97]"
      >
        🐾 건강 메모 작성하기
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="text-[14px] font-semibold text-mw-gray-800">건강 메모</p>

      {/* 배변 상태 */}
      <p className="mt-3 text-[12px] font-medium text-mw-gray-500">배변 상태</p>
      <div className="mt-1.5 flex gap-2">
        {POOP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setPoopStatus(opt.value); handleSave(); }}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-mw-sm py-2 text-[11px] active:scale-[0.97] ${
              poopStatus === opt.value
                ? 'bg-mw-green-100 font-semibold text-mw-green-700'
                : 'bg-mw-gray-50 text-mw-gray-500'
            }`}
          >
            <span className="text-[18px]">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 에너지 레벨 */}
      <p className="mt-4 text-[12px] font-medium text-mw-gray-500">에너지 레벨</p>
      <div className="mt-1.5 flex items-center gap-1">
        {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => { setEnergyLevel(level); handleSave(); }}
            className={`flex h-10 w-10 items-center justify-center rounded-mw-sm text-[18px] active:scale-[0.97] ${
              level <= energyLevel
                ? 'bg-mw-green-100'
                : 'bg-mw-gray-50'
            }`}
          >
            🐾
          </button>
        ))}
        <span className="ml-2 text-[12px] text-mw-gray-500">
          {ENERGY_LABELS[energyLevel - 1]}
        </span>
      </div>

      {/* 자유 메모 */}
      <p className="mt-4 text-[12px] font-medium text-mw-gray-500">메모</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleSave}
        maxLength={200}
        rows={2}
        placeholder="오늘 산책 중 특이사항을 남겨보세요"
        className="mt-1.5 w-full resize-none rounded-mw border border-mw-gray-200 px-3 py-2 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-300 focus:border-mw-green-400 focus:outline-none"
      />
      <p className="mt-1 text-right text-[11px] text-mw-gray-300">
        {note.length}/200
      </p>
    </div>
  );
}
