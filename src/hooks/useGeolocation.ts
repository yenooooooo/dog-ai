'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { getDistanceMeters } from '@/lib/geo-utils';
import type { Coordinate } from '@/types/route';

interface GeolocationState {
  position: Coordinate | null;
  error: string | null;
  isLoading: boolean;
}

const ACCURACY_THRESHOLD = 50;
const JUMP_THRESHOLD = 500;
const MIN_MOVE_METERS = 3;
const MIN_INTERVAL_MS = 5000;
// 방향 급변 필터: 짧은 거리(15m 이내)에서 90도 이상 꺾이면 노이즈
const ANGLE_FILTER_DIST = 15;
const ANGLE_FILTER_DEG = 90;

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef<Coordinate | null>(null);
  const prevPosRef = useRef<Coordinate | null>(null); // 2개 전 좌표 (방향 계산용)

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
          if (dist > JUMP_THRESHOLD) return;
          if (dist < MIN_MOVE_METERS) return;

          // 방향 급변 필터: 짧은 거리에서 급격한 방향 전환 = GPS 노이즈
          if (prevPosRef.current && dist < ANGLE_FILTER_DIST) {
            const prev = lastPosRef.current;
            const pp = prevPosRef.current;
            const a1 = Math.atan2(prev.lng - pp.lng, prev.lat - pp.lat);
            const a2 = Math.atan2(coord.lng - prev.lng, coord.lat - prev.lat);
            const diff = Math.abs(a2 - a1) * (180 / Math.PI);
            const angle = diff > 180 ? 360 - diff : diff;
            if (angle > ANGLE_FILTER_DEG) return;
          }
        }

        lastTimeRef.current = now;
        prevPosRef.current = lastPosRef.current;
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
