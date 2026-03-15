/**
 * 순환 산책 루트 생성 알고리즘
 *
 * 1) 목표 거리 = 시간(분) × 속도(크기별)
 * 2) 반경 = 거리 / (2π) × 도로보정
 * 3) 3개 웨이포인트 (120° 간격, 깨끗한 삼각 순환)
 *    → 4개는 출발지 근처를 왔다갔다하는 문제 발생
 * 4) 각 웨이포인트 반경을 출발지 반대편에 배치 → 중복 경로 방지
 */
import type { Coordinate } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

const SPEED_BY_SIZE: Record<string, number> = {
  small: 50, medium: 67, large: 83,
};
const DEFAULT_SPEED = 67;
// 도로 우회 보정: 직선 거리 대비 도보는 약 1.4배
const ROAD_DETOUR_FACTOR = 1.4;
// 3개 웨이포인트 → 깨끗한 삼각 순환 (중복 없음)
const WP_COUNT = 3;
// 3개 루트 간 방향 간격
const ROUTE_SPREAD = 120;
const ABS_MIN_RADIUS = 80;
// 웨이포인트 반경 ±10% 변화
const RADIUS_JITTER = 0.10;

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
  // 삼각형 순환: 둘레 ≈ 3 × √3 × r ≈ 5.2r, 보정 포함
  const calculated = (targetDistance / 5.2) * ROAD_DETOUR_FACTOR;
  const minRadius = Math.max(targetDistance / 25, ABS_MIN_RADIUS);
  const radius = radiusOverride ?? Math.max(calculated, minRadius);

  const baseRotation = Math.random() * 360;
  // 3개 루트: 각각 120° 회전 → 완전히 다른 방향
  const rotations = [0, ROUTE_SPREAD, ROUTE_SPREAD * 2];

  const routes = rotations.map((rotation) => {
    const mainBearing = baseRotation + rotation;
    const waypoints: Coordinate[] = [];
    for (let i = 0; i < WP_COUNT; i++) {
      // 120° 간격으로 배치 → 출발지에서 한 방향으로 순환
      const bearing = (360 / WP_COUNT) * i + mainBearing;
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
