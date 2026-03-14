'use client';

import { useEffect, useRef } from 'react';

import { TAG_META } from '@/lib/tag-constants';
import type { StoredTag } from '@/lib/tag-storage';

interface TagMarkersProps {
  map: kakao.maps.Map | null;
  tags: StoredTag[];
  onTagClick?: (tag: StoredTag) => void;
}

export default function TagMarkers({ map, tags, onTagClick }: TagMarkersProps) {
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);

  useEffect(() => {
    if (!map) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    // 태그별 마커 생성 (32×32px, 흰 배경, 태그 색상 테두리)
    tags.forEach((tag) => {
      const meta = TAG_META[tag.tagType];
      const el = document.createElement('div');
      el.innerHTML = `<div style="
        width:32px;height:32px;
        background:white;
        border:2px solid ${meta.color};
        border-radius:10px;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        cursor:pointer;
      ">${meta.emoji}</div>`;

      if (onTagClick) {
        el.addEventListener('click', (e) => { e.stopPropagation(); onTagClick(tag); });
      }

      const overlay = new window.kakao.maps.CustomOverlay({
        content: el,
        position: new window.kakao.maps.LatLng(
          tag.location.lat,
          tag.location.lng
        ),
        yAnchor: 0.5,
        xAnchor: 0.5,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [map, tags, onTagClick]);

  return null;
}
