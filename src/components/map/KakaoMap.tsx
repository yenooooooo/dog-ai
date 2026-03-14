'use client';

import { useEffect, useRef } from 'react';

import { useKakaoMap } from '@/hooks/useKakaoMap';
import type { Coordinate } from '@/types/route';

interface KakaoMapProps {
  center: Coordinate;
  level?: number;
  currentPosition?: Coordinate | null;
  /** true면 현위치 변경 시 지도 중심을 따라감 */
  followPosition?: boolean;
  /** 지도 클릭 시 좌표 반환 */
  onMapClick?: (coord: Coordinate) => void;
  onMapReady?: (map: kakao.maps.Map) => void;
  className?: string;
}

// 현위치 파란 점 — 경로(초록)와 구분되는 색상
const POSITION_DOT_HTML = `<div style="
  width:18px;height:18px;
  background:#4A90D9;
  border:3px solid white;
  border-radius:50%;
  box-shadow:0 0 0 2px rgba(74,144,217,0.3),0 2px 4px rgba(0,0,0,0.2);
"></div>`;

export default function KakaoMap({
  center,
  level = 3,
  currentPosition,
  followPosition = false,
  onMapClick,
  onMapReady,
  className = 'h-full w-full',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const hasPannedRef = useRef(false);
  const { map, isLoaded, error } = useKakaoMap(containerRef, { center, level });

  useEffect(() => {
    if (!map || !isLoaded || !currentPosition) return;

    const latlng = new window.kakao.maps.LatLng(
      currentPosition.lat,
      currentPosition.lng
    );

    // 첫 GPS 수신 시 항상 이동, 이후엔 followPosition일 때만
    if (!hasPannedRef.current || followPosition) {
      map.panTo(latlng);
      hasPannedRef.current = true;
    }

    if (overlayRef.current) {
      overlayRef.current.setPosition(latlng);
      return;
    }

    const overlay = new window.kakao.maps.CustomOverlay({
      content: POSITION_DOT_HTML,
      position: latlng,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });
    overlay.setMap(map);
    overlayRef.current = overlay;
  }, [map, isLoaded, currentPosition, followPosition]);

  useEffect(() => {
    if (isLoaded && map) onMapReady?.(map);
  }, [isLoaded, map, onMapReady]);

  // 지도 클릭 이벤트
  useEffect(() => {
    if (!map || !isLoaded || !onMapClick) return;
    const handler = (e: kakao.maps.event.MouseEvent) => {
      const ll = e.latLng;
      onMapClick({ lat: ll.getLat(), lng: ll.getLng() });
    };
    window.kakao.maps.event.addListener(map, 'click', handler);
    return () => {
      window.kakao.maps.event.removeListener(map, 'click', handler);
    };
  }, [map, isLoaded, onMapClick]);

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
