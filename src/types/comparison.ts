export interface DayComparison {
  dayLabel: string;
  thisWeekKm: number;
  lastWeekKm: number;
}

export interface WeekComparison {
  days: DayComparison[];
  thisWeekTotalKm: number;
  lastWeekTotalKm: number;
  changePercent: number;
}
