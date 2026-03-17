import type { DayComparison, WeekComparison } from '@/types/comparison';

interface WalkInput {
  startedAt: string;
  distanceMeters: number;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

/** 특정 날짜가 속한 주의 월요일 00:00:00을 반환한다 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** YYYY-MM-DD 키를 반환한다 */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 주의 월~일 각 날짜별 거리(km) 배열을 반환한다 */
function weekDayDistances(
  walks: WalkInput[],
  monday: Date
): number[] {
  const distances = Array(7).fill(0) as number[];
  const mondayTime = monday.getTime();
  const sundayEnd = mondayTime + 7 * 24 * 60 * 60 * 1000;

  walks.forEach((w) => {
    const t = new Date(w.startedAt).getTime();
    if (t >= mondayTime && t < sundayEnd) {
      const key = w.startedAt.slice(0, 10);
      const walkDate = new Date(key + 'T00:00:00');
      const dayIndex = Math.floor(
        (walkDate.getTime() - mondayTime) / (24 * 60 * 60 * 1000)
      );
      if (dayIndex >= 0 && dayIndex < 7) {
        distances[dayIndex] += w.distanceMeters / 1000;
      }
    }
  });

  return distances;
}

/** 이번주/지난주 요일별 비교 데이터를 생성한다 */
export function buildWeekComparison(walks: WalkInput[]): WeekComparison {
  const thisMonday = getMonday(new Date());
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const thisWeekDist = weekDayDistances(walks, thisMonday);
  const lastWeekDist = weekDayDistances(walks, lastMonday);

  const days: DayComparison[] = DAY_LABELS.map((label, i) => ({
    dayLabel: label,
    thisWeekKm: Math.round(thisWeekDist[i] * 100) / 100,
    lastWeekKm: Math.round(lastWeekDist[i] * 100) / 100,
  }));

  const thisWeekTotalKm = thisWeekDist.reduce((s, v) => s + v, 0);
  const lastWeekTotalKm = lastWeekDist.reduce((s, v) => s + v, 0);

  const changePercent =
    lastWeekTotalKm === 0
      ? thisWeekTotalKm > 0
        ? 100
        : 0
      : Math.round(
          ((thisWeekTotalKm - lastWeekTotalKm) / lastWeekTotalKm) * 100
        );

  return {
    days,
    thisWeekTotalKm: Math.round(thisWeekTotalKm * 100) / 100,
    lastWeekTotalKm: Math.round(lastWeekTotalKm * 100) / 100,
    changePercent,
  };
}
