'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useRouteStore } from '@/stores/routeStore';
import { createClient } from '@/lib/supabase/client';
import BottomSheet from '@/components/layout/BottomSheet';
import TimeSelector from '@/components/walk/TimeSelector';
import RouteCard from '@/components/walk/RouteCard';
import RoutePolyline from '@/components/map/RoutePolyline';
import RouteDirectionMarkers from '@/components/map/RouteDirectionMarkers';
import OriginMarker from '@/components/map/OriginMarker';
import PetSelector from '@/components/walk/PetSelector';
import TodayStatus from '@/components/walk/TodayStatus';
import type { Coordinate } from '@/types/route';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-mw-gray-100 animate-pulse" />,
});

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

interface PetInfo { id: string; name: string; size: string | null }

export default function AppMainPage() {
  const router = useRouter();
  const { position, error: gpsError, isLoading: gpsLoading } = useGeolocation();
  const [duration, setDuration] = useState(30);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [customOrigin, setCustomOrigin] = useState<Coordinate | null>(null);
  const [pets, setPets] = useState<PetInfo[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);

  const { routes, selectedIndex, isGenerating, error: routeError, generateRoutes, selectRoute, setSelectedPet: setStorePet, reset } = useRouteStore();
  const center = position ?? DEFAULT_CENTER;
  const selectedRoute = routes[selectedIndex] ?? null;
  const origin = customOrigin ?? position;

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: mu } = await sb.from('mw_users').select('id').eq('auth_id', user.id).single();
      if (!mu) return;
      const { data } = await sb.from('mw_pets').select('id, name, size').eq('user_id', mu.id);
      if (data?.length) { setPets(data); setSelectedPet(data[0]); }
    });
  }, []);

  const handleMapClick = useCallback((coord: Coordinate) => {
    if (routes.length > 0) return;
    setCustomOrigin(coord);
    toast.success('출발 위치가 설정되었어요');
  }, [routes.length]);

  const handleGenerate = useCallback(async () => {
    if (!origin) { toast.error('출발 위치를 지정해주세요.'); return; }
    setStorePet(selectedPet?.id ?? null, selectedPet?.name ?? null);
    await generateRoutes(origin, duration, selectedPet?.size ?? undefined);
    setSheetExpanded(true);
  }, [origin, duration, generateRoutes, selectedPet, setStorePet]);

  const handleReset = () => { reset(); setCustomOrigin(null); };

  return (
    <div className="relative h-full overflow-hidden">
      <KakaoMap center={center} currentPosition={position} level={3} className="h-full w-full" onMapReady={setMapInstance} onMapClick={routes.length === 0 ? handleMapClick : undefined} />

      {mapInstance && selectedRoute && (
        <>
          <RoutePolyline key={selectedRoute.id} map={mapInstance} path={selectedRoute.path} />
          <RouteDirectionMarkers key={`dir-${selectedRoute.id}`} map={mapInstance} path={selectedRoute.path} />
        </>
      )}
      {mapInstance && customOrigin && <OriginMarker map={mapInstance} position={customOrigin} />}

      <TodayStatus />

      {customOrigin && routes.length === 0 && (
        <div className="absolute left-5 top-3 z-30 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            <MapPin size={14} className="text-mw-danger" />
            <span className="text-[13px] font-medium text-mw-gray-800">출발 위치 지정됨</span>
          </div>
          <button onClick={() => { setCustomOrigin(null); toast.success('현재 위치로 돌아왔어요'); }} className="flex items-center gap-1 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            <Navigation size={14} className="text-mw-info" />
            <span className="text-[13px] text-mw-gray-600">현위치</span>
          </button>
        </div>
      )}

      {!customOrigin && gpsLoading && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[13px] text-mw-gray-500">현재 위치를 찾고 있어요...</p>
        </div>
      )}
      {!customOrigin && gpsError && !gpsLoading && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[13px] text-mw-danger">{gpsError}</p>
        </div>
      )}

      <BottomSheet isExpanded={sheetExpanded} onToggle={setSheetExpanded} collapsedHeight={routes.length > 0 ? 300 : pets.length > 0 ? 310 : 260}>
        {routes.length === 0 ? (
          <>
            <h2 className="text-[20px] font-bold text-mw-gray-900">산책 시간</h2>
            <p className="mt-1 text-[13px] text-mw-gray-500">
              {customOrigin ? '📍 출발 위치를 지정했어요' : '지도를 탭하면 출발 위치를 변경할 수 있어요'}
            </p>
            <PetSelector pets={pets} selectedId={selectedPet?.id ?? null} onSelect={setSelectedPet} />
            <div className="mt-3"><TimeSelector value={duration} onChange={setDuration} /></div>
            <button onClick={handleGenerate} disabled={isGenerating || !origin} className="mt-3 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40">
              {isGenerating ? '루트 생성 중...' : '루트 만들기'}
            </button>
            {routeError && (
              <div className="mt-2 text-center">
                <p className="text-[13px] text-mw-danger">{routeError}</p>
                <button onClick={handleReset} className="mt-1 text-[13px] font-medium text-mw-green-500">
                  다시 시도
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-mw-gray-900">추천 루트</h2>
              <button onClick={handleReset} className="text-[13px] font-medium text-mw-gray-500">다시 선택</button>
            </div>
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {routes.map((route, idx) => (
                <div key={route.id} className="w-[calc(100%-28px)] shrink-0 snap-center">
                  <RouteCard route={route} isSelected={idx === selectedIndex} onSelect={() => selectRoute(idx)} onStartWalk={() => router.push('/app/walk')} />
                </div>
              ))}
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
