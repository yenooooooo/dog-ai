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
  startedAt: number | null;
  coordinates: Coordinate[];
  distance: number;

  startWalk: () => void;
  addCoordinate: (coord: Coordinate) => void;
  endWalk: () => WalkResult;
  reset: () => void;
}

export const useWalkStore = create<WalkStore>((set, get) => ({
  isWalking: false,
  startedAt: null,
  coordinates: [],
  distance: 0,

  startWalk: () =>
    set({ isWalking: true, startedAt: Date.now(), coordinates: [], distance: 0 }),

  addCoordinate: (coord) => {
    const { coordinates, distance } = get();
    const prev = coordinates[coordinates.length - 1];
    const added = prev ? getDistanceMeters(prev, coord) : 0;
    set({
      coordinates: [...coordinates, coord],
      distance: distance + added,
    });
  },

  endWalk: () => {
    const { coordinates, distance, startedAt } = get();
    const durationSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    set({ isWalking: false });
    return { coordinates, distance, durationSec, startedAt: startedAt ?? Date.now() };
  },

  reset: () =>
    set({ isWalking: false, startedAt: null, coordinates: [], distance: 0 }),
}));
