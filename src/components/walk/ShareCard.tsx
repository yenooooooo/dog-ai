'use client';

import { forwardRef } from 'react';

import type { Coordinate } from '@/types/route';

interface ShareCardProps {
  coordinates: Coordinate[];
  distance: number;
  durationSec: number;
  petName?: string;
}

const CARD_W = 360;
const CARD_H = 450;
const MAP_H = 180;

/** GPS 좌표 → SVG path + 출발점 좌표 */
function coordsToSvg(coords: Coordinate[], w: number, h: number) {
  if (coords.length < 2) return null;

  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const pad = 30;
  const scale = Math.min((w - pad * 2) / lngRange, (h - pad * 2) / latRange);
  const cx = w / 2, cy = h / 2;
  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;

  let sx = 0, sy = 0;
  const d = coords
    .map((c, i) => {
      const x = cx + (c.lng - midLng) * scale;
      const y = cy - (c.lat - midLat) * scale;
      if (i === 0) { sx = x; sy = y; }
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return { path: d, startX: sx, startY: sy };
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ coordinates, distance, durationSec, petName }, ref) => {
    const km = (distance / 1000).toFixed(2);
    const mins = Math.round(durationSec / 60);
    const avgSpeed =
      durationSec > 0 ? ((distance / durationSec) * 60).toFixed(0) : '0';
    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const svg = coordsToSvg(coordinates, CARD_W, MAP_H);

    return (
      <div
        ref={ref}
        className="flex flex-col bg-gradient-to-b from-mw-green-50 to-mw-gray-50 font-sans"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <svg width={CARD_W} height={MAP_H} viewBox={`0 0 ${CARD_W} ${MAP_H}`}>
          {svg && (
            <>
              <path
                d={svg.path}
                fill="none"
                stroke="#2D8A42"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={svg.startX} cy={svg.startY} r="5" fill="#2D8A42" />
            </>
          )}
        </svg>

        <div className="flex flex-1 flex-col items-center px-8 pt-4">
          <p className="text-[12px] font-medium text-mw-gray-500">{dateStr}</p>
          <p className="mt-1 text-[24px] font-bold text-mw-gray-900">
            {petName ? `${petName}의 산책` : '오늘의 산책'}
          </p>

          <div className="mt-6 flex w-full justify-center gap-8">
            <StatBlock label="거리" value={`${km}km`} />
            <StatBlock label="시간" value={`${mins}분`} />
            <StatBlock label="속도" value={`${avgSpeed}m/분`} />
          </div>

          <p className="mt-auto pb-5 text-[11px] text-mw-gray-400">
            멍산책으로 새로운 길 발견 중 🐾
          </p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-medium text-mw-gray-400">{label}</p>
      <p className="mt-1 text-[22px] font-bold text-mw-gray-900">{value}</p>
    </div>
  );
}
