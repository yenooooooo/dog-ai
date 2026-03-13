'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  captureShareCard,
  downloadImage,
  shareImage,
} from '@/lib/share-card';
import ShareCard from '@/components/walk/ShareCard';
import type { Coordinate } from '@/types/route';

interface ShareCardPreviewProps {
  coordinates: Coordinate[];
  distance: number;
  durationSec: number;
  petName?: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ShareCardPreview({
  coordinates,
  distance,
  durationSec,
  petName,
  onBack,
  onConfirm,
}: ShareCardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      downloadImage(url, `mungwalk-${Date.now()}.png`);
      toast.success('이미지가 저장되었어요!');
    } catch {
      toast.error('이미지 저장에 실패했어요.');
    } finally {
      setCapturing(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      const shared = await shareImage(url);
      if (!shared) downloadImage(url, `mungwalk-${Date.now()}.png`);
    } catch {
      toast.error('공유에 실패했어요.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mb-4 flex w-full max-w-sm items-center px-4">
        <button onClick={onBack} className="rounded-full bg-white/20 p-2">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <span className="ml-3 text-[15px] font-semibold text-white">
          공유 카드
        </span>
      </div>

      {/* 카드 미리보기 (360×450 → 280×350 축소) */}
      <div className="h-[350px] w-[280px] overflow-hidden rounded-mw-lg shadow-lg">
        <div className="origin-top-left scale-[0.778]">
          <ShareCard
            ref={cardRef}
            coordinates={coordinates}
            distance={distance}
            durationSec={durationSec}
            petName={petName}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={capturing}
          className="flex items-center gap-2 rounded-mw bg-white px-5 py-3 text-[14px] font-semibold text-mw-gray-800 transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Download size={16} />
          이미지 저장
        </button>
        <button
          onClick={handleShare}
          disabled={capturing}
          className="flex items-center gap-2 rounded-mw bg-mw-green-500 px-5 py-3 text-[14px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Share2 size={16} />
          공유하기
        </button>
      </div>

      <button
        onClick={onConfirm}
        className="mt-3 text-[13px] text-white/70"
      >
        건너뛰기
      </button>
    </div>
  );
}
