'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { PetSize } from '@/types/database';

export interface PetFormData {
  name: string;
  breed: string;
  ageMonths: number | null;
  size: PetSize | null;
}

interface PetFormProps {
  initialData?: PetFormData;
  onSave: (data: PetFormData) => void;
  onDelete?: () => void;
}

const SIZES: { value: PetSize; label: string }[] = [
  { value: 'small', label: '소형' },
  { value: 'medium', label: '중형' },
  { value: 'large', label: '대형' },
];

const inputClass =
  'mt-1 w-full rounded-mw-sm border border-mw-gray-100 px-4 py-3 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:border-mw-green-500 focus:outline-none';

export default function PetForm({ initialData, onSave, onDelete }: PetFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [breed, setBreed] = useState(initialData?.breed ?? '');
  const [ageStr, setAgeStr] = useState(initialData?.ageMonths?.toString() ?? '');
  const [size, setSize] = useState<PetSize | null>(initialData?.size ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      breed: breed.trim(),
      ageMonths: ageStr ? parseInt(ageStr, 10) : null,
      size,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">이름 *</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="반려견 이름" maxLength={20} required className={inputClass}
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">견종</label>
        <input
          type="text" value={breed} onChange={(e) => setBreed(e.target.value)}
          placeholder="예: 포메라니안" maxLength={30} className={inputClass}
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">나이 (개월)</label>
        <input
          type="number" value={ageStr} onChange={(e) => setAgeStr(e.target.value)}
          placeholder="예: 24" min="0" max="300" className={inputClass}
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">크기</label>
        <div className="mt-1 flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSize(size === s.value ? null : s.value)}
              className={cn(
                'flex-1 rounded-mw-sm py-2.5 text-[14px] font-medium transition-colors',
                size === s.value
                  ? 'bg-mw-green-500 text-white'
                  : 'bg-mw-gray-50 text-mw-gray-600 active:bg-mw-gray-100'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
      >
        저장
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-mw py-3 text-[14px] font-medium text-mw-danger transition-transform active:scale-[0.97]"
        >
          삭제
        </button>
      )}
    </form>
  );
}
