import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateWaypoints, adjustRadius } from '@/lib/route-generator';
import { fetchWalkingRoute } from '@/lib/kakao/route-api';
import { snapWaypointsToRoad } from '@/lib/kakao/snap-to-road';
import type { GeneratedRoute, RouteSegment } from '@/types/route';

const requestSchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  durationMinutes: z.number().min(5).max(120),
  petSize: z.enum(['small', 'medium', 'large']).optional(),
});

const MAX_RETRIES = 5;
const MAX_DISTANCE_RATIO = 1.5; // 목표 대비 1.5배 초과 루트 제외

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, durationMinutes, petSize } = requestSchema.parse(body);
    const walkSpeed = petSize === 'small' ? 50 : petSize === 'large' ? 83 : 67;
    const kakaoKey = process.env.KAKAO_REST_API_KEY ?? '';

    let currentRadius: number | undefined;
    let finalRoutes: GeneratedRoute[] = [];

    // 최대 3회 반경 보정 시도 (PLAN.md 스텝 4)
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { routes, radius, targetDistance } = generateWaypoints(
        origin,
        durationMinutes,
        currentRadius,
        petSize
      );

      // 웨이포인트를 공공 도로 위 장소로 보정 → 아파트 내부 경로 방지
      const snappedRoutes = await Promise.all(
        routes.map(async (r) => ({
          ...r,
          waypoints: kakaoKey ? await snapWaypointsToRoad(r.waypoints, kakaoKey) : r.waypoints,
        }))
      );

      const results = await Promise.allSettled(
        snappedRoutes.map(async (r, idx) => {
          const { path, distance } = await fetchWalkingRoute(
            origin,
            r.waypoints
          );
          return {
            id: `route-${idx}-${Date.now()}`,
            name: r.name,
            tags: r.tags,
            segments: [] as RouteSegment[],
            totalDistance: distance,
            estimatedDuration: Math.round(distance / walkSpeed),
            waypoints: r.waypoints.map((wp, i) => ({ ...wp, order: i })),
            path,
          } satisfies GeneratedRoute;
        })
      );

      finalRoutes = results
        .filter(
          (r): r is PromiseFulfilledResult<GeneratedRoute> =>
            r.status === 'fulfilled'
        )
        .map((r) => r.value);

      if (finalRoutes.length === 0) break;

      // 목표 대비 1.5배 초과 루트 제외
      finalRoutes = finalRoutes.filter(
        (r) => r.totalDistance <= targetDistance * MAX_DISTANCE_RATIO
      );

      if (finalRoutes.length === 0) {
        // 전부 초과 → 반경 절반으로 줄여서 재시도
        currentRadius = (currentRadius ?? radius) * 0.5;
        continue;
      }

      // 첫 번째 루트 거리로 보정 판단
      const adjusted = adjustRadius(
        finalRoutes[0].totalDistance,
        targetDistance,
        currentRadius ?? radius
      );
      if (!adjusted) break; // ±20% 이내 → 보정 불필요
      currentRadius = adjusted;
    }

    // Kakao API 전부 실패 시 에러 반환 (비안전 직선 루트 방지)
    if (finalRoutes.length === 0) {
      return NextResponse.json(
        { error: '이 위치에서 도보 경로를 찾을 수 없어요. 위치를 옮겨서 다시 시도해주세요.', code: 'NO_ROUTE' },
        { status: 422 }
      );
    }

    return NextResponse.json({ routes: finalRoutes });
  } catch (err) {
    console.error('루트 생성 실패:', err);
    const status = err instanceof z.ZodError ? 400 : 500;
    const code = err instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    return NextResponse.json(
      { error: '루트 생성에 실패했어요.', code },
      { status }
    );
  }
}
