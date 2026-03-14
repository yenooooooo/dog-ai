'use client';

import { useState } from 'react';
import { Tag, Square, Pause, Play } from 'lucide-react';

import PhotoCapture from '@/components/walk/PhotoCapture';
import type { Coordinate } from '@/types/route';

interface WalkActionBarProps {
  isPaused: boolean;
  position: Coordinate | null;
  onTag: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function WalkActionBar({ isPaused, position, onTag, onPause, onResume, onStop }: WalkActionBarProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="absolute bottom-20 left-4 right-4 z-30 animate-slide-up">
        <div className="rounded-mw-lg bg-white p-4 shadow-lg">
          <p className="text-center text-[15px] font-bold text-mw-gray-900">산책을 종료할까요?</p>
          <p className="mt-1 text-center text-[13px] text-mw-gray-500">기록이 저장됩니다</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-mw bg-mw-gray-100 py-3 text-[14px] font-semibold text-mw-gray-700 active:scale-[0.97]">
              계속 걷기
            </button>
            <button onClick={onStop} className="flex-1 rounded-mw bg-mw-danger py-3 text-[14px] font-semibold text-white active:scale-[0.97]">
              종료하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 left-4 right-4 z-30 flex gap-2">
      <button onClick={onTag} className="flex flex-1 items-center justify-center gap-2 rounded-mw bg-white/90 py-3.5 shadow-sm backdrop-blur active:scale-[0.97]">
        <Tag size={16} className="text-mw-green-500" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-mw-gray-800">태그</span>
      </button>
      <PhotoCapture position={position} />
      <button onClick={isPaused ? onResume : onPause} className="flex items-center justify-center gap-2 rounded-mw bg-white/90 px-5 py-3.5 shadow-sm backdrop-blur active:scale-[0.97]">
        {isPaused ? <Play size={16} className="text-mw-green-500" /> : <Pause size={16} className="text-mw-amber-500" />}
        <span className="text-[13px] font-semibold text-mw-gray-800">{isPaused ? '재개' : '일시정지'}</span>
      </button>
      <button onClick={() => setConfirming(true)} className="flex items-center justify-center gap-2 rounded-mw bg-mw-danger px-5 py-3.5 shadow-sm active:scale-[0.97]">
        <Square size={14} className="text-white" strokeWidth={2.5} />
        <span className="text-[13px] font-semibold text-white">종료</span>
      </button>
    </div>
  );
}
