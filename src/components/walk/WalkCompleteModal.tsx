'use client';

import { useMemo, useRef, useState } from 'react';
import { Timer, Route, Zap, Flame, Camera, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import ShareCard from '@/components/walk/ShareCard';
import { captureShareCard, downloadImage, shareImage } from '@/lib/share-card';
import { pathToSvg } from '@/lib/path-to-svg';
import { getWalkCompleteMessage } from '@/lib/walk-messages';
import type { Coordinate } from '@/types/route';

interface WalkCompleteModalProps {
  distance: number;
  durationSec: number;
  coordinates: Coordinate[];
  petName?: string;
  photoCount?: number;
  onConfirm: () => void;
}

export default function WalkCompleteModal({
  distance, durationSec, coordinates, petName, photoCount = 0, onConfirm,
}: WalkCompleteModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const km = (distance / 1000).toFixed(2);
  const mins = Math.round(durationSec / 60);
  const avgSpeed = durationSec > 0 ? ((distance / durationSec) * 60).toFixed(0) : '0';
  const kcal = Math.round((distance / 1000) * 65 * 0.5);
  const svg = useMemo(() => pathToSvg(coordinates, 280, 120), [coordinates]);
  const message = useMemo(() => getWalkCompleteMessage(petName, km), [petName, km]);

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const url = await captureShareCard(cardRef.current);
      // iOS는 download가 안 먹으므로 Web Share → "이미지 저장" 유도
      const shared = await shareImage(url);
      if (shared) { toast.success('이미지를 저장/공유했어요!'); }
      else { await downloadImage(url, `mungwalk-${Date.now()}.png`); toast.success('이미지가 저장되었어요!'); }
    } catch { toast.error('저장에 실패했어요.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* 숨겨진 ShareCard (캡처용) */}
      <div className="fixed left-[-9999px]">
        <ShareCard ref={cardRef} coordinates={coordinates} distance={distance} durationSec={durationSec} petName={petName} />
      </div>

      <div className="mx-6 w-full max-w-sm animate-slide-up rounded-mw-xl bg-gradient-to-b from-mw-green-50 to-white px-6 pb-8 pt-6">
        <div className="flex h-[120px] items-center justify-center rounded-mw-lg bg-white/80">
          {svg ? (
            <svg width="280" height="120" viewBox="0 0 280 120">
              <path d={svg.d} fill="none" stroke="#2D8A42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={svg.startX} cy={svg.startY} r="4" fill="#2D8A42" />
            </svg>
          ) : (
            <Route size={32} className="text-mw-gray-300" />
          )}
        </div>

        <p className="mt-4 text-center text-[15px] font-bold text-mw-gray-900">{message}</p>

        <div className="mt-4 flex items-end justify-center gap-1">
          <span className="text-[40px] font-extrabold leading-none text-mw-green-500">{km}</span>
          <span className="pb-1 text-[16px] font-semibold text-mw-green-400">km</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <Stat icon={<Timer size={14} className="text-mw-green-500" />} label="시간" value={`${mins}분`} />
          <Stat icon={<Zap size={14} className="text-mw-amber-500" />} label="속도" value={`${avgSpeed}m/분`} />
          <Stat icon={<Flame size={14} className="text-mw-danger" />} label="칼로리" value={`${kcal}kcal`} />
          <Stat icon={<Camera size={14} className="text-mw-info" />} label="사진" value={`${photoCount}장`} />
        </div>

        <button onClick={handleSave} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-mw bg-mw-green-50 py-3 text-[14px] font-semibold text-mw-green-600 active:scale-[0.97] disabled:opacity-50">
          <Download size={16} /> 산책 카드 저장 / 공유
        </button>

        <button onClick={onConfirm} className="mt-2 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white active:scale-[0.97]">
          완료
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-mw-sm bg-white/80 py-2.5">
      {icon}
      <span className="text-[10px] text-mw-gray-400">{label}</span>
      <span className="text-[13px] font-bold text-mw-gray-900">{value}</span>
    </div>
  );
}
