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
  dashed?: boolean;
}

export default function RoutePolyline({
  map,
  path,
  color = '#2D8A42',
  opacity = 0.8,
  weight = 5,
  fitBounds = true,
  dashed = false,
}: RoutePolylineProps) {
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);
  const prevLenRef = useRef(0);

  // 폴리라인 생성 (최초 1회)
  useEffect(() => {
    if (path.length < 2) return;

    const linePath = path.map(
      (c) => new window.kakao.maps.LatLng(c.lat, c.lng)
    );

    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: weight,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeStyle: dashed ? 'shortdash' : 'solid',
    });
    polyline.setMap(map);
    polylineRef.current = polyline;
    prevLenRef.current = path.length;

    if (fitBounds) {
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const latPad = (ne.getLat() - sw.getLat()) * 0.5;
      bounds.extend(
        new window.kakao.maps.LatLng(sw.getLat() - latPad, sw.getLng())
      );
      map.setBounds(bounds);
    }

    return () => {
      polyline.setMap(null);
      polylineRef.current = null;
      prevLenRef.current = 0;
    };
  // 스타일/맵 변경 시에만 재생성, path 변경은 아래 effect에서 처리
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, color, opacity, weight, fitBounds, dashed]);

  // 좌표 추가 시 setPath()로 업데이트 (재생성 없음 → 깜빡임 방지)
  useEffect(() => {
    if (!polylineRef.current || path.length < 2) return;
    // 좌표가 추가됐을 때만 업데이트 (불필요한 렌더 방지)
    if (path.length === prevLenRef.current) return;
    prevLenRef.current = path.length;

    const linePath = path.map(
      (c) => new window.kakao.maps.LatLng(c.lat, c.lng)
    );
    polylineRef.current.setPath(linePath);
  }, [path]);

  return null;
}
