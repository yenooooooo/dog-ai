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
const CARD_H = 640; // 9:16 스토리 비율

/** GPS 좌표 → SVG path */
function coordsToSvg(coords: Coordinate[], w: number, h: number) {
  if (coords.length < 2) return null;
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latR = maxLat - minLat || 0.001;
  const lngR = maxLng - minLng || 0.001;
  const pad = 40;
  const scale = Math.min((w - pad * 2) / lngR, (h - pad * 2) / latR);
  const cx = w / 2, cy = h / 2;
  const midLng = (minLng + maxLng) / 2, midLat = (minLat + maxLat) / 2;

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

/** 격자 배경 패턴 (지도 느낌) */
function GridPattern() {
  return (
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
    </pattern>
  );
}

/** 강아지 발자국 (SVG, 위치 지정) */
function Pawprint({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size / 24})`} opacity={opacity}>
      <ellipse cx="12" cy="18" rx="5" ry="6" fill="#D1FAE5" />
      <circle cx="6" cy="9" r="3" fill="#D1FAE5" />
      <circle cx="18" cy="9" r="3" fill="#D1FAE5" />
      <circle cx="10" cy="5" r="2.5" fill="#D1FAE5" />
      <circle cx="14" cy="5" r="2.5" fill="#D1FAE5" />
    </g>
  );
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ coordinates, distance, durationSec, petName }, ref) => {
    const km = (distance / 1000).toFixed(2);
    const mins = Math.round(durationSec / 60);
    const avgSpeed = durationSec > 0 ? ((distance / durationSec) * 60).toFixed(0) : '0';
    const kcal = Math.round((distance / 1000) * 65 * 0.5);
    const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const svg = coordsToSvg(coordinates, CARD_W, 280);

    return (
      <div ref={ref} style={{ width: CARD_W, height: CARD_H, fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 40%, #FFFFFF 100%)' }}>
        {/* 격자 + 발자국 배경 */}
        <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', top: 0, left: 0 }}>
          <GridPattern />
          <rect width={CARD_W} height={CARD_H} fill="url(#grid)" />
          <Pawprint x={30} y={60} size={32} opacity={0.4} />
          <Pawprint x={280} y={140} size={24} opacity={0.3} />
          <Pawprint x={60} y={420} size={28} opacity={0.35} />
          <Pawprint x={290} y={500} size={20} opacity={0.25} />
          <Pawprint x={160} y={560} size={22} opacity={0.2} />
        </svg>

        {/* 경로 그래픽 */}
        <svg width={CARD_W} height={280} viewBox={`0 0 ${CARD_W} 280`} style={{ position: 'relative' }}>
          {svg && (
            <>
              <path d={svg.path} fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
              <path d={svg.path} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={svg.startX} cy={svg.startY} r="8" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />
              <circle cx={svg.startX} cy={svg.startY} r="3" fill="#16A34A" />
            </>
          )}
        </svg>

        {/* 콘텐츠 */}
        <div style={{ position: 'relative', padding: '0 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{dateStr}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginTop: 4 }}>
            {petName ? `${petName}의 산책` : '오늘의 산책'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4, marginTop: 20 }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{km}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#4ADE80' }}>km</span>
          </div>

          {/* 통계 그리드 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <StatPill label="시간" value={`${mins}분`} />
            <StatPill label="속도" value={`${avgSpeed}m/분`} />
            <StatPill label="칼로리" value={`${kcal}kcal`} />
          </div>
        </div>

        {/* 하단 브랜드 */}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', letterSpacing: 2 }}>🐾 멍산책</p>
          <p style={{ fontSize: 10, color: '#D1D5DB', marginTop: 4 }}>새로운 길을 발견하는 산책</p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: '10px 16px', minWidth: 80, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginTop: 2 }}>{value}</p>
    </div>
  );
}
