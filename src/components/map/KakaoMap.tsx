'use client';

import { useEffect, useRef } from 'react';

import { useKakaoMap } from '@/hooks/useKakaoMap';
import { isMapClickBlocked } from '@/lib/map-click-guard';
import type { Coordinate } from '@/types/route';

interface KakaoMapProps {
  center: Coordinate;
  level?: number;
  currentPosition?: Coordinate | null;
  /** GPS heading in degrees (0=north). null = no direction info */
  heading?: number | null;
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

/** heading이 있을 때 방향 화살표를 포함한 마커 HTML 생성 */
function buildHeadingHTML(deg: number): string {
  const arrow = `position:absolute;top:0;left:50%;transform:translateX(-50%) rotate(${deg}deg);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #4A90D9;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))`;
  const dot = `position:absolute;top:10px;left:50%;transform:translateX(-50%);width:18px;height:18px;background:#4A90D9;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(74,144,217,0.3),0 2px 4px rgba(0,0,0,0.2)`;
  return `<div style="position:relative;width:36px;height:36px;"><div style="${arrow}"></div><div style="${dot}"></div></div>`;
}

export default function KakaoMap({
  center,
  level = 3,
  currentPosition,
  heading = null,
  followPosition = false,
  onMapClick,
  onMapReady,
  className = 'h-full w-full',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const lastHeadingRef = useRef<number | null>(null);
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

    const hasHeading = typeof heading === 'number';
    const headingChanged = hasHeading && heading !== lastHeadingRef.current;
    lastHeadingRef.current = heading;
    const html = hasHeading ? buildHeadingHTML(heading) : POSITION_DOT_HTML;

    // heading이 바뀌면 overlay를 재생성해야 콘텐츠가 갱신됨
    if (overlayRef.current && !headingChanged) {
      overlayRef.current.setPosition(latlng);
      return;
    }
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
    }

    const overlay = new window.kakao.maps.CustomOverlay({
      content: html,
      position: latlng,
      yAnchor: hasHeading ? 0.7 : 0.5,
      xAnchor: 0.5,
    });
    overlay.setMap(map);
    overlayRef.current = overlay;
  }, [map, isLoaded, currentPosition, heading, followPosition]);

  useEffect(() => {
    if (isLoaded && map) onMapReady?.(map);
  }, [isLoaded, map, onMapReady]);

  // 지도 클릭 이벤트
  useEffect(() => {
    if (!map || !isLoaded || !onMapClick) return;
    const handler = (e: kakao.maps.event.MouseEvent) => {
      if (isMapClickBlocked()) return;
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

  // 헤딩 모드: followPosition + heading 유효 시 지도 컨테이너를 CSS 회전
  const shouldRotate = followPosition && typeof heading === 'number';
  const rotation = shouldRotate ? -heading : 0;

  return (
    <div className={`${className} overflow-hidden`}>
      <div
        ref={containerRef}
        className="h-full w-full transition-transform duration-500 ease-out"
        style={rotation !== 0 ? {
          transform: `rotate(${rotation}deg)`,
          // 회전 시 모서리가 보이지 않도록 살짝 확대
          width: '120%', height: '120%',
          marginLeft: '-10%', marginTop: '-10%',
        } : undefined}
      />
    </div>
  );
}
