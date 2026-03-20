'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

import { useWalkTracker } from '@/hooks/useWalkTracker';
import { useRouteStore } from '@/stores/routeStore';
import { useWalkStore, type WalkResult } from '@/stores/walkStore';
import { saveWalkToDb } from '@/lib/supabase/walk-save';
import { clearWalkPhotos, getWalkPhotos } from '@/components/walk/PhotoCapture';
import { saveWalkPhotos } from '@/lib/walk-photo-storage';
import { saveRouteReview } from '@/lib/route-review';
import { setHealthMemo } from '@/lib/health-memo';
import type { HealthMemo } from '@/types/health-memo';
import WalkStats from '@/components/walk/WalkStats';
import WalkActionBar from '@/components/walk/WalkActionBar';
import WalkCompleteModal from '@/components/walk/WalkCompleteModal';
import ShortWalkPrompt from '@/components/walk/ShortWalkPrompt';
import WalkTagManager from '@/components/walk/WalkTagManager';
import NightWarning from '@/components/walk/NightWarning';
import WeatherWarning from '@/components/walk/WeatherWarning';
import WalkStartPanel from '@/components/walk/WalkStartPanel';
import RoutePolyline from '@/components/map/RoutePolyline';
import RouteDirectionMarkers from '@/components/map/RouteDirectionMarkers';
import ReturnGuide from '@/components/walk/ReturnGuide';

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
    position, heading, gpsError, gpsLoading,
    isWalking, isPaused, coordinates, distance, elapsed, targetDistance,
    startWalk, pauseWalk, resumeWalk, endWalk, reset,
  } = useWalkTracker();

  useEffect(() => {
    if (useWalkStore.getState().restoreWalk()) toast.info('이전 산책을 이어서 진행합니다.');
  }, []);

  const referenceRoute = routes[selectedIndex] ?? null;
  const center = position ?? { lat: 37.5665, lng: 126.978 };

  const checkPos = () => { if (!position) { toast.error('현재 위치를 확인할 수 없어요.'); return false; } return true; };
  const handleStartGuide = () => { if (checkPos()) startWalk(referenceRoute?.totalDistance); };
  const handleStartFree = () => { if (checkPos()) startWalk(0); };
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

  const handleDiscard = () => { clearWalkPhotos(); setResult(null); reset(); router.push('/app'); };
  const handleConfirm = async (extras: { rating: number; comment: string; healthMemo: HealthMemo | null }) => {
    if (result) {
      try {
        const walkId = await saveWalkToDb({
          startedAt: new Date(result.startedAt).toISOString(),
          distanceMeters: Math.round(result.distance),
          durationSeconds: result.durationSec, coordinates: result.coordinates, petId,
        });
        const tempPhotos = getWalkPhotos();
        if (tempPhotos.length > 0) saveWalkPhotos(walkId, tempPhotos);
        if (extras.rating > 0) saveRouteReview(walkId, extras.rating, extras.comment);
        if (extras.healthMemo) setHealthMemo(walkId, extras.healthMemo);
        toast.success('산책 기록이 저장되었어요!');
      } catch { toast.error('기록 저장에 실패했어요.'); }
    }
    handleDiscard();
  };
  const isShort = result ? (result.distance < 10 || result.durationSec < 30) : false;
  const [photoCount, setPhotoCount] = useState(0);
  useEffect(() => { if (result) setPhotoCount(getWalkPhotos().length); }, [result]);

  return (
    <div className="relative h-full overflow-hidden">
      <KakaoMap center={center} currentPosition={position} heading={isWalking ? heading : null} followPosition={isWalking && following && !isPaused} level={3} className="h-full w-full" onMapReady={setMapInstance} />

      {mapInstance && referenceRoute && (<>
        <RoutePolyline map={mapInstance} path={referenceRoute.path} color="#2D8A42" opacity={0.25} weight={4} fitBounds={!isWalking} />
        <RouteDirectionMarkers map={mapInstance} path={referenceRoute.path} />
      </>)}
      {mapInstance && coordinates.length >= 2 && (
        <RoutePolyline map={mapInstance} path={coordinates} color="#2D8A42" opacity={0.9} weight={5} fitBounds={false} />
      )}
      <WalkTagManager map={mapInstance} position={position} isOpen={showTags} onClose={() => setShowTags(false)} />
      <NightWarning /><WeatherWarning />
      {!isWalking && (gpsLoading || gpsError) && (
        <div className="absolute left-5 top-3 z-30 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className={`text-[13px] ${gpsError ? 'text-mw-danger' : 'text-mw-gray-500'}`}>
            {gpsLoading ? '현재 위치를 찾고 있어요...' : gpsError}
          </p>
        </div>
      )}
      {isWalking && <WalkStats elapsed={elapsed} distance={distance} targetDistance={targetDistance} petName={petName} pace={elapsed > 0 ? Math.round(distance / elapsed * 60) : 0} />}
      {isWalking && position && coordinates.length > 0 && (
        <ReturnGuide startPosition={coordinates[0]} currentPosition={position} />
      )}
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
        <WalkStartPanel route={referenceRoute} positionReady={!!position} onStartGuide={handleStartGuide} onStartFree={handleStartFree} />
      )}
      {result && isShort && (
        <ShortWalkPrompt distance={result.distance} durationSec={result.durationSec} onSave={() => handleConfirm({ rating: 0, comment: '', healthMemo: null })} onDiscard={handleDiscard} />
      )}
      {result && !isShort && (
        <WalkCompleteModal distance={result.distance} durationSec={result.durationSec} coordinates={result.coordinates} petName={petName} photoCount={photoCount} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
