'use client';

import { useState } from 'react';
import { Route, Timer, Heart } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { saveFavoriteRoute, isFavoriteRoute } from '@/lib/supabase/favorite-routes';
import type { GeneratedRoute, Coordinate } from '@/types/route';

interface RouteCardProps {
  route: GeneratedRoute;
  isSelected: boolean;
  onSelect: () => void;
  onStartWalk: () => void;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

/** 좌표 배열 간소화: 균등 샘플링으로 최대 maxPts개 */
function simplifyPath(path: Coordinate[], maxPts: number): Coordinate[] {
  if (path.length <= maxPts) return path;
  const step = (path.length - 1) / (maxPts - 1);
  return Array.from({ length: maxPts }, (_, i) =>
    path[Math.round(i * step)]
  );
}

/** 루트 경로를 SVG path string으로 변환 */
function pathToSvg(path: Coordinate[], w: number, h: number): string | null {
  if (path.length < 2) return null;
  // SVG 미니맵용: 최대 60포인트로 간소화 → 깔끔한 곡선
  const simplified = simplifyPath(path, 60);
  const lats = simplified.map((c) => c.lat);
  const lngs = simplified.map((c) => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latR = maxLat - minLat || 0.001;
  const lngR = maxLng - minLng || 0.001;
  const pad = 12;
  const scale = Math.min((w - pad * 2) / lngR, (h - pad * 2) / latR);
  const cx = w / 2, cy = h / 2;
  const midLng = (minLng + maxLng) / 2, midLat = (minLat + maxLat) / 2;

  return simplified
    .map((c, i) => {
      const x = cx + (c.lng - midLng) * scale;
      const y = cy - (c.lat - midLat) * scale;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function RouteCard({ route, isSelected, onSelect, onStartWalk }: RouteCardProps) {
  const [isFav, setIsFav] = useState(() => isFavoriteRoute(route.id));
  const svgPath = pathToSvg(route.path, 280, 120);
  const isPark = route.id.startsWith('park-');

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveFavoriteRoute(route);
    setIsFav(true);
    toast.success('즐겨찾기에 저장했어요!');
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-mw-lg border p-4 transition-all',
        isSelected ? 'border-mw-green-500 bg-white' : 'border-mw-gray-100 bg-white'
      )}
    >
      <div className="flex h-[120px] items-center justify-center rounded-xl bg-mw-gray-50">
        {svgPath ? (
          <svg width="280" height="120" viewBox="0 0 280 120" className="w-full">
            <path d={svgPath} fill="none" stroke="#2D8A42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isPark ? '8 4' : 'none'} />
          </svg>
        ) : (
          <Route size={24} className="text-mw-gray-300" strokeWidth={1.75} />
        )}
      </div>

      <h3 className="mt-3 text-[17px] font-semibold text-mw-gray-900">{route.name}</h3>

      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {route.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-mw-green-50 px-2 py-0.5 text-[12px] font-medium text-mw-green-600">{tag}</span>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-mw-gray-300">{isPark ? '🌳 공원 안에서 자유롭게 걸어보세요' : '📌 참고 경로 — 안전한 인도와 산책로로 걸어주세요'}</p>

      <div className="mt-2 flex items-center gap-4 text-[13px] text-mw-gray-500">
        <span className="flex items-center gap-1"><Route size={14} strokeWidth={1.75} />{formatDistance(route.totalDistance)}</span>
        <span className="flex items-center gap-1"><Timer size={14} strokeWidth={1.75} />약 {route.estimatedDuration}분</span>
      </div>

      {isSelected && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onStartWalk(); }}
            className="flex-1 rounded-mw bg-mw-green-500 py-3 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
          >
            이 루트로 산책
          </button>
          <button
            onClick={handleFavorite} disabled={isFav}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-mw border border-mw-gray-200 transition-transform active:scale-[0.95] disabled:opacity-50"
          >
            <Heart size={18} className={isFav ? 'text-mw-danger' : 'text-mw-gray-400'} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      )}
    </div>
  );
}
