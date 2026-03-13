'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

import { useWalkTracker } from '@/hooks/useWalkTracker';
import { useRouteStore } from '@/stores/routeStore';
import type { WalkResult } from '@/stores/walkStore';
import { saveWalk } from '@/lib/walk-storage';
import { getPets } from '@/lib/profile-storage';
import WalkStats from '@/components/walk/WalkStats';
import WalkActionBar from '@/components/walk/WalkActionBar';
import WalkCompleteModal from '@/components/walk/WalkCompleteModal';
import WalkTagManager from '@/components/walk/WalkTagManager';
import RoutePolyline from '@/components/map/RoutePolyline';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-mw-gray-100 animate-pulse" />,
});

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function WalkPage() {
  const router = useRouter();
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [showTags, setShowTags] = useState(false);
  const petName = getPets()[0]?.name;

  const {
    position, gpsError, gpsLoading,
    isWalking, coordinates, distance, elapsed,
    startWalk, endWalk, reset,
  } = useWalkTracker();

  const { routes, selectedIndex } = useRouteStore();
  const referenceRoute = routes[selectedIndex] ?? null;
  const center = position ?? DEFAULT_CENTER;

  const handleStart = () => {
    if (!position) {
      toast.error('현재 위치를 확인할 수 없어요.');
      return;
    }
    startWalk();
  };

  const handleStop = () => setResult(endWalk());

  const handleConfirm = () => {
    if (result) {
      saveWalk({
        startedAt: new Date(result.startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        distanceMeters: Math.round(result.distance),
        durationSeconds: result.durationSec,
        coordinates: result.coordinates,
      });
      toast.success('산책 기록이 저장되었어요!');
    }
    setResult(null);
    reset();
    router.push('/app');
  };

  return (
    <div className="relative h-full overflow-hidden">
      <KakaoMap
        center={center}
        currentPosition={position}
        level={3}
        className="h-full w-full"
        onMapReady={setMapInstance}
      />

      {/* 참조 루트 (연하게) */}
      {mapInstance && referenceRoute && (
        <RoutePolyline
          map={mapInstance}
          path={referenceRoute.path}
          color="#2D8A42"
          opacity={0.25}
          weight={4}
          fitBounds={!isWalking}
        />
      )}

      {/* 실시간 트래킹 폴리라인 */}
      {mapInstance && coordinates.length >= 2 && (
        <RoutePolyline
          map={mapInstance}
          path={coordinates}
          color="#2D8A42"
          opacity={0.9}
          weight={5}
          fitBounds={false}
        />
      )}

      {/* 태그 마커 + 태그 시트 */}
      <WalkTagManager
        map={mapInstance}
        position={position}
        isOpen={showTags}
        onClose={() => setShowTags(false)}
      />

      {/* GPS 상태 (산책 전) */}
      {!isWalking && (gpsLoading || gpsError) && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className={`text-[13px] ${gpsError ? 'text-mw-danger' : 'text-mw-gray-500'}`}>
            {gpsLoading ? '현재 위치를 찾고 있어요...' : gpsError}
          </p>
        </div>
      )}

      {isWalking && <WalkStats elapsed={elapsed} distance={distance} />}
      {isWalking && (
        <WalkActionBar
          onTag={() => setShowTags(true)}
          onStop={handleStop}
        />
      )}

      {!isWalking && !result && (
        <div className="absolute bottom-28 left-4 right-4 z-30">
          <button
            onClick={handleStart}
            disabled={!position}
            className="w-full animate-gentle-pulse rounded-mw bg-mw-green-500 py-4 text-[16px] font-bold text-white shadow-sm transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            산책 시작
          </button>
        </div>
      )}

      {result && (
        <WalkCompleteModal
          distance={result.distance} durationSec={result.durationSec}
          coordinates={result.coordinates} petName={petName}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
