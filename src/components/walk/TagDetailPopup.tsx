'use client';

import { ThumbsUp, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TAG_META } from '@/lib/tag-constants';
import type { StoredTag } from '@/lib/tag-storage';

interface TagDetailPopupProps {
  tag: StoredTag;
  voted: boolean;
  onVote: () => void;
  onClose: () => void;
}

export default function TagDetailPopup({
  tag,
  voted,
  onVote,
  onClose,
}: TagDetailPopupProps) {
  const meta = TAG_META[tag.tagType];
  const timeAgo = getTimeAgo(tag.createdAt);

  return (
    <div className="absolute bottom-28 left-4 right-4 z-50 animate-slide-up">
      <div className="rounded-mw-lg bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-mw-sm text-[18px]"
              style={{ backgroundColor: `${meta.color}20` }}
            >
              {meta.emoji}
            </span>
            <div>
              <p className="text-[15px] font-bold text-mw-gray-900">
                {meta.label}
              </p>
              <p className="text-[12px] text-mw-gray-400">{timeAgo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1">
            <X size={18} className="text-mw-gray-400" />
          </button>
        </div>

        {tag.description && (
          <p className="mt-2 text-[13px] text-mw-gray-600">
            {tag.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] text-mw-gray-400">
            {tag.helpfulCount}명이 도움됐어요
          </span>
          <button
            onClick={onVote}
            disabled={voted}
            className={cn(
              'flex items-center gap-1.5 rounded-mw-sm px-3 py-2 text-[13px] font-medium transition-all active:scale-[0.97]',
              voted
                ? 'bg-mw-green-50 text-mw-green-500'
                : 'bg-mw-gray-100 text-mw-gray-600'
            )}
          >
            <ThumbsUp size={14} />
            {voted ? '투표 완료' : '도움됐어요'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}
