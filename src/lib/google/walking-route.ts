/**
 * Google Directions API — 도보 경로 (WALKING)
 * 순환 경로를 구간별로 나눠서 호출 (origin→wp1, wp1→wp2, ..., wpN→origin)
 */
import type { Coordinate } from '@/types/route';

interface GoogleLeg {
  distance: { value: number };
  duration: { value: number };
  steps: Array<{ polyline: { points: string } }>;
}

interface GoogleResponse {
  status: string;
  routes: Array<{ legs: GoogleLeg[] }>;
}

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

async function fetchSegment(
  from: Coordinate,
  to: Coordinate,
  apiKey: string
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=walking&language=ko&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API ${res.status}`);

  const data: GoogleResponse = await res.json();
  if (data.status !== 'OK' || data.routes.length === 0) {
    const errMsg = (data as unknown as Record<string, unknown>).error_message ?? data.status;
    throw new Error(`Google: ${errMsg}`);
  }

  const leg = data.routes[0].legs[0];
  const path: Coordinate[] = [];
  for (const step of leg.steps) {
    for (const coord of decodePolyline(step.polyline.points)) {
      const prev = path[path.length - 1];
      if (!prev || prev.lat !== coord.lat || prev.lng !== coord.lng) {
        path.push(coord);
      }
    }
  }

  return { path, distance: leg.distance.value, duration: leg.duration.value };
}

/**
 * 순환 도보 경로: origin → wp1 → wp2 → ... → origin
 * 각 구간을 개별 호출하여 연결
 */
export async function fetchGoogleWalkingRoute(
  origin: Coordinate,
  waypoints: Coordinate[]
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY 환경변수가 없습니다');

  // 순환 경로: origin → wp1 → wp2 → wp3 → wp4 → origin
  const points = [origin, ...waypoints, origin];
  let totalPath: Coordinate[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const seg = await fetchSegment(points[i], points[i + 1], apiKey);
    totalDistance += seg.distance;
    totalDuration += seg.duration;
    // 중복 시작점 제거
    if (totalPath.length > 0 && seg.path.length > 0) {
      seg.path.shift();
    }
    totalPath = totalPath.concat(seg.path);
  }

  return { path: totalPath, distance: totalDistance, duration: totalDuration };
}
