/**
 * 순환 산책 루트 생성 알고리즘 (PLAN.md 섹션 8)
 *
 * 입력: 현위치(lat, lng), 목표시간(분)
 * 출력: 순환 루트 3개 (각각 다른 방향)
 *
 * 1) 목표 거리 = 시간(분) × 67m/분 (시속 4km 기준)
 * 2) 반경 = 거리 / (2π) × 1.3 (도로 우회 보정계수)
 * 3) 원점 중심 120° 간격 삼각형 웨이포인트 3개
 * 4) 루트별 삼각형 회전: 0°, 40°, 80° → 3개 다른 방향
 */
import type { Coordinate } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

// 시속 4km = 67m/분
const WALKING_SPEED_M_PER_MIN = 67;
// 도로가 직선이 아니므로 반경을 1.3배 보정
const ROAD_DETOUR_FACTOR = 1.3;
// 삼각형 꼭짓점 = 웨이포인트 3개
const WP_COUNT = 3;
// 3개 루트 간 간격(도) — 서로 충분히 다른 방향
const ROUTE_SPREAD = 40;

const ROUTE_NAMES = ['공원 경유 코스', '한적한 길 코스', '카페 근처 코스'];
const ROUTE_TAGS: string[][] = [
  ['공원 경유', '자연'],
  ['한적한 길', '조용함'],
  ['카페 근처', '도심'],
];

export interface WaypointSet {
  name: string;
  tags: string[];
  waypoints: Coordinate[];
}

/**
 * 3세트의 순환 웨이포인트를 생성한다.
 * @param origin 현위치
 * @param durationMinutes 목표 산책 시간(분)
 * @param radiusOverride 반경 보정 시 직접 지정(미터)
 */
export function generateWaypoints(
  origin: Coordinate,
  durationMinutes: number,
  radiusOverride?: number
): { routes: WaypointSet[]; radius: number; targetDistance: number } {
  // 스텝 1: 목표 거리 계산
  const targetDistance = durationMinutes * WALKING_SPEED_M_PER_MIN;

  // 스텝 2: 반경 계산 — 원 둘레(2πr)에서 역산 후 도로 우회 보정
  const radius =
    radiusOverride ?? (targetDistance / (2 * Math.PI)) * ROAD_DETOUR_FACTOR;

  // 스텝 3: 루트 3개 생성 (랜덤 기준 방향 + 간격)
  const baseRotation = Math.random() * 360;
  const rotations = [0, ROUTE_SPREAD, ROUTE_SPREAD * 2];

  const routes = rotations.map((rotation, idx) => {
    const waypoints: Coordinate[] = [];
    for (let i = 0; i < WP_COUNT; i++) {
      // 120° 간격 + 루트별 회전 오프셋
      const bearing = (360 / WP_COUNT) * i + baseRotation + rotation;
      waypoints.push(getPointAtBearing(origin, bearing, radius));
    }
    return {
      name: ROUTE_NAMES[idx],
      tags: ROUTE_TAGS[idx],
      waypoints,
    };
  });

  return { routes, radius, targetDistance };
}

/**
 * 실제 도보 거리와 목표 거리를 비교하여 보정된 반경을 반환한다.
 * 목표 대비 ±20% 이내면 null(보정 불필요). (PLAN.md 스텝 4)
 */
export function adjustRadius(
  actualDistance: number,
  targetDistance: number,
  currentRadius: number
): number | null {
  const ratio = actualDistance / targetDistance;
  if (ratio >= 0.8 && ratio <= 1.2) return null;
  // 비례 보정: 실제가 멀면 줄이고, 가까우면 늘린다
  return currentRadius / ratio;
}
