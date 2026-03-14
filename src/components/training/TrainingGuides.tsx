'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react';

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
        <GuideCard key={g.id} guide={g} isOpen={openId === g.id} onToggle={() => setOpenId(openId === g.id ? null : g.id)} />
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
            <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', DIFF_COLOR[guide.difficulty])}>{guide.difficulty}</span>
            <span className="text-[11px] text-mw-gray-400">{guide.weeklyPlan.length}주 과정</span>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-mw-gray-400" /> : <ChevronDown size={16} className="text-mw-gray-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-mw-gray-50 px-4 pb-4 pt-3">
          {guide.weeklyPlan.map((w) => (
            <div key={w.week} className="mt-3 first:mt-0">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-mw-green-500" />
                <p className="text-[12px] font-bold text-mw-green-600">{w.week}주차: {w.goal}</p>
              </div>
              {w.tasks.map((t, j) => (
                <p key={j} className="mt-1 pl-4 text-[12px] leading-relaxed text-mw-gray-700">• {t}</p>
              ))}
            </div>
          ))}

          {guide.sizeNotes.length > 0 && (
            <div className="mt-3 rounded-mw-sm bg-mw-amber-400/5 p-3">
              <div className="flex items-center gap-1">
                <AlertTriangle size={12} className="text-mw-amber-500" />
                <p className="text-[11px] font-bold text-mw-amber-500">견종별 주의</p>
              </div>
              {guide.sizeNotes.map((n, i) => (
                <p key={i} className="mt-1 text-[11px] text-mw-gray-600"><strong>{n.size}:</strong> {n.note}</p>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-mw-sm bg-mw-green-50 p-3">
            <p className="text-[11px] font-medium text-mw-green-600">💡 전문가 팁</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mw-green-700">{guide.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
