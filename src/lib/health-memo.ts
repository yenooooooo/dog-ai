import type { HealthMemo } from '@/types/health-memo';

const STORAGE_KEY = 'mw_health_memos';

interface MemoMap {
  [walkId: string]: HealthMemo;
}

function loadMemos(): MemoMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MemoMap;
  } catch {
    return {};
  }
}

function saveMemos(memos: MemoMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  } catch {
    // 저장 실패 무시
  }
}

export function getHealthMemo(walkId: string): HealthMemo | null {
  const memos = loadMemos();
  return memos[walkId] ?? null;
}

export function setHealthMemo(walkId: string, memo: HealthMemo): void {
  const memos = loadMemos();
  memos[walkId] = memo;
  saveMemos(memos);
}
