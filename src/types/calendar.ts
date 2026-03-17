export interface DayActivity {
  date: string;
  walkCount: number;
  totalKm: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
}

export interface CalendarWeek {
  days: (DayActivity | null)[];
}
