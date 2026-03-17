'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { getDistanceMeters } from '@/lib/geo-utils';
import type { Coordinate } from '@/types/route';

interface GeolocationState {
  position: Coordinate | null;
  error: string | null;
  isLoading: boolean;
}

const ACCURACY_THRESHOLD = 50; // 정확도 50m 초과 시 무시 (도시 모바일 GPS 보통 30~60m)
const JUMP_THRESHOLD = 500; // 이전 위치 대비 500m 이상 점프 무시
const MIN_MOVE_METERS = 3; // 최소 3m 이상 이동해야 기록 (노이즈 방지)
const MIN_INTERVAL_MS = 5000; // 최소 5초 간격

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef<Coordinate | null>(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: 'GPS를 지원하지 않는 브라우저예요.',
        isLoading: false,
      });
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geo) => {
        const now = Date.now();

        // 5초 간격 필터링
        if (now - lastTimeRef.current < MIN_INTERVAL_MS) return;

        // 정확도 필터링
        if (geo.coords.accuracy > ACCURACY_THRESHOLD) return;

        const coord: Coordinate = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
        };

        // 비정상 점프 + 최소 이동 거리 필터링
        if (lastPosRef.current) {
          const dist = getDistanceMeters(lastPosRef.current, coord);
          if (dist > JUMP_THRESHOLD) return; // 점프 무시
          if (dist < MIN_MOVE_METERS) return; // 노이즈 무시 (지그재그 방지)
        }

        lastTimeRef.current = now;
        lastPosRef.current = coord;
        setState({ position: coord, error: null, isLoading: false });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 필요해요. 설정에서 허용해주세요.'
            : '위치를 가져올 수 없어요. 실외에서 다시 시도해주세요.';
        console.error('GPS 오류:', err);
        setState((prev) => ({ ...prev, error: msg, isLoading: false }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    startWatching();
    return stopWatching;
  }, [startWatching, stopWatching]);

  return { ...state, startWatching, stopWatching };
}
