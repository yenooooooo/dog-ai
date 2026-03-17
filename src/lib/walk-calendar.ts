import type { DayActivity, StreakInfo, CalendarWeek } from '@/types/calendar';

interface WalkInput {
  startedAt: string;
  distanceMeters: number;
}

/** 날짜 문자열을 YYYY-MM-DD 형식으로 반환 */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 최근 12주(84일) 날짜별 산책 활동 맵을 생성 */
function buildActivityMap(walks: WalkInput[]): Map<string, DayActivity> {
  const map = new Map<string, DayActivity>();
  walks.forEach((w) => {
    const key = w.startedAt.slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.walkCount += 1;
      existing.totalKm += w.distanceMeters / 1000;
    } else {
      map.set(key, { date: key, walkCount: 1, totalKm: w.distanceMeters / 1000 });
    }
  });
  return map;
}

/** 최근 12주를 week 단위로 나눈 캘린더 그리드 생성 */
export function buildCalendarGrid(walks: WalkInput[]): CalendarWeek[] {
  const activityMap = buildActivityMap(walks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘이 속한 주의 일요일까지 포함하여 12주 계산
  const todayDay = today.getDay(); // 0=일 ~ 6=토
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - todayDay)); // 이번 주 토요일

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 83); // 12주 = 84일

  const weeks: CalendarWeek[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const days: (DayActivity | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (cursor > today) {
        days.push(null);
      } else {
        const key = toDateKey(cursor);
        days.push(activityMap.get(key) ?? { date: key, walkCount: 0, totalKm: 0 });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ days });
  }
  return weeks;
}

/** 연속 산책 일수 (current + longest) 계산 */
export function calculateStreak(walks: WalkInput[]): StreakInfo {
  if (walks.length === 0) return { current: 0, longest: 0 };

  const walkDates = new Set(walks.map((w) => w.startedAt.slice(0, 10)));
  const sortedDates = Array.from(walkDates).sort();

  let longest = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longest = Math.max(longest, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // current streak: 오늘 또는 어제부터 역방향 연속
  const today = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (!walkDates.has(today) && !walkDates.has(yesterdayKey)) {
    return { current: 0, longest };
  }

  let current = 0;
  const checkDate = new Date();
  if (!walkDates.has(today)) checkDate.setDate(checkDate.getDate() - 1);

  while (walkDates.has(toDateKey(checkDate))) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { current, longest: Math.max(longest, current) };
}

/** 산책 횟수에 따른 색상 레벨 (0~3) */
export function getColorLevel(walkCount: number): number {
  if (walkCount === 0) return 0;
  if (walkCount === 1) return 1;
  if (walkCount === 2) return 2;
  return 3;
}
