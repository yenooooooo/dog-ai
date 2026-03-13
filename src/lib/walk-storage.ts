import type { Coordinate } from '@/types/route';

export interface StoredWalk {
  id: string;
  startedAt: string;
  endedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Coordinate[];
}

const STORAGE_KEY = 'mw_walk_records';

export function saveWalk(walk: Omit<StoredWalk, 'id'>): StoredWalk {
  const records = getWalks();
  const newWalk: StoredWalk = {
    ...walk,
    id: `walk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  records.unshift(newWalk);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newWalk;
}

export function getWalks(): StoredWalk[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredWalk[];
  } catch {
    return [];
  }
}

export function getWalkById(id: string): StoredWalk | null {
  return getWalks().find((w) => w.id === id) ?? null;
}

export function deleteWalk(id: string): void {
  const records = getWalks().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
