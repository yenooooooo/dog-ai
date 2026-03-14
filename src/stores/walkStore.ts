import { create } from 'zustand';

import { getDistanceMeters } from '@/lib/geo-utils';
import type { Coordinate } from '@/types/route';

const BACKUP_KEY = 'mw_walk_backup';
const BACKUP_INTERVAL_MS = 30_000;

export interface WalkResult {
  coordinates: Coordinate[];
  distance: number;
  durationSec: number;
  startedAt: number;
}

interface BackupData {
  isWalking: boolean;
  startedAt: number | null;
  coordinates: Coordinate[];
  distance: number;
  pausedDuration: number;
  targetDistance: number;
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
  lastBackupAt: number;

  startWalk: (targetDist?: number) => void;
  pauseWalk: () => void;
  resumeWalk: () => void;
  addCoordinate: (coord: Coordinate) => void;
  endWalk: () => WalkResult;
  reset: () => void;
  restoreWalk: () => boolean;
}

function clearBackup(): void {
  try { localStorage.removeItem(BACKUP_KEY); } catch { /* noop */ }
}

function saveBackup(state: BackupData): void {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패 무시
  }
}

function loadBackup(): BackupData | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BackupData;
  } catch {
    return null;
  }
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
  lastBackupAt: 0,

  startWalk: (targetDist) => {
    clearBackup();
    set({
      isWalking: true, isPaused: false, startedAt: Date.now(),
      pausedDuration: 0, pauseStartedAt: null,
      coordinates: [], distance: 0,
      targetDistance: targetDist ?? 0, lastBackupAt: Date.now(),
    });
  },

  pauseWalk: () => set({ isPaused: true, pauseStartedAt: Date.now() }),

  resumeWalk: () => {
    const { pauseStartedAt, pausedDuration } = get();
    const added = pauseStartedAt ? Date.now() - pauseStartedAt : 0;
    set({ isPaused: false, pauseStartedAt: null, pausedDuration: pausedDuration + added });
  },

  addCoordinate: (coord) => {
    const { coordinates, distance, isPaused, lastBackupAt } = get();
    if (isPaused) return;
    const prev = coordinates[coordinates.length - 1];
    const added = prev ? getDistanceMeters(prev, coord) : 0;
    const now = Date.now();
    const newCoords = [...coordinates, coord];
    const newDist = distance + added;
    set({ coordinates: newCoords, distance: newDist });

    if (now - lastBackupAt >= BACKUP_INTERVAL_MS) {
      const s = get();
      saveBackup({
        isWalking: s.isWalking, startedAt: s.startedAt,
        coordinates: newCoords, distance: newDist,
        pausedDuration: s.pausedDuration, targetDistance: s.targetDistance,
      });
      set({ lastBackupAt: now });
    }
  },

  endWalk: () => {
    const { coordinates, distance, startedAt, pausedDuration } = get();
    const totalMs = startedAt ? Date.now() - startedAt : 0;
    const durationSec = Math.round((totalMs - pausedDuration) / 1000);
    set({ isWalking: false, isPaused: false });
    clearBackup();
    return { coordinates, distance, durationSec, startedAt: startedAt ?? Date.now() };
  },

  reset: () => {
    clearBackup();
    set({
      isWalking: false, isPaused: false, startedAt: null,
      pausedDuration: 0, pauseStartedAt: null,
      coordinates: [], distance: 0, targetDistance: 0, lastBackupAt: 0,
    });
  },

  restoreWalk: () => {
    const backup = loadBackup();
    if (!backup || !backup.isWalking || !backup.startedAt) return false;
    set({
      isWalking: true, isPaused: false, startedAt: backup.startedAt,
      pausedDuration: backup.pausedDuration, pauseStartedAt: null,
      coordinates: backup.coordinates, distance: backup.distance,
      targetDistance: backup.targetDistance, lastBackupAt: Date.now(),
    });
    return true;
  },
}));
