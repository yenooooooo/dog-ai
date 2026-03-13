'use client';

import { useState } from 'react';
import { Timer, Route, Zap } from 'lucide-react';

import ShareCardPreview from '@/components/walk/ShareCardPreview';
import type { Coordinate } from '@/types/route';

interface WalkCompleteModalProps {
  distance: number;
  durationSec: number;
  coordinates: Coordinate[];
  petName?: string;
  onConfirm: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}분 ${s}초`;
}

export default function WalkCompleteModal({
  distance,
  durationSec,
  coordinates,
  petName,
  onConfirm,
}: WalkCompleteModalProps) {
  const [showShare, setShowShare] = useState(false);
  const km = (distance / 1000).toFixed(2);
  const avgSpeed =
    durationSec > 0 ? ((distance / durationSec) * 60).toFixed(0) : '0';

  if (showShare) {
    return (
      <ShareCardPreview
        coordinates={coordinates}
        distance={distance}
        durationSec={durationSec}
        petName={petName}
        onBack={() => setShowShare(false)}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-6 w-full max-w-sm rounded-mw-lg bg-white px-6 py-7">
        <h2 className="text-center text-[20px] font-bold text-mw-gray-900">
          산책 완료!
        </h2>
        <p className="mt-1 text-center text-[13px] text-mw-gray-500">
          오늘도 좋은 산책이었어요
        </p>

        <div className="mt-5 flex gap-3">
          <StatCard
            icon={<Route size={20} className="text-mw-green-500" />}
            label="거리"
            value={`${km}km`}
          />
          <StatCard
            icon={<Timer size={20} className="text-mw-green-500" />}
            label="시간"
            value={formatTime(durationSec)}
          />
          <StatCard
            icon={<Zap size={20} className="text-mw-amber-500" />}
            label="평균 속도"
            value={`${avgSpeed}m/분`}
          />
        </div>

        <button
          onClick={() => setShowShare(true)}
          className="mt-4 w-full rounded-mw border border-mw-gray-200 py-3 text-[14px] font-medium text-mw-gray-600 transition-transform active:scale-[0.97]"
        >
          공유 카드 만들기
        </button>
        <button
          onClick={onConfirm}
          className="mt-2 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
        >
          확인
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-mw-sm bg-mw-gray-50 py-3">
      {icon}
      <span className="text-[11px] text-mw-gray-500">{label}</span>
      <span className="text-[14px] font-bold text-mw-gray-900">{value}</span>
    </div>
  );
}
