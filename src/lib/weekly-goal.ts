const GOAL_KEY = 'mw_weekly_goal';
const DEFAULT_GOAL_KM = 10;

interface WalkRecord {
  startedAt: string;
  distanceMeters: number;
}

/** 주간 목표 거리(km)를 가져온다 */
export function getWeeklyGoal(): number {
  if (typeof window === 'undefined') return DEFAULT_GOAL_KM;
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (!raw) return DEFAULT_GOAL_KM;
    const val = Number(raw);
    return val > 0 ? val : DEFAULT_GOAL_KM;
  } catch {
    return DEFAULT_GOAL_KM;
  }
}

/** 주간 목표 거리(km)를 설정한다 */
export function setWeeklyGoal(km: number): void {
  if (km <= 0) return;
  localStorage.setItem(GOAL_KEY, String(km));
}

/** 이번 주 월요일 00:00:00 Date 객체를 반환한다 */
function getMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  // 일요일(0)이면 6일 전, 그 외는 day-1일 전
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** 이번 주 총 산책 거리(km)를 계산한다 */
export function getWeeklyProgress(walks: WalkRecord[]): number {
  const monday = getMonday();
  const thisWeek = walks.filter((w) => new Date(w.startedAt) >= monday);
  const totalMeters = thisWeek.reduce((sum, w) => sum + w.distanceMeters, 0);
  return totalMeters / 1000;
}
