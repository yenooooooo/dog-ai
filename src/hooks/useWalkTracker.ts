'use client';

import { useEffect, useRef, useState } from 'react';

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
    reset: () => { setElapsed(0); reset(); },
  };
}
