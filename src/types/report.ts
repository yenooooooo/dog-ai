/** 월간 리포트 통계 */
export interface MonthlyReport {
  year: number;
  month: number;
  totalWalks: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  avgDistanceKm: number;
  avgDurationMin: number;
  /** 가장 많이 걸은 날 (ISO date string, e.g. '2026-03-15') */
  bestDay: string | null;
  /** 가장 많이 걸은 요일 (0=일, 1=월, ..., 6=토) */
  busiestDayOfWeek: number | null;
  /** 지난달 대비 변화율 (%) — null이면 지난달 데이터 없음 */
  changeVsLastMonth: number | null;
}
