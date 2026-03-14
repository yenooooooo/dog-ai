import type { Coordinate } from '@/types/route';

/** 좌표 배열을 SVG path string으로 변환 */
export function pathToSvg(
  path: Coordinate[],
  w: number,
  h: number,
  maxPts = 60
): { d: string; startX: number; startY: number } | null {
  if (path.length < 2) return null;

  // 균등 샘플링
  const simplified = path.length <= maxPts
    ? path
    : Array.from({ length: maxPts }, (_, i) =>
        path[Math.round(i * ((path.length - 1) / (maxPts - 1)))]
      );

  const lats = simplified.map((c) => c.lat);
  const lngs = simplified.map((c) => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latR = maxLat - minLat || 0.001;
  const lngR = maxLng - minLng || 0.001;
  const pad = 16;
  const scale = Math.min((w - pad * 2) / lngR, (h - pad * 2) / latR);
  const cx = w / 2, cy = h / 2;
  const midLng = (minLng + maxLng) / 2, midLat = (minLat + maxLat) / 2;

  let sx = 0, sy = 0;
  const d = simplified
    .map((c, i) => {
      const x = cx + (c.lng - midLng) * scale;
      const y = cy - (c.lat - midLat) * scale;
      if (i === 0) { sx = x; sy = y; }
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return { d, startX: sx, startY: sy };
}
