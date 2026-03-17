export type BadgeId =
  | 'first_walk'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'distance_5km'
  | 'night_walker'
  | 'early_bird'
  | 'walks_10'
  | 'walks_50'
  | 'walks_100';

export interface Badge {
  id: BadgeId;
  name: string;
  icon: string;
  description: string;
  condition: string;
}

export interface LevelInfo {
  level: number;
  name: string;
  minKm: number;
  maxKm: number;
}

export interface LevelProgress {
  current: LevelInfo;
  next: LevelInfo | null;
  totalKm: number;
  progressPercent: number;
}
