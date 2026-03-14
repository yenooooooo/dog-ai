/**
 * 순환 산책 루트 생성 알고리즘
 *
 * 1) 목표 거리 = 시간(분) × 67m/분 (시속 4km)
 * 2) 반경 = 거리 / (2π) × 1.3 (최소 300m)
 * 3) 원점 중심 120° 간격 삼각형 웨이포인트
 * 4) 루트별 랜덤 방향 + 40° 간격
 */
import type { Coordinate } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

const WALKING_SPEED_M_PER_MIN = 67;
const ROAD_DETOUR_FACTOR = 1.3;
const WP_COUNT = 3;
const ROUTE_SPREAD = 40;
// 최소 반경 300m — 아파트 단지 밖으로 나가도록
const MIN_RADIUS = 300;

/** 방위각(도) → 방향 이름 */
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
  radiusOverride?: number
): { routes: WaypointSet[]; radius: number; targetDistance: number } {
  const targetDistance = durationMinutes * WALKING_SPEED_M_PER_MIN;

  // 반경: 최소 MIN_RADIUS 보장
  const calculated = (targetDistance / (2 * Math.PI)) * ROAD_DETOUR_FACTOR;
  const radius = radiusOverride ?? Math.max(calculated, MIN_RADIUS);

  // 랜덤 기준 방향
  const baseRotation = Math.random() * 360;
  const rotations = [0, ROUTE_SPREAD, ROUTE_SPREAD * 2];

  const routes = rotations.map((rotation) => {
    const mainBearing = baseRotation + rotation;
    const waypoints: Coordinate[] = [];
    for (let i = 0; i < WP_COUNT; i++) {
      const bearing = (360 / WP_COUNT) * i + mainBearing;
      waypoints.push(getPointAtBearing(origin, bearing, radius));
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
  return Math.max(currentRadius / ratio, MIN_RADIUS);
}
