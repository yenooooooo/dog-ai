/**
 * Google Directions API — 도보 경로 (WALKING)
 * 보행자 전용 도로 + 인도 + 공원 산책로 포함
 * GOOGLE_MAPS_API_KEY 환경변수 필요
 */
import type { Coordinate } from '@/types/route';

interface GoogleStep {
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  polyline: { points: string };
}

interface GoogleRoute {
  legs: Array<{
    distance: { value: number };
    duration: { value: number };
    steps: GoogleStep[];
  }>;
}

interface GoogleResponse {
  status: string;
  routes: GoogleRoute[];
}

/** Google 인코딩된 폴리라인 디코딩 */
function decodePolyline(encoded: string): Coordinate[] {
  const coords: Coordinate[] = [];
  let idx = 0, lat = 0, lng = 0;

  while (idx < encoded.length) {
    let shift = 0, result = 0, b: number;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0; result = 0;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    coords.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coords;
}

/**
 * Google Directions API로 도보 순환 경로 조회
 * origin → waypoints → origin
 */
export async function fetchGoogleWalkingRoute(
  origin: Coordinate,
  waypoints: Coordinate[]
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY 환경변수가 없습니다');

  const waypointsParam = waypoints
    .map((wp) => `${wp.lat},${wp.lng}`)
    .join('|');

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${origin.lat},${origin.lng}&waypoints=${encodeURIComponent(waypointsParam)}&mode=walking&language=ko&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API ${res.status}`);

  const data: GoogleResponse = await res.json();
  if (data.status !== 'OK' || data.routes.length === 0) {
    const errMsg = (data as Record<string, unknown>).error_message ?? data.status;
    throw new Error(`Google: ${errMsg}`);
  }

  const route = data.routes[0];
  let totalDistance = 0;
  let totalDuration = 0;
  const path: Coordinate[] = [];

  for (const leg of route.legs) {
    totalDistance += leg.distance.value;
    totalDuration += leg.duration.value;
    for (const step of leg.steps) {
      const decoded = decodePolyline(step.polyline.points);
      // 중복 좌표 제거
      for (const coord of decoded) {
        const prev = path[path.length - 1];
        if (!prev || prev.lat !== coord.lat || prev.lng !== coord.lng) {
          path.push(coord);
        }
      }
    }
  }

  return { path, distance: totalDistance, duration: totalDuration };
}
