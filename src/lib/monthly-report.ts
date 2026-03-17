import type { MonthlyReport } from '@/types/report';

interface WalkInput {
  startedAt: string;
  distanceMeters: number;
  durationSeconds: number;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/** 요일 인덱스를 한글 이름으로 변환 */
export function dayOfWeekLabel(dow: number | null): string {
  if (dow === null || dow < 0 || dow > 6) return '-';
  return `${DAY_NAMES[dow]}요일`;
}

/** 특정 월의 산책 데이터를 필터링 */
function filterByMonth(walks: WalkInput[], year: number, month: number): WalkInput[] {
  return walks.filter((w) => {
    const d = new Date(w.startedAt);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

/** 날짜별 총 거리(m) 집계 */
function aggregateByDate(walks: WalkInput[]): Record<string, number> {
  const map: Record<string, number> = {};
  walks.forEach((w) => {
    const key = w.startedAt.slice(0, 10);
    map[key] = (map[key] ?? 0) + w.distanceMeters;
  });
  return map;
}

/** 요일별 산책 횟수 집계 → 최다 요일 반환 */
function busiestDow(walks: WalkInput[]): number | null {
  if (walks.length === 0) return null;
  const counts = [0, 0, 0, 0, 0, 0, 0];
  walks.forEach((w) => {
    counts[new Date(w.startedAt).getDay()] += 1;
  });
  let maxIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (counts[i] > counts[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}

/** 월간 리포트 생성 */
export function generateMonthlyReport(
  walks: WalkInput[],
  year: number,
  month: number,
): MonthlyReport {
  const current = filterByMonth(walks, year, month);
  const totalWalks = current.length;
  const totalDistKm = current.reduce((s, w) => s + w.distanceMeters, 0) / 1000;
  const totalDurMin = current.reduce((s, w) => s + w.durationSeconds, 0) / 60;

  // 가장 많이 걸은 날
  const byDate = aggregateByDate(current);
  const entries = Object.entries(byDate);
  const bestDay = entries.length > 0
    ? entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : null;

  // 지난달 대비 변화율
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prev = filterByMonth(walks, prevYear, prevMonth);
  const prevDistKm = prev.reduce((s, w) => s + w.distanceMeters, 0) / 1000;
  const changeVsLastMonth = prevDistKm > 0
    ? Math.round(((totalDistKm - prevDistKm) / prevDistKm) * 100)
    : null;

  return {
    year,
    month,
    totalWalks,
    totalDistanceKm: Math.round(totalDistKm * 100) / 100,
    totalDurationMin: Math.round(totalDurMin),
    avgDistanceKm: totalWalks > 0 ? Math.round((totalDistKm / totalWalks) * 100) / 100 : 0,
    avgDurationMin: totalWalks > 0 ? Math.round(totalDurMin / totalWalks) : 0,
    bestDay,
    busiestDayOfWeek: busiestDow(current),
    changeVsLastMonth,
  };
}
