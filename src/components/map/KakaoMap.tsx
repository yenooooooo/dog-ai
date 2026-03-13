'use client';

import { useEffect, useRef } from 'react';

import { useKakaoMap } from '@/hooks/useKakaoMap';
import type { Coordinate } from '@/types/route';

interface KakaoMapProps {
  center: Coordinate;
  level?: number;
  currentPosition?: Coordinate | null;
  onMapReady?: (map: kakao.maps.Map) => void;
  className?: string;
}

// 현위치 파란 점 (DESIGN.md 브랜드 컬러)
const POSITION_DOT_HTML = `<div style="
  width:18px;height:18px;
  background:#2D8A42;
  border:3px solid white;
  border-radius:50%;
  box-shadow:0 0 0 2px rgba(45,138,66,0.3),0 2px 4px rgba(0,0,0,0.2);
"></div>`;

export default function KakaoMap({
  center,
  level = 3,
  currentPosition,
  onMapReady,
  className = 'h-full w-full',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const hasPannedRef = useRef(false);
  const { map, isLoaded, error } = useKakaoMap(containerRef, { center, level });

  // 현위치 마커 + 첫 GPS 수신 시 지도 이동
  useEffect(() => {
    if (!map || !isLoaded || !currentPosition) return;

    const latlng = new window.kakao.maps.LatLng(
      currentPosition.lat,
      currentPosition.lng
    );

    // 첫 GPS 수신 → 지도 중심 이동 (1회)
    if (!hasPannedRef.current) {
      map.panTo(latlng);
      hasPannedRef.current = true;
    }

    // 기존 오버레이가 있으면 위치만 업데이트
    if (overlayRef.current) {
      overlayRef.current.setPosition(latlng);
      return;
    }

    // 새 오버레이 생성
    const overlay = new window.kakao.maps.CustomOverlay({
      content: POSITION_DOT_HTML,
      position: latlng,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });
    overlay.setMap(map);
    overlayRef.current = overlay;
  }, [map, isLoaded, currentPosition]);

  // 맵 인스턴스 콜백
  useEffect(() => {
    if (isLoaded && map) onMapReady?.(map);
  }, [isLoaded, map, onMapReady]);

  // 마커 정리 (언마운트 시)
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-mw-gray-100 ${className}`}>
        <p className="text-[13px] text-mw-gray-500">{error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
