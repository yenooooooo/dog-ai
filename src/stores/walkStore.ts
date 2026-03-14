import { create } from 'zustand';

import { getDistanceMeters } from '@/lib/geo-utils';
import type { Coordinate } from '@/types/route';

export interface WalkResult {
  coordinates: Coordinate[];
  distance: number;
  durationSec: number;
  startedAt: number;
}

interface WalkStore {
  isWalking: boolean;
  isPaused: boolean;
  startedAt: number | null;
  pausedDuration: number;
  pauseStartedAt: number | null;
  coordinates: Coordinate[];
  distance: number;
  targetDistance: number;

  startWalk: (targetDist?: number) => void;
  pauseWalk: () => void;
  resumeWalk: () => void;
  addCoordinate: (coord: Coordinate) => void;
  endWalk: () => WalkResult;
  reset: () => void;
}

export const useWalkStore = create<WalkStore>((set, get) => ({
  isWalking: false,
  isPaused: false,
  startedAt: null,
  pausedDuration: 0,
  pauseStartedAt: null,
  coordinates: [],
  distance: 0,
  targetDistance: 0,

  startWalk: (targetDist) =>
    set({ isWalking: true, isPaused: false, startedAt: Date.now(), pausedDuration: 0, pauseStartedAt: null, coordinates: [], distance: 0, targetDistance: targetDist ?? 0 }),

  pauseWalk: () => set({ isPaused: true, pauseStartedAt: Date.now() }),

  resumeWalk: () => {
    const { pauseStartedAt, pausedDuration } = get();
    const added = pauseStartedAt ? Date.now() - pauseStartedAt : 0;
    set({ isPaused: false, pauseStartedAt: null, pausedDuration: pausedDuration + added });
  },

  addCoordinate: (coord) => {
    const { coordinates, distance, isPaused } = get();
    if (isPaused) return;
    const prev = coordinates[coordinates.length - 1];
    const added = prev ? getDistanceMeters(prev, coord) : 0;
    set({ coordinates: [...coordinates, coord], distance: distance + added });
  },

  endWalk: () => {
    const { coordinates, distance, startedAt, pausedDuration } = get();
    const totalMs = startedAt ? Date.now() - startedAt : 0;
    const durationSec = Math.round((totalMs - pausedDuration) / 1000);
    set({ isWalking: false, isPaused: false });
    return { coordinates, distance, durationSec, startedAt: startedAt ?? Date.now() };
  },

  reset: () =>
    set({ isWalking: false, isPaused: false, startedAt: null, pausedDuration: 0, pauseStartedAt: null, coordinates: [], distance: 0, targetDistance: 0 }),
}));
