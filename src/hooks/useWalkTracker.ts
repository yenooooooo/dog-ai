'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useCompass } from '@/hooks/useCompass';
import { useWalkStore } from '@/stores/walkStore';

export function useWalkTracker() {
  const { position, heading: gpsHeading, error, isLoading } = useGeolocation();
  const { compassHeading } = useCompass();
  // 걷는 중(GPS heading 있음) → GPS, 서 있을 때 → 나침반
  const heading = gpsHeading ?? compassHeading;
  const {
    isWalking, isPaused, startedAt, targetDistance,
    coordinates, distance,
    startWalk, pauseWalk, resumeWalk, addCoordinate, endWalk, reset,
  } = useWalkStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const halfAlerted = useRef(false);
  const milestoneRef = useRef(0);

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

  // 500m마다 마일스톤 축하 토스트
  useEffect(() => {
    if (!isWalking) return;
    const next = milestoneRef.current + 500;
    if (distance >= next) {
      milestoneRef.current = Math.floor(distance / 500) * 500;
      const km = milestoneRef.current / 1000;
      const msg = milestoneRef.current === 500
        ? '500m 돌파! 좋은 페이스예요 🐾'
        : milestoneRef.current === 1000
          ? '1km 달성! 대단해요!'
          : milestoneRef.current === 1500
            ? '1.5km! 오늘 컨디션 좋은데요?'
            : `${km}km 달성! 멋져요!`;
      toast.success(msg);
    }
  }, [isWalking, distance]);

  useEffect(() => {
    if (isWalking && !isPaused && position) addCoordinate(position);
  }, [isWalking, isPaused, position, addCoordinate]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    return endWalk();
  };

  return {
    position, heading, gpsError: error, gpsLoading: isLoading,
    isWalking, isPaused, coordinates, distance, elapsed, targetDistance,
    startWalk, pauseWalk, resumeWalk,
    endWalk: handleEnd,
    reset: () => { setElapsed(0); halfAlerted.current = false; milestoneRef.current = 0; reset(); },
  };
}
