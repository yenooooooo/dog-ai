/**
 * 공원 모드 — 차량 API 없이 원형 산책 가이드 생성
 * 공원 안은 어디든 안전하므로 방향 가이드만 제공
 */
import type { Coordinate, GeneratedRoute, RouteSegment } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

const SPEED_BY_SIZE: Record<string, number> = { small: 50, medium: 67, large: 83 };
const PARK_POINTS = 12; // 원형 가이드 포인트 수 (부드러운 원)

/**
 * 공원 내부 원형 산책 루트 생성
 * 카카오 API 호출 없이 기하학적 원형 경로 반환
 */
export function generateParkRoutes(
  origin: Coordinate,
  parkName: string,
  durationMinutes: number,
  petSize?: string
): GeneratedRoute[] {
  const speed = SPEED_BY_SIZE[petSize ?? ''] ?? 67;
  const targetDistance = durationMinutes * speed;
  const radius = Math.max(targetDistance / (2 * Math.PI), 50);

  const baseRotation = Math.random() * 360;
  const offsets = [0, 30, 60];

  return offsets.map((offset, idx) => {
    const path: Coordinate[] = [];
    for (let i = 0; i <= PARK_POINTS; i++) {
      const angle = (360 / PARK_POINTS) * i + baseRotation + offset;
      // 약간의 변화로 자연스러운 형태
      const jitter = 1 + (Math.sin(angle * 3) * 0.1);
      path.push(getPointAtBearing(origin, angle, radius * jitter));
    }
    // 시작점으로 닫기
    path.push(path[0]);

    const direction = offset === 0 ? '외곽' : offset === 30 ? '중앙' : '내부';

    return {
      id: `park-${idx}-${Date.now()}`,
      name: `${parkName} ${direction} 코스`,
      tags: ['🌳 공원 산책', `약 ${Math.round(targetDistance / 100) / 10}km`],
      segments: [] as RouteSegment[],
      totalDistance: targetDistance,
      estimatedDuration: durationMinutes,
      waypoints: [],
      path,
    };
  });
}
