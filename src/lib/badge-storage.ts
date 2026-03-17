import type { BadgeId } from '@/types/badge';

const SEEN_KEY = 'mw_seen_badges';

/** localStorage에서 이미 확인한 뱃지 ID 목록을 가져온다 */
export function getSeenBadges(): BadgeId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BadgeId[];
  } catch {
    return [];
  }
}

/** 뱃지를 확인 처리한다 */
export function markBadgeSeen(id: BadgeId): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenBadges();
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

/** 여러 뱃지를 한번에 확인 처리한다 */
export function markAllBadgesSeen(ids: BadgeId[]): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenBadges();
    const updated = [...new Set([...seen, ...ids])];
    localStorage.setItem(SEEN_KEY, JSON.stringify(updated));
  } catch {
    // localStorage 접근 실패 시 무시
  }
}
