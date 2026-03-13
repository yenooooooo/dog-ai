'use client';

import { useRef, useState, useCallback } from 'react';

import { cn } from '@/lib/utils';

interface BottomSheetProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  collapsedHeight?: number;
}

export default function BottomSheet({
  children,
  isExpanded: controlled,
  onToggle,
  collapsedHeight = 180,
}: BottomSheetProps) {
  const [internal, setInternal] = useState(false);
  const expanded = controlled ?? internal;
  const startYRef = useRef(0);

  const toggle = useCallback(
    (val: boolean) => {
      if (onToggle) onToggle(val);
      else setInternal(val);
    },
    [onToggle]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startYRef.current;
    if (Math.abs(diff) < 30) return;
    toggle(diff < 0); // 위로 스와이프 = 확장
  };

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40 rounded-t-mw-xl bg-white',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        'transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        expanded ? 'h-[70vh]' : ''
      )}
      style={expanded ? undefined : { height: `${collapsedHeight}px` }}
    >
      {/* 핸들 바 (DESIGN.md: 36×4px, mw-gray-300) */}
      <div
        className="flex cursor-grab justify-center pb-3 pt-2 active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => toggle(!expanded)}
      >
        <div className="h-1 w-9 rounded-sm bg-mw-gray-300" />
      </div>

      {/* 콘텐츠 */}
      <div className="max-h-[calc(100%-28px)] overflow-y-auto px-5 pb-5">
        {children}
      </div>
    </div>
  );
}
