import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateWaypoints, adjustRadius } from '@/lib/route-generator';
import { fetchWalkingRoute as fetchKakaoRoute } from '@/lib/kakao/route-api';
import { fetchGoogleWalkingRoute } from '@/lib/google/walking-route';
import { snapWaypointsToRoad } from '@/lib/kakao/snap-to-road';
import { detectNearbyPark } from '@/lib/kakao/park-detect';
import { generateParkRoutes } from '@/lib/park-route-generator';
import type { GeneratedRoute, RouteSegment } from '@/types/route';
import type { Coordinate } from '@/types/route';

// 한국에서는 구글 도보 API 미지원 → 카카오 사용
// 해외 서비스 확장 시 구글 전환 가능
const useGoogle = false;

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

  const fulfilled = results
    .filter((r): r is PromiseFulfilledResult<GeneratedRoute> => r.status === 'fulfilled')
    .map((r) => r.value);

  // 전부 실패 시 첫 번째 에러를 lastError에 저장
  if (fulfilled.length === 0) {
    const firstErr = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (firstErr) lastError = String(firstErr.reason);
  }

  return fulfilled;
}

let lastError = '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, durationMinutes, petSize } = requestSchema.parse(body);
    const walkSpeed = petSize === 'small' ? 50 : petSize === 'large' ? 83 : 67;
    const kakaoKey = process.env.KAKAO_REST_API_KEY ?? '';

    // 공원 모드: 출발 위치 근처 200m 안에 공원이면 원형 가이드 생성
    if (kakaoKey) {
      const park = await detectNearbyPark(origin, kakaoKey);
      if (park) {
        const parkRoutes = generateParkRoutes(origin, park.name, durationMinutes, petSize);
        return NextResponse.json({ routes: parkRoutes });
      }
    }

    let currentRadius: number | undefined;
    let finalRoutes: GeneratedRoute[] = [];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { routes, radius, targetDistance } = generateWaypoints(
        origin, durationMinutes, currentRadius, petSize
      );

      // 1차: 스냅 적용 (공공장소로 웨이포인트 보정)
      finalRoutes = await tryBuildRoutes(origin, routes, walkSpeed, kakaoKey, true);

      // 2차: 스냅 실패 시 원래 좌표로 폴백
      if (finalRoutes.length === 0) {
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
      const detail = lastError ? ` (${lastError})` : '';
      return NextResponse.json(
        { error: `도보 경로를 찾을 수 없어요.${detail}`, code: 'NO_ROUTE' },
        { status: 422 }
      );
    }

    return NextResponse.json({ routes: finalRoutes });
  } catch (err) {
    console.error('루트 생성 실패:', err);
    const errMsg = err instanceof Error ? err.message : '';
    const status = err instanceof z.ZodError ? 400 : 500;
    return NextResponse.json(
      { error: `루트 생성에 실패했어요. ${errMsg}`, code: err instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR' },
      { status }
    );
  }
}
