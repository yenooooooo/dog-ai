'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TAG_TYPES } from '@/lib/tag-constants';
import type { TagType } from '@/types/database';

interface TagSheetProps {
  onSelect: (tagType: TagType, description: string | null) => void;
  onClose: () => void;
}

export default function TagSheet({ onSelect, onClose }: TagSheetProps) {
  const [selected, setSelected] = useState<TagType | null>(null);
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    if (!selected) return;
    onSelect(selected, desc.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
      <div className="w-full rounded-t-mw-xl bg-white px-5 pb-8 pt-4 animate-sheet-up">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-mw-gray-900">
            어떤 태그를 남길까요?
          </h3>
          <button onClick={onClose} className="p-1">
            <X size={20} className="text-mw-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TAG_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelected(t.type)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-mw-sm py-3 transition-colors',
                selected === t.type
                  ? 'bg-mw-green-50 ring-2 ring-mw-green-500'
                  : 'bg-mw-gray-50 active:bg-mw-gray-100'
              )}
            >
              <span className="text-[20px]">{t.emoji}</span>
              <span className="text-[11px] font-medium text-mw-gray-700">
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="설명 추가 (선택)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={50}
          className="mt-4 w-full rounded-mw-sm border border-mw-gray-100 px-4 py-3 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:border-mw-green-500 focus:outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="mt-4 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
        >
          태그 남기기
        </button>
      </div>
    </div>
  );
}
