import type { Coordinate } from '@/types/route';

const R = 6371000; // 지구 반경(미터)
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** 두 좌표 사이 거리(미터) — Haversine 공식 */
export function getDistanceMeters(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** 기준점에서 특정 방위각(도)/거리(미터)만큼 떨어진 좌표 반환 */
export function getPointAtBearing(
  origin: Coordinate,
  bearingDeg: number,
  distanceM: number
): Coordinate {
  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);
  const brng = toRad(bearingDeg);
  const d = distanceM / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}
