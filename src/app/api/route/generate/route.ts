import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateWaypoints, adjustRadius } from '@/lib/route-generator';
import { fetchWalkingRoute as fetchKakaoRoute } from '@/lib/kakao/route-api';
import { fetchGoogleWalkingRoute } from '@/lib/google/walking-route';
import { snapWaypointsToRoad } from '@/lib/kakao/snap-to-road';
import type { GeneratedRoute, RouteSegment } from '@/types/route';
import type { Coordinate } from '@/types/route';

// 구글 API 키 있으면 구글 도보, 없으면 카카오 차량
const useGoogle = !!process.env.GOOGLE_MAPS_API_KEY;

async function fetchRoute(origin: Coordinate, waypoints: Coordinate[]) {
  if (useGoogle) return fetchGoogleWalkingRoute(origin, waypoints);
  return fetchKakaoRoute(origin, waypoints);
}

const requestSchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  durationMinutes: z.number().min(5).max(120),
  petSize: z.enum(['small', 'medium', 'large']).optional(),
});

const MAX_RETRIES = 5;
const MAX_DIST_RATIO = 1.5;

async function tryBuildRoutes(
  origin: { lat: number; lng: number },
  waypoints: { name: string; tags: string[]; waypoints: { lat: number; lng: number }[] }[],
  walkSpeed: number,
  kakaoKey: string,
  useSnap: boolean
) {
  const snapped = useSnap
    ? await Promise.all(waypoints.map(async (r) => ({
        ...r,
        waypoints: kakaoKey ? await snapWaypointsToRoad(r.waypoints, kakaoKey) : r.waypoints,
      })))
    : waypoints;

  const results = await Promise.allSettled(
    snapped.map(async (r, idx) => {
      const { path, distance, duration } = await fetchRoute(origin, r.waypoints);
      return {
        id: `route-${idx}-${Date.now()}`,
        name: r.name, tags: r.tags,
        segments: [] as RouteSegment[],
        totalDistance: distance,
        estimatedDuration: useGoogle ? Math.round(duration / 60) : Math.round(distance / walkSpeed),
        waypoints: r.waypoints.map((wp, i) => ({ ...wp, order: i })),
        path,
      } satisfies GeneratedRoute;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<GeneratedRoute> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, durationMinutes, petSize } = requestSchema.parse(body);
    const walkSpeed = petSize === 'small' ? 50 : petSize === 'large' ? 83 : 67;
    const kakaoKey = process.env.KAKAO_REST_API_KEY ?? '';

    let currentRadius: number | undefined;
    let finalRoutes: GeneratedRoute[] = [];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { routes, radius, targetDistance } = generateWaypoints(
        origin, durationMinutes, currentRadius, petSize
      );

      // 구글: 스냅 불필요 (이미 도보 경로), 카카오: 스냅 적용
      finalRoutes = await tryBuildRoutes(origin, routes, walkSpeed, kakaoKey, !useGoogle);

      // 카카오 스냅 실패 시 원래 좌표로 폴백
      if (finalRoutes.length === 0 && !useGoogle) {
        finalRoutes = await tryBuildRoutes(origin, routes, walkSpeed, kakaoKey, false);
      }

      if (finalRoutes.length === 0) {
        currentRadius = (currentRadius ?? radius) * 0.5;
        continue;
      }

      // 거리 초과 필터
      finalRoutes = finalRoutes.filter((r) => r.totalDistance <= targetDistance * MAX_DIST_RATIO);
      if (finalRoutes.length === 0) {
        currentRadius = (currentRadius ?? radius) * 0.5;
        continue;
      }

      const adjusted = adjustRadius(finalRoutes[0].totalDistance, targetDistance, currentRadius ?? radius);
      if (!adjusted) break;
      currentRadius = adjusted;
    }

    if (finalRoutes.length === 0) {
      return NextResponse.json(
        { error: '이 위치에서 도보 경로를 찾을 수 없어요. 도로 근처로 위치를 옮겨보세요.', code: 'NO_ROUTE' },
        { status: 422 }
      );
    }

    return NextResponse.json({ routes: finalRoutes });
  } catch (err) {
    console.error('루트 생성 실패:', err);
    const status = err instanceof z.ZodError ? 400 : 500;
    return NextResponse.json(
      { error: '루트 생성에 실패했어요.', code: err instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR' },
      { status }
    );
  }
}
