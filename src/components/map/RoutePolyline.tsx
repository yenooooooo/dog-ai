'use client';

import { useEffect, useRef } from 'react';

import type { Coordinate } from '@/types/route';

interface RoutePolylineProps {
  map: kakao.maps.Map;
  path: Coordinate[];
  color?: string;
  opacity?: number;
  weight?: number;
  fitBounds?: boolean;
}

export default function RoutePolyline({
  map,
  path,
  color = '#2D8A42',
  opacity = 0.8,
  weight = 5,
  fitBounds = true,
}: RoutePolylineProps) {
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);

  useEffect(() => {
    if (path.length < 2) return;

    // 기존 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const linePath = path.map(
      (c) => new window.kakao.maps.LatLng(c.lat, c.lng)
    );

    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: weight,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeStyle: 'solid',
    });
    polyline.setMap(map);
    polylineRef.current = polyline;

    // 루트가 보이도록 지도 범위 조정
    if (fitBounds) {
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      map.setBounds(bounds);
    }

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, color, opacity, weight, fitBounds]);

  // 렌더링 없음 — 지도에 직접 그린다
  return null;
}
