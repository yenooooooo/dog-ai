'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

interface TimeSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

const PRESETS = [
  { label: '15분', value: 15 },
  { label: '30분', value: 30 },
  { label: '1시간', value: 60 },
];

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const isPreset = PRESETS.some((p) => p.value === value) && !isCustom;

  const handleCustom = () => {
    setIsCustom(true);
    if (PRESETS.some((p) => p.value === value)) onChange(45);
  };

  const handlePreset = (v: number) => {
    setIsCustom(false);
    onChange(v);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {PRESETS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handlePreset(opt.value)}
            className={cn(
              'flex-1 rounded-mw-sm py-2.5 text-[15px] font-medium transition-all duration-150',
              isPreset && value === opt.value
                ? 'bg-mw-green-500 text-white'
                : 'bg-mw-gray-100 text-mw-gray-800 active:bg-mw-gray-200'
            )}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={handleCustom}
          className={cn(
            'flex-1 rounded-mw-sm py-2.5 text-[15px] font-medium transition-all duration-150',
            isCustom
              ? 'bg-mw-green-500 text-white'
              : 'bg-mw-gray-100 text-mw-gray-800 active:bg-mw-gray-200'
          )}
        >
          직접
        </button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={5}
            max={180}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 5 && v <= 180) onChange(v);
            }}
            className="w-full rounded-mw-sm border border-mw-gray-200 px-4 py-2.5 text-center text-[15px] font-medium text-mw-gray-800 focus:border-mw-green-500 focus:outline-none"
          />
          <span className="shrink-0 text-[14px] text-mw-gray-500">분</span>
        </div>
      )}
    </div>
  );
}
