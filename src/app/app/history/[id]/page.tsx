'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Route, Timer, Zap, Calendar } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { getWalkPhotos } from '@/lib/walk-photo-storage';
import type { Coordinate } from '@/types/route';
import type { WalkPhoto } from '@/types/walk-photo';
import RoutePolyline from '@/components/map/RoutePolyline';
import HistoryShareCard from '@/components/walk/HistoryShareCard';
import WalkDetailActions from '@/components/walk/WalkDetailActions';
import WalkStatItem from '@/components/walk/WalkStatItem';
import PhotoTimeline from '@/components/walk/PhotoTimeline';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="h-[45vh] w-full bg-mw-gray-100 animate-pulse" />,
});

export default function WalkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [walk, setWalk] = useState<{
    distanceMeters: number; durationSeconds: number;
    startedAt: string; coordinates: Coordinate[];
  } | null>(null);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [photos, setPhotos] = useState<WalkPhoto[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('mw_walks')
        .select('distance_meters, duration_seconds, started_at, route_geojson')
        .eq('id', id).single();
      if (!data) { router.replace('/app/history'); return; }
      const coords: Coordinate[] = data.route_geojson?.coordinates?.map(
        (c: number[]) => ({ lng: c[0], lat: c[1] })
      ) ?? [];
      setWalk({
        distanceMeters: data.distance_meters,
        durationSeconds: data.duration_seconds,
        startedAt: data.started_at,
        coordinates: coords,
      });
      setPhotos(getWalkPhotos(id));
    };
    load();
  }, [id, router]);

  if (!walk) return null;

  const km = (walk.distanceMeters / 1000).toFixed(2);
  const mins = Math.round(walk.durationSeconds / 60);
  const avgSpeed = walk.durationSeconds > 0
    ? ((walk.distanceMeters / walk.durationSeconds) * 60).toFixed(0) : '0';
  const center = walk.coordinates[0] ?? { lat: 37.5665, lng: 126.978 };
  const dateStr = new Date(walk.startedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
  const timeStr = new Date(walk.startedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  });
  const walkStartMs = new Date(walk.startedAt).getTime();

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-mw-gray-900">산책 상세</h1>
      </header>

      <div className="h-[45vh] w-full shrink-0">
        <KakaoMap center={center} level={4} className="h-full w-full" onMapReady={setMapInstance} />
        {mapInstance && walk.coordinates.length >= 2 && (
          <RoutePolyline map={mapInstance} path={walk.coordinates} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-[13px] text-mw-gray-500">
            <Calendar size={14} />
            <span>{dateStr} {timeStr}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <WalkStatItem icon={<Route size={18} className="text-mw-green-500" />} label="거리" value={`${km}km`} />
            <WalkStatItem icon={<Timer size={18} className="text-mw-green-500" />} label="시간" value={`${mins}분`} />
            <WalkStatItem icon={<Zap size={18} className="text-mw-amber-500" />} label="평균 속도" value={`${avgSpeed}m/분`} />
          </div>
        </div>

        <PhotoTimeline photos={photos} walkStartedAt={walkStartMs} />

        {walk.coordinates.length >= 2 && (
          <HistoryShareCard coordinates={walk.coordinates} distance={walk.distanceMeters} durationSec={walk.durationSeconds} />
        )}
        <WalkDetailActions walkId={id} />
      </div>
    </div>
  );
}
