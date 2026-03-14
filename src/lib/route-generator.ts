/**
 * 순환 산책 루트 생성 알고리즘
 *
 * 1) 목표 거리 = 시간(분) × 속도(크기별)
 * 2) 반경 = 거리 / (2π) × 1.3 (최소 300m)
 * 3) 4개 웨이포인트 (90° 간격, 부드러운 원형)
 * 4) 각 웨이포인트 반경 ±15% 랜덤 변화 → 자연스러운 경로
 */
import type { Coordinate } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

const SPEED_BY_SIZE: Record<string, number> = {
  small: 50, medium: 67, large: 83,
};
const DEFAULT_SPEED = 67;
const ROAD_DETOUR_FACTOR = 1.3;
// 4개 웨이포인트 → 삼각형보다 부드러운 원형 경로
const WP_COUNT = 4;
const ROUTE_SPREAD = 40;
// 최소 반경: 목표 거리에 따라 동적으로 결정 (아래 함수에서 계산)
const ABS_MIN_RADIUS = 100;
// 각 웨이포인트 반경 ±15% 변화 → 자연스러운 비대칭
const RADIUS_JITTER = 0.15;

function bearingToDirection(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  if (d < 22.5 || d >= 337.5) return '북쪽';
  if (d < 67.5) return '북동쪽';
  if (d < 112.5) return '동쪽';
  if (d < 157.5) return '남동쪽';
  if (d < 202.5) return '남쪽';
  if (d < 247.5) return '남서쪽';
  if (d < 292.5) return '서쪽';
  return '북서쪽';
}

export interface WaypointSet {
  name: string;
  tags: string[];
  waypoints: Coordinate[];
}

export function generateWaypoints(
  origin: Coordinate,
  durationMinutes: number,
  radiusOverride?: number,
  petSize?: string
): { routes: WaypointSet[]; radius: number; targetDistance: number } {
  const speed = SPEED_BY_SIZE[petSize ?? ''] ?? DEFAULT_SPEED;
  const targetDistance = durationMinutes * speed;
  const calculated = (targetDistance / (2 * Math.PI)) * ROAD_DETOUR_FACTOR;
  // 최소 반경: 목표 거리의 1/20 또는 100m 중 큰 값
  const minRadius = Math.max(targetDistance / 20, ABS_MIN_RADIUS);
  const radius = radiusOverride ?? Math.max(calculated, minRadius);

  const baseRotation = Math.random() * 360;
  const rotations = [0, ROUTE_SPREAD, ROUTE_SPREAD * 2];

  const routes = rotations.map((rotation) => {
    const mainBearing = baseRotation + rotation;
    const waypoints: Coordinate[] = [];
    for (let i = 0; i < WP_COUNT; i++) {
      const bearing = (360 / WP_COUNT) * i + mainBearing;
      // 각 웨이포인트마다 반경을 ±15% 랜덤 변화 → 자연스러운 경로
      const jitter = 1 + (Math.random() * 2 - 1) * RADIUS_JITTER;
      waypoints.push(getPointAtBearing(origin, bearing, radius * jitter));
    }
    const direction = bearingToDirection(mainBearing);
    return {
      name: `${direction} 코스`,
      tags: [`${direction} 방면`, `약 ${Math.round(targetDistance / 100) / 10}km`],
      waypoints,
    };
  });

  return { routes, radius, targetDistance };
}

export function adjustRadius(
  actualDistance: number,
  targetDistance: number,
  currentRadius: number
): number | null {
  const ratio = actualDistance / targetDistance;
  if (ratio >= 0.8 && ratio <= 1.2) return null;
  return Math.max(currentRadius / ratio, ABS_MIN_RADIUS);
}
