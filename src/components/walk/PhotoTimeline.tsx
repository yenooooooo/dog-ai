'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

import type { WalkPhoto } from '@/types/walk-photo';
import PhotoGalleryModal from '@/components/walk/PhotoGalleryModal';

interface PhotoTimelineProps {
  photos: WalkPhoto[];
  /** 산책 시작 시각 (ms) — 상대 시간 계산용 */
  walkStartedAt?: number;
}

/** 상대 시간 포맷: "2분", "1시간 5분" */
function relativeTime(photoTs: number, baseTs: number): string {
  const diffSec = Math.max(0, Math.round((photoTs - baseTs) / 1000));
  const mins = Math.floor(diffSec / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}시간 ${mins % 60}분`;
  return `${mins}분`;
}

export default function PhotoTimeline({ photos, walkStartedAt }: PhotoTimelineProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const base = walkStartedAt ?? photos[0]?.timestamp ?? 0;

  return (
    <>
      <div className="mt-4 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <ImageIcon size={14} className="text-mw-green-500" />
          <span className="text-[14px] font-bold text-mw-gray-900">
            사진 ({photos.length})
          </span>
        </div>

        {/* 가로 스크롤 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedIdx(idx)}
              className="relative shrink-0 overflow-hidden rounded-mw-sm active:scale-[0.97]"
            >
              <img
                src={p.dataUrl}
                alt={`사진 ${idx + 1}`}
                className="h-20 w-20 object-cover"
              />
              {base > 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">
                  {relativeTime(p.timestamp, base)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedIdx !== null && (
        <PhotoGalleryModal
          photos={photos}
          initialIndex={selectedIdx}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </>
  );
}
