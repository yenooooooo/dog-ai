'use client';

import { Tag, Square } from 'lucide-react';

interface WalkActionBarProps {
  onTag: () => void;
  onStop: () => void;
}

export default function WalkActionBar({ onTag, onStop }: WalkActionBarProps) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-30 flex gap-3">
      <button
        onClick={onTag}
        className="flex flex-1 items-center justify-center gap-2 rounded-mw bg-white/90 py-3.5 shadow-sm backdrop-blur transition-transform active:scale-[0.97]"
      >
        <Tag size={18} className="text-mw-green-500" strokeWidth={2} />
        <span className="text-[14px] font-semibold text-mw-gray-800">
          태그 남기기
        </span>
      </button>
      <button
        onClick={onStop}
        className="flex flex-1 items-center justify-center gap-2 rounded-mw bg-mw-danger py-3.5 shadow-sm transition-transform active:scale-[0.97]"
      >
        <Square size={16} className="text-white" strokeWidth={2.5} />
        <span className="text-[14px] font-semibold text-white">산책 종료</span>
      </button>
    </div>
  );
}
