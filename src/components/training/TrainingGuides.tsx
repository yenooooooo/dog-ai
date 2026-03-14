'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { TRAINING_GUIDES, type TrainingGuide } from '@/lib/training-guides';
import { cn } from '@/lib/utils';

const DIFF_COLOR = {
  '초급': 'bg-mw-green-50 text-mw-green-600',
  '중급': 'bg-mw-amber-400/10 text-mw-amber-500',
  '고급': 'bg-red-50 text-mw-danger',
};

export default function TrainingGuides() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {TRAINING_GUIDES.map((g) => (
        <GuideCard
          key={g.id}
          guide={g}
          isOpen={openId === g.id}
          onToggle={() => setOpenId(openId === g.id ? null : g.id)}
        />
      ))}
    </div>
  );
}

function GuideCard({ guide, isOpen, onToggle }: { guide: TrainingGuide; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-mw-lg border border-mw-gray-100 bg-white">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5">
        <span className="text-[22px]">{guide.emoji}</span>
        <div className="flex-1 text-left">
          <p className="text-[14px] font-semibold text-mw-gray-900">{guide.title}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', DIFF_COLOR[guide.difficulty])}>
              {guide.difficulty}
            </span>
            <span className="text-[11px] text-mw-gray-400">{guide.category}</span>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-mw-gray-400" /> : <ChevronDown size={16} className="text-mw-gray-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-mw-gray-50 px-4 pb-4 pt-3">
          <p className="mb-2 text-[12px] font-medium text-mw-green-500">단계별 훈련법</p>
          {guide.steps.map((step, i) => (
            <p key={i} className="mt-1.5 flex gap-2 text-[13px] leading-relaxed text-mw-gray-700">
              <span className="shrink-0 font-bold text-mw-green-500">{i + 1}</span>
              {step}
            </p>
          ))}
          <div className="mt-3 rounded-mw-sm bg-mw-green-50 p-3">
            <p className="text-[12px] font-medium text-mw-green-600">💡 팁</p>
            <p className="mt-1 text-[12px] leading-relaxed text-mw-green-700">{guide.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
