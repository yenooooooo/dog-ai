'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { loadKakaoMapSDK } from '@/lib/kakao/loader';
import type { Coordinate } from '@/types/route';

interface UseKakaoMapOptions {
  center: Coordinate;
  level?: number;
}

export function useKakaoMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseKakaoMapOptions
) {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // center/level은 초기화 전용 — 이후 변경은 panTo 사용
  const centerRef = useRef(options.center);
  const levelRef = useRef(options.level ?? 3);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    async function init() {
      try {
        await loadKakaoMapSDK();
        if (cancelled || !container) return;

        const center = new window.kakao.maps.LatLng(
          centerRef.current.lat,
          centerRef.current.lng
        );
        const map = new window.kakao.maps.Map(container, {
          center,
          level: levelRef.current,
        });

        mapRef.current = map;
        if (!cancelled) setIsLoaded(true);
      } catch (err) {
        console.error('카카오맵 초기화 실패:', err);
        if (!cancelled) setError('지도를 불러오지 못했어요.');
      }
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current = null;
    };
  }, [containerRef]);

  const panTo = useCallback((coord: Coordinate) => {
    if (!mapRef.current) return;
    const latlng = new window.kakao.maps.LatLng(coord.lat, coord.lng);
    mapRef.current.panTo(latlng);
  }, []);

  return { map: mapRef.current, isLoaded, error, panTo };
}
