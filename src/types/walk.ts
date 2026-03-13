import type { Coordinate } from './route';

export interface WalkState {
  isWalking: boolean;
  startedAt: Date | null;
  coordinates: Coordinate[];
  distance: number;
  duration: number;
}

export interface WalkRecord {
  id: string;
  petName: string;
  date: string;
  distance: number;
  duration: number;
  routePath: Coordinate[];
}

export interface MonthlyWalkSummary {
  totalWalks: number;
  totalDistance: number;
  totalDuration: number;
}

export interface ShareCardData {
  petName: string;
  date: string;
  distance: number;
  duration: number;
  routePath: Coordinate[];
}
