'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useRouteStore } from '@/stores/routeStore';
import BottomSheet from '@/components/layout/BottomSheet';
import TimeSelector from '@/components/walk/TimeSelector';
import RouteCard from '@/components/walk/RouteCard';
import RoutePolyline from '@/components/map/RoutePolyline';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-mw-gray-100 animate-pulse" />,
});

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function AppMainPage() {
  const router = useRouter();
  const { position, error: gpsError, isLoading: gpsLoading } = useGeolocation();
  const [duration, setDuration] = useState(30);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const {
    routes,
    selectedIndex,
    isGenerating,
    error: routeError,
    generateRoutes,
    selectRoute,
    reset,
  } = useRouteStore();

  const center = position ?? DEFAULT_CENTER;
  const selectedRoute = routes[selectedIndex] ?? null;

  const handleGenerate = useCallback(async () => {
    if (!position) {
      toast.error('현재 위치를 확인할 수 없어요.');
      return;
    }
    await generateRoutes(position, duration);
    setSheetExpanded(true);
  }, [position, duration, generateRoutes]);

  return (
    <div className="relative h-full overflow-hidden">
      <KakaoMap
        center={center}
        currentPosition={position}
        level={3}
        className="h-full w-full"
        onMapReady={setMapInstance}
      />

      {/* 선택된 루트 폴리라인 */}
      {mapInstance && selectedRoute && (
        <RoutePolyline map={mapInstance} path={selectedRoute.path} />
      )}

      {/* GPS 상태 */}
      {gpsLoading && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[13px] text-mw-gray-500">
            현재 위치를 찾고 있어요...
          </p>
        </div>
      )}
      {gpsError && !gpsLoading && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[13px] text-mw-danger">{gpsError}</p>
        </div>
      )}

      {/* 바텀시트: 시간 선택 → 루트 캐러셀 */}
      <BottomSheet
        isExpanded={sheetExpanded}
        onToggle={setSheetExpanded}
        collapsedHeight={routes.length > 0 ? 280 : 180}
      >
        {routes.length === 0 ? (
          <>
            <h2 className="text-[20px] font-bold text-mw-gray-900">
              산책 시간
            </h2>
            <p className="mt-1 text-[13px] text-mw-gray-500">
              원하는 시간을 선택하면 순환 루트를 만들어 드려요
            </p>
            <div className="mt-4">
              <TimeSelector value={duration} onChange={setDuration} />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !position}
              className="mt-4 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
            >
              {isGenerating ? '루트 생성 중...' : '루트 만들기'}
            </button>
            {routeError && (
              <p className="mt-2 text-center text-[13px] text-mw-danger">
                {routeError}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-mw-gray-900">
                추천 루트
              </h2>
              <button
                onClick={reset}
                className="text-[13px] font-medium text-mw-gray-500"
              >
                다시 선택
              </button>
            </div>
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {routes.map((route, idx) => (
                <div
                  key={route.id}
                  className="w-[calc(100%-28px)] shrink-0 snap-center"
                >
                  <RouteCard
                    route={route}
                    isSelected={idx === selectedIndex}
                    onSelect={() => selectRoute(idx)}
                    onStartWalk={() => router.push('/app/walk')}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
