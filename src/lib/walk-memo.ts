const STORAGE_KEY = 'mw_walk_memos';

interface MemoMap {
  [walkId: string]: string;
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

export function getWalkMemo(walkId: string): string {
  const memos = loadMemos();
  return memos[walkId] ?? '';
}

export function setWalkMemo(walkId: string, memo: string): void {
  const memos = loadMemos();
  if (memo.trim()) {
    memos[walkId] = memo.trim();
  } else {
    delete memos[walkId];
  }
  saveMemos(memos);
}
