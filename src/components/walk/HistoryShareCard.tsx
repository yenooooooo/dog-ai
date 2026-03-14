'use client';

import { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      downloadImage(url, `mungwalk-${Date.now()}.png`);
      toast.success('이미지가 저장되었어요!');
    } catch { toast.error('이미지 저장에 실패했어요.'); }
    finally { setCapturing(false); }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      const shared = await shareImage(url);
      if (!shared) downloadImage(url, `mungwalk-${Date.now()}.png`);
    } catch { toast.error('공유에 실패했어요.'); }
    finally { setCapturing(false); }
  };

  return (
    <div className="mt-4 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="mb-3 text-[14px] font-bold text-mw-gray-900">📸 공유 카드</p>

      {/* 카드 미리보기 (축소) */}
      <div className="mx-auto h-[225px] w-[180px] overflow-hidden rounded-mw-sm shadow-sm">
        <div className="origin-top-left scale-[0.5]">
          <ShareCard
            ref={cardRef}
            coordinates={coordinates}
            distance={distance}
            durationSec={durationSec}
            petName={petName}
          />
        </div>
      </div>

      {/* 다운로드/공유 버튼 */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDownload}
          disabled={capturing}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-mw bg-mw-gray-100 py-2.5 text-[13px] font-semibold text-mw-gray-700 active:scale-[0.97] disabled:opacity-50"
        >
          <Download size={14} />
          저장
        </button>
        <button
          onClick={handleShare}
          disabled={capturing}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-mw bg-mw-green-500 py-2.5 text-[13px] font-semibold text-white active:scale-[0.97] disabled:opacity-50"
        >
          <Share2 size={14} />
          공유
        </button>
      </div>
    </div>
  );
}
