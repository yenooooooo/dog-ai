'use client';

import { useEffect, useRef, useState } from 'react';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useWalkStore } from '@/stores/walkStore';

export function useWalkTracker() {
  const { position, error, isLoading } = useGeolocation();
  const {
    isWalking,
    startedAt,
    coordinates,
    distance,
    startWalk,
    addCoordinate,
    endWalk,
    reset,
  } = useWalkStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1초 간격 경과 시간 타이머
  useEffect(() => {
    if (isWalking && startedAt) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startedAt) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWalking, startedAt]);

  // GPS 좌표 → 스토어에 추가
  useEffect(() => {
    if (isWalking && position) {
      addCoordinate(position);
    }
  }, [isWalking, position, addCoordinate]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    return endWalk();
  };

  const handleReset = () => {
    setElapsed(0);
    reset();
  };

  return {
    position,
    gpsError: error,
    gpsLoading: isLoading,
    isWalking,
    coordinates,
    distance,
    elapsed,
    startWalk,
    endWalk: handleEnd,
    reset: handleReset,
  };
}
