'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

import { useWalkTracker } from '@/hooks/useWalkTracker';
import { useRouteStore } from '@/stores/routeStore';
import { useWalkStore } from '@/stores/walkStore';
import type { WalkResult } from '@/stores/walkStore';
import { saveWalkToDb } from '@/lib/supabase/walk-save';
import { clearWalkPhotos, getWalkPhotos } from '@/components/walk/PhotoCapture';
import WalkStats from '@/components/walk/WalkStats';
import WalkActionBar from '@/components/walk/WalkActionBar';
import WalkCompleteModal from '@/components/walk/WalkCompleteModal';
import WalkTagManager from '@/components/walk/WalkTagManager';
import NightWarning from '@/components/walk/NightWarning';
import RoutePolyline from '@/components/map/RoutePolyline';
import RouteDirectionMarkers from '@/components/map/RouteDirectionMarkers';

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false, loading: () => <div className="h-full w-full bg-mw-gray-100 animate-pulse" />,
});

export default function WalkPage() {
  const router = useRouter();
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [following, setFollowing] = useState(true);

  const { routes, selectedIndex, selectedPetId, selectedPetName } = useRouteStore();
  const petId = selectedPetId ?? undefined;
  const petName = selectedPetName ?? undefined;
  const {
    position, gpsError, gpsLoading,
    isWalking, isPaused, coordinates, distance, elapsed, targetDistance,
    startWalk, pauseWalk, resumeWalk, endWalk, reset,
  } = useWalkTracker();

  useEffect(() => {
    if (useWalkStore.getState().restoreWalk()) toast.info('이전 산책을 이어서 진행합니다.');
  }, []);

  const referenceRoute = routes[selectedIndex] ?? null;
  const center = position ?? { lat: 37.5665, lng: 126.978 };

  const handleStart = () => {
    if (!position) { toast.error('현재 위치를 확인할 수 없어요.'); return; }
    startWalk(referenceRoute?.totalDistance);
  };

  const handleRecenter = () => {
    if (!mapInstance || !position) return;
    mapInstance.panTo(new window.kakao.maps.LatLng(position.lat, position.lng));
    setFollowing(true);
  };

  const handleShowFullRoute = () => {
    if (!mapInstance || coordinates.length < 2) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    coordinates.forEach((c) => bounds.extend(new window.kakao.maps.LatLng(c.lat, c.lng)));
    if (referenceRoute) {
      referenceRoute.path.forEach((c) => bounds.extend(new window.kakao.maps.LatLng(c.lat, c.lng)));
    }
    mapInstance.setBounds(bounds);
    setFollowing(false);
  };

  const handleConfirm = async () => {
    if (result) {
      try {
        await saveWalkToDb({
          startedAt: new Date(result.startedAt).toISOString(),
          distanceMeters: Math.round(result.distance),
          durationSeconds: result.durationSec, coordinates: result.coordinates, petId,
        });
        toast.success('산책 기록이 저장되었어요!');
      } catch { toast.error('기록 저장에 실패했어요.'); }
    }
    clearWalkPhotos(); setResult(null); reset(); router.push('/app');
  };

  const photoCount = result ? getWalkPhotos().length : 0;

  return (
    <div className="relative h-full overflow-hidden">
      <KakaoMap center={center} currentPosition={position} followPosition={isWalking && following && !isPaused} level={3} className="h-full w-full" onMapReady={setMapInstance} />

      {mapInstance && referenceRoute && (
        <>
          <RoutePolyline map={mapInstance} path={referenceRoute.path} color="#2D8A42" opacity={0.25} weight={4} fitBounds={!isWalking} />
          <RouteDirectionMarkers map={mapInstance} path={referenceRoute.path} />
        </>
      )}
      {mapInstance && coordinates.length >= 2 && (
        <RoutePolyline map={mapInstance} path={coordinates} color="#2D8A42" opacity={0.9} weight={5} fitBounds={false} />
      )}

      <WalkTagManager map={mapInstance} position={position} isOpen={showTags} onClose={() => setShowTags(false)} />
      <NightWarning />

      {!isWalking && (gpsLoading || gpsError) && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className={`text-[13px] ${gpsError ? 'text-mw-danger' : 'text-mw-gray-500'}`}>
            {gpsLoading ? '현재 위치를 찾고 있어요...' : gpsError}
          </p>
        </div>
      )}

      {isWalking && <WalkStats elapsed={elapsed} distance={distance} targetDistance={targetDistance} petName={petName} />}
      {isWalking && (
        <WalkActionBar isPaused={isPaused} position={position} onTag={() => setShowTags(true)} onPause={pauseWalk} onResume={resumeWalk} onStop={() => setResult(endWalk())} />
      )}

      {isWalking && (
        <div className="absolute bottom-36 right-4 z-30 flex flex-col gap-2">
          {!following && (
            <button onClick={handleRecenter} className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:scale-[0.95]" aria-label="현위치 복귀">
              <Navigation size={20} className="text-mw-info" />
            </button>
          )}
          <button onClick={handleShowFullRoute} className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:scale-[0.95]" aria-label="전체 보기">
            <Maximize2 size={20} className="text-mw-gray-600" />
          </button>
        </div>
      )}

      {!isWalking && !result && (
        <div className="absolute bottom-20 left-4 right-4 z-30">
          <button onClick={handleStart} disabled={!position} className="w-full animate-gentle-pulse rounded-mw bg-mw-green-500 py-4 text-[16px] font-bold text-white shadow-sm active:scale-[0.97] disabled:opacity-40">
            산책 시작
          </button>
        </div>
      )}

      {result && (
        <WalkCompleteModal distance={result.distance} durationSec={result.durationSec} coordinates={result.coordinates} petName={petName} photoCount={photoCount} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
