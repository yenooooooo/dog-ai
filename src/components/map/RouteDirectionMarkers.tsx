'use client';

import { useEffect, useRef } from 'react';

import type { Coordinate } from '@/types/route';

interface RouteDirectionMarkersProps {
  map: kakao.maps.Map;
  path: Coordinate[];
}

/** 두 좌표 사이의 방위각(도) 계산 */
function getBearing(a: Coordinate, b: Coordinate): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function createStartMarker() {
  return `<div style="
    background:#2D8A42;color:white;
    padding:4px 10px;border-radius:12px;
    font-size:12px;font-weight:700;
    box-shadow:0 2px 8px rgba(0,0,0,0.2);
    white-space:nowrap;
  ">출발 →</div>`;
}

function createArrow(rotation: number) {
  return `<div style="
    width:20px;height:20px;
    display:flex;align-items:center;justify-content:center;
    transform:rotate(${rotation - 90}deg);
    font-size:14px;
    filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  ">➤</div>`;
}

// 경로를 N등분하여 방향 화살표를 배치할 인덱스 반환
function getArrowIndices(pathLen: number, count: number): number[] {
  if (pathLen < 4) return [];
  const step = Math.floor(pathLen / (count + 1));
  const indices: number[] = [];
  for (let i = 1; i <= count; i++) {
    const idx = step * i;
    if (idx < pathLen - 1) indices.push(idx);
  }
  return indices;
}

/** 루트 위에 출발 마커 + 방향 화살표 표시 */
export default function RouteDirectionMarkers({ map, path }: RouteDirectionMarkersProps) {
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);

  useEffect(() => {
    if (path.length < 2) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    // 출발점 마커
    const startOverlay = new window.kakao.maps.CustomOverlay({
      content: createStartMarker(),
      position: new window.kakao.maps.LatLng(path[0].lat, path[0].lng),
      yAnchor: 1.3,
      xAnchor: 0.5,
    });
    startOverlay.setMap(map);
    overlaysRef.current.push(startOverlay);

    // 경로 위 방향 화살표 (4~5개)
    const arrowCount = Math.min(5, Math.floor(path.length / 10));
    const indices = getArrowIndices(path.length, arrowCount);

    indices.forEach((idx) => {
      const bearing = getBearing(path[idx], path[idx + 1]);
      const overlay = new window.kakao.maps.CustomOverlay({
        content: createArrow(bearing),
        position: new window.kakao.maps.LatLng(path[idx].lat, path[idx].lng),
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
  }, [map, path]);

  return null;
}
