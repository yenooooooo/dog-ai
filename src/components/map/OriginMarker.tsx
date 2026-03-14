'use client';

import { useEffect, useRef } from 'react';

import type { Coordinate } from '@/types/route';

interface OriginMarkerProps {
  map: kakao.maps.Map;
  position: Coordinate;
}

const MARKER_HTML = `<div style="
  width:28px;height:28px;
  background:#EF4444;
  border:3px solid white;
  border-radius:50%;
  box-shadow:0 2px 8px rgba(0,0,0,0.25);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;color:white;font-weight:bold;
">📍</div>`;

/** 사용자가 지정한 출발 위치 마커 (빨간색) */
export default function OriginMarker({ map, position }: OriginMarkerProps) {
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    const latlng = new window.kakao.maps.LatLng(position.lat, position.lng);

    if (overlayRef.current) {
      overlayRef.current.setPosition(latlng);
      return;
    }

    const overlay = new window.kakao.maps.CustomOverlay({
      content: MARKER_HTML,
      position: latlng,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map, position]);

  return null;
}
