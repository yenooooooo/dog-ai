'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useWalkStore } from '@/stores/walkStore';

export function useWalkTracker() {
  const { position, error, isLoading } = useGeolocation();
  const {
    isWalking, isPaused, startedAt, targetDistance,
    coordinates, distance,
    startWalk, pauseWalk, resumeWalk, addCoordinate, endWalk, reset,
  } = useWalkStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const halfAlerted = useRef(false);

  useEffect(() => {
    if (isWalking && startedAt) {
      timerRef.current = setInterval(() => {
        const store = useWalkStore.getState();
        const paused = store.pausedDuration + (store.pauseStartedAt ? Date.now() - store.pauseStartedAt : 0);
        setElapsed(Math.round((Date.now() - startedAt - paused) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isWalking, startedAt]);

  // 목표 절반 도달 시 돌아가기 알림 (한 번만)
  useEffect(() => {
    if (!isWalking || targetDistance <= 0 || halfAlerted.current) return;
    if (distance >= targetDistance * 0.5) {
      halfAlerted.current = true;
      toast.info('목표의 절반을 걸었어요. 슬슬 돌아갈 준비를!');
    }
  }, [isWalking, distance, targetDistance]);

  useEffect(() => {
    if (isWalking && !isPaused && position) addCoordinate(position);
  }, [isWalking, isPaused, position, addCoordinate]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    return endWalk();
  };

  return {
    position, gpsError: error, gpsLoading: isLoading,
    isWalking, isPaused, coordinates, distance, elapsed, targetDistance,
    startWalk, pauseWalk, resumeWalk,
    endWalk: handleEnd,
    reset: () => { setElapsed(0); halfAlerted.current = false; reset(); },
  };
}
