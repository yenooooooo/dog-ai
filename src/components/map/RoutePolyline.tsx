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

    if (fitBounds) {
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      // 바텀시트 영역 보정: 남쪽 경계를 확장
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const latPad = (ne.getLat() - sw.getLat()) * 0.5;
      bounds.extend(
        new window.kakao.maps.LatLng(sw.getLat() - latPad, sw.getLng())
      );
      map.setBounds(bounds);
    }

    // 언마운트 시 폴리라인 제거
    return () => {
      polyline.setMap(null);
      polylineRef.current = null;
    };
  }, [map, path, color, opacity, weight, fitBounds, dashed]);

  return null;
}
