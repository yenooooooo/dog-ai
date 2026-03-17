import type { BadgeId, LevelProgress } from '@/types/badge';
import { LEVELS } from '@/lib/badge-constants';

interface WalkInput {
  startedAt: string;
  distanceMeters: number;
}

/** 연속 산책 최대 일수를 계산한다 */
function maxStreak(walks: WalkInput[]): number {
  if (walks.length === 0) return 0;
  const dates = [...new Set(walks.map((w) => w.startedAt.slice(0, 10)))].sort();
  let max = 1;
  let cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 1;
    }
  }
  return max;
}

/** 산책 기록으로부터 획득한 뱃지 목록을 반환한다 */
export function evaluateBadges(walks: WalkInput[]): BadgeId[] {
  const earned: BadgeId[] = [];
  const count = walks.length;

  if (count >= 1) earned.push('first_walk');
  if (count >= 10) earned.push('walks_10');
  if (count >= 50) earned.push('walks_50');
  if (count >= 100) earned.push('walks_100');

  const streak = maxStreak(walks);
  if (streak >= 3) earned.push('streak_3');
  if (streak >= 7) earned.push('streak_7');
  if (streak >= 30) earned.push('streak_30');

  const has5km = walks.some((w) => w.distanceMeters >= 5000);
  if (has5km) earned.push('distance_5km');

  const hasNight = walks.some((w) => {
    const hour = new Date(w.startedAt).getHours();
    return hour >= 21;
  });
  if (hasNight) earned.push('night_walker');

  const hasEarly = walks.some((w) => {
    const hour = new Date(w.startedAt).getHours();
    return hour < 7;
  });
  if (hasEarly) earned.push('early_bird');

  return earned;
}

/** 총 거리(km)로 현재 레벨과 진행률을 계산한다 */
export function calculateLevel(totalKm: number): LevelProgress {
  let currentIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalKm >= LEVELS[i].minKm) {
      currentIdx = i;
      break;
    }
  }

  const current = LEVELS[currentIdx];
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

  const progressPercent = next
    ? Math.min(
        100,
        Math.round(
          ((totalKm - current.minKm) / (next.minKm - current.minKm)) * 100
        )
      )
    : 100;

  return { current, next, totalKm, progressPercent };
}
