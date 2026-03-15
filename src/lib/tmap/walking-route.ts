/**
 * Tmap 보행자 경로 API — 인도 + 횡단보도 + 보행자도로 포함
 * 한국 유일의 보행자 전용 REST API
 */
import type { Coordinate } from '@/types/route';

interface TmapFeature {
  geometry: {
    type: string;
    coordinates: number[] | number[][];
  };
  properties: {
    totalDistance?: number;
    totalTime?: number;
  };
}

interface TmapResponse {
  features: TmapFeature[];
}

/**
 * Tmap 보행자 경로: A → B 구간
 */
async function fetchSegment(
  from: Coordinate,
  to: Coordinate,
  apiKey: string
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const res = await fetch(
    'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        appKey: apiKey,
      },
      body: JSON.stringify({
        startX: String(from.lng),
        startY: String(from.lat),
        endX: String(to.lng),
        endY: String(to.lat),
        startName: encodeURIComponent('출발'),
        endName: encodeURIComponent('도착'),
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        searchOption: '0',
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Tmap ${res.status}: ${text}`);
  }

  const data: TmapResponse = await res.json();
  const path: Coordinate[] = [];
  let distance = 0;
  let duration = 0;

  for (const feature of data.features) {
    const props = feature.properties;
    if (props.totalDistance) distance = props.totalDistance;
    if (props.totalTime) duration = props.totalTime;

    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates as number[][];
      for (const c of coords) {
        const coord = { lng: c[0], lat: c[1] };
        const prev = path[path.length - 1];
        if (!prev || prev.lat !== coord.lat || prev.lng !== coord.lng) {
          path.push(coord);
        }
      }
    }
  }

  return { path, distance, duration };
}

/**
 * 순환 보행자 경로: origin → wp1 → wp2 → ... → origin
 */
export async function fetchTmapWalkingRoute(
  origin: Coordinate,
  waypoints: Coordinate[]
): Promise<{ path: Coordinate[]; distance: number; duration: number }> {
  const apiKey = process.env.TMAP_API_KEY;
  if (!apiKey) throw new Error('TMAP_API_KEY 환경변수가 없습니다');

  const points = [origin, ...waypoints, origin];
  let totalPath: Coordinate[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const seg = await fetchSegment(points[i], points[i + 1], apiKey);
    totalDistance += seg.distance;
    totalDuration += seg.duration;
    if (totalPath.length > 0 && seg.path.length > 0) seg.path.shift();
    totalPath = totalPath.concat(seg.path);
  }

  return { path: totalPath, distance: totalDistance, duration: totalDuration };
}
