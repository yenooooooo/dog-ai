'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useRouteStore } from '@/stores/routeStore';
import { createClient } from '@/lib/supabase/client';
import BottomSheet from '@/components/layout/BottomSheet';
import RoutePolyline from '@/components/map/RoutePolyline';
import RouteDirectionMarkers from '@/components/map/RouteDirectionMarkers';
import OriginMarker from '@/components/map/OriginMarker';
import PastRoutes from '@/components/map/PastRoutes';
import PetFriendlyButton from '@/components/map/PetFriendlyButton';
import TodayStatus from '@/components/walk/TodayStatus';
import MainBottomContent from '@/components/walk/MainBottomContent';
import type { Coordinate, GeneratedRoute } from '@/types/route';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-mw-gray-100 animate-pulse" />,
});

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

interface PetInfo { id: string; name: string; size: string | null }

export default function AppMainPage() {
  const { position, error: gpsError, isLoading: gpsLoading } = useGeolocation();
  const [duration, setDuration] = useState(30);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetHidden, setSheetHidden] = useState(false);
  const [customOrigin, setCustomOrigin] = useState<Coordinate | null>(null);
  const [pets, setPets] = useState<PetInfo[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);

  const { routes, selectedIndex, isGenerating, error: routeError, generateRoutes, setSelectedPet: setStorePet, reset } = useRouteStore();
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

  const handleAddressSelect = useCallback((coord: Coordinate, name: string) => {
    setCustomOrigin(coord);
    if (mapInstance) mapInstance.panTo(new window.kakao.maps.LatLng(coord.lat, coord.lng));
    toast.success(`${name}(으)로 출발 위치 설정`);
  }, [mapInstance]);

  const handleFavoriteSelect = useCallback((route: GeneratedRoute) => {
    if (mapInstance && route.path.length >= 2) {
      const bounds = new window.kakao.maps.LatLngBounds();
      route.path.forEach((c) => bounds.extend(new window.kakao.maps.LatLng(c.lat, c.lng)));
      mapInstance.setBounds(bounds);
    }
  }, [mapInstance]);

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
      {mapInstance && routes.length === 0 && <PastRoutes map={mapInstance} />}

      <TodayStatus />
      {routes.length === 0 && <PetFriendlyButton map={mapInstance} position={position} onSetOrigin={handleAddressSelect} />}

      {customOrigin && routes.length === 0 && (
        <div className="absolute left-5 top-3 z-30 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            <MapPin size={14} className="text-mw-danger" />
            <span className="text-[13px] font-medium text-mw-gray-800">출발 위치 지정됨</span>
          </div>
          <button onClick={() => { setCustomOrigin(null); if (mapInstance && position) mapInstance.panTo(new window.kakao.maps.LatLng(position.lat, position.lng)); toast.success('현재 위치로 돌아왔어요'); }} className="flex items-center gap-1 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
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

      {sheetHidden ? (
        <button onClick={() => setSheetHidden(false)} className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-mw-green-500 px-5 py-2.5 shadow-lg active:scale-[0.97]">
          <span className="text-[13px] font-semibold text-white">산책 메뉴 열기</span>
        </button>
      ) : (
        <BottomSheet isExpanded={sheetExpanded} onToggle={setSheetExpanded} collapsedHeight={routes.length > 0 ? 320 : pets.length > 0 ? 350 : 300}>
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <button onClick={() => setSheetHidden(true)} className="text-[11px] text-mw-gray-400">숨기기</button>
          </div>
          <MainBottomContent
            duration={duration} onDurationChange={setDuration}
            pets={pets} selectedPet={selectedPet} onSelectPet={setSelectedPet}
            isGenerating={isGenerating} canGenerate={!!origin} routeError={routeError}
            onGenerate={handleGenerate} onReset={handleReset}
            hasCustomOrigin={!!customOrigin} onFavoriteSelect={handleFavoriteSelect} onAddressSelect={handleAddressSelect}
          />
        </BottomSheet>
      )}
    </div>
  );
}
