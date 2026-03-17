'use client';

import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import ShareCard from '@/components/walk/ShareCard';
import { captureShareCard, downloadImage, shareImage } from '@/lib/share-card';
import type { Coordinate } from '@/types/route';

interface HistoryShareCardProps {
  coordinates: Coordinate[];
  distance: number;
  durationSec: number;
  petName?: string;
}

export default function HistoryShareCard({
  coordinates, distance, durationSec, petName,
}: HistoryShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleSave = async () => {
    if (!cardRef.current || capturing) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      const shared = await shareImage(url);
      if (shared) { toast.success('저장/공유 완료!'); }
      else { await downloadImage(url, `mungwalk-${Date.now()}.png`); toast.success('이미지가 저장되었어요!'); }
    } catch { toast.error('저장에 실패했어요.'); }
    finally { setCapturing(false); }
  };

  return (
    <div className="mt-4 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="mb-3 text-[14px] font-bold text-mw-gray-900">📸 공유 카드</p>

      <div className="mx-auto h-[256px] w-[144px] overflow-hidden rounded-mw-sm shadow-sm">
        <div className="origin-top-left scale-[0.4]">
          <ShareCard ref={cardRef} coordinates={coordinates} distance={distance} durationSec={durationSec} petName={petName} />
        </div>
      </div>

      <button onClick={handleSave} disabled={capturing} className="mt-3 flex w-full items-center justify-center gap-2 rounded-mw bg-mw-green-500 py-2.5 text-[13px] font-semibold text-white active:scale-[0.97] disabled:opacity-50">
        <Download size={14} /> 저장 / 공유
      </button>
    </div>
  );
}
