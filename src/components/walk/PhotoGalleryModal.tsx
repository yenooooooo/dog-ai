'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import type { WalkPhoto } from '@/types/walk-photo';

interface PhotoGalleryModalProps {
  photos: WalkPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoGalleryModal({
  photos,
  initialIndex,
  onClose,
}: PhotoGalleryModalProps) {
  const [idx, setIdx] = useState(initialIndex);
  const total = photos.length;

  const goPrev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(() => setIdx((i) => (i < total - 1 ? i + 1 : i)), [total]);

  // 키보드 네비게이션
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  const photo = photos[idx];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[14px] font-medium text-white/80">
          {idx + 1} / {total}
        </span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          aria-label="닫기"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* 사진 */}
      <div className="flex flex-1 items-center justify-center px-2">
        <img
          src={photo.dataUrl}
          alt={`사진 ${idx + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* 좌우 네비게이션 */}
      <div className="flex items-center justify-between px-4 pb-6 pt-3">
        <button
          onClick={goPrev}
          disabled={idx === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20 disabled:opacity-30"
          aria-label="이전"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={goNext}
          disabled={idx === total - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20 disabled:opacity-30"
          aria-label="다음"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
