/**
 * 공원 모드 — 깨끗한 원형 산책 가이드 생성
 * 3개 코스: 외곽(큰 원) / 중간 / 짧은(작은 원)
 */
import type { Coordinate, GeneratedRoute, RouteSegment } from '@/types/route';
import { getPointAtBearing } from './geo-utils';

const SPEED_BY_SIZE: Record<string, number> = { small: 50, medium: 67, large: 83 };
const CIRCLE_POINTS = 24; // 부드러운 원 (15도 간격)

export function generateParkRoutes(
  origin: Coordinate,
  parkName: string,
  durationMinutes: number,
  petSize?: string
): GeneratedRoute[] {
  const speed = SPEED_BY_SIZE[petSize ?? ''] ?? 67;
  const targetDistance = durationMinutes * speed;
  const baseRadius = Math.max(targetDistance / (2 * Math.PI), 30);
  const baseRotation = Math.random() * 360;

  const sizes = [
    { scale: 1.0, label: '외곽' },
    { scale: 0.7, label: '중간' },
    { scale: 0.4, label: '짧은' },
  ];

  return sizes.map((s, idx) => {
    const radius = baseRadius * s.scale;
    const dist = Math.round(2 * Math.PI * radius);
    const mins = Math.round(dist / speed);
    const path: Coordinate[] = [];

    for (let i = 0; i <= CIRCLE_POINTS; i++) {
      const angle = (360 / CIRCLE_POINTS) * i + baseRotation;
      const jitter = 1 + (Math.random() * 2 - 1) * 0.05;
      path.push(getPointAtBearing(origin, angle, radius * jitter));
    }

    return {
      id: `park-${idx}-${Date.now()}`,
      name: `${parkName} ${s.label} 코스`,
      tags: ['🌳 공원 산책', `약 ${Math.round(dist / 100) / 10}km`, `${mins}분`],
      segments: [] as RouteSegment[],
      totalDistance: dist,
      estimatedDuration: mins,
      waypoints: [],
      path,
    };
  });
}
