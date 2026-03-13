/**
 * Kakao Mobility 도보 경로 REST API 호출 (서버사이드 전용)
 * KAKAO_REST_API_KEY 는 절대 클라이언트에 노출하지 않는다.
 */
import type { Coordinate } from '@/types/route';

interface KakaoRoute {
  result_code: number;
  summary: { distance: number; duration: number };
  sections: Array<{
    roads: Array<{ vertexes: number[] }>;
  }>;
}

interface KakaoResponse {
  routes: KakaoRoute[];
}

/**
 * origin → waypoints → origin 순환 경로를 Kakao API로 조회한다.
 * @returns path(좌표 배열), distance(미터), duration(초)
 */
export async function fetchWalkingRoute(
  origin: Coordinate,
  waypoints: Coordinate[]
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) throw new Error('KAKAO_REST_API_KEY 환경변수가 없습니다');

  const body = {
    origin: { x: String(origin.lng), y: String(origin.lat) },
    destination: { x: String(origin.lng), y: String(origin.lat) },
    waypoints: waypoints.map((wp, i) => ({
      name: `WP${i + 1}`,
      x: String(wp.lng),
      y: String(wp.lat),
    })),
    priority: 'RECOMMEND',
  };

  const res = await fetch(
    'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
    {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Kakao API ${res.status}: ${text}`);
  }

  const data: KakaoResponse = await res.json();
  const route = data.routes[0];

  if (!route || route.result_code !== 0) {
    throw new Error('경로를 찾을 수 없습니다');
  }

  // vertexes: [lng, lat, lng, lat, …] 쌍을 Coordinate 배열로 변환
  const path: Coordinate[] = [];
  for (const section of route.sections) {
    for (const road of section.roads) {
      for (let i = 0; i < road.vertexes.length; i += 2) {
        path.push({ lng: road.vertexes[i], lat: road.vertexes[i + 1] });
      }
    }
  }

  return { path, distance: route.summary.distance, duration: route.summary.duration };
}
