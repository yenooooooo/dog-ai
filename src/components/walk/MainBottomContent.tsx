'use client';

import { useRouter } from 'next/navigation';

import { useRouteStore } from '@/stores/routeStore';
import TimeSelector from '@/components/walk/TimeSelector';
import RouteCard from '@/components/walk/RouteCard';
import PetSelector from '@/components/walk/PetSelector';
import FavoriteRoutes from '@/components/walk/FavoriteRoutes';
import AddressSearch from '@/components/walk/AddressSearch';
import type { Coordinate, GeneratedRoute } from '@/types/route';

interface PetInfo { id: string; name: string; size: string | null }

interface MainBottomContentProps {
  duration: number;
  onDurationChange: (v: number) => void;
  pets: PetInfo[];
  selectedPet: PetInfo | null;
  onSelectPet: (p: PetInfo) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  routeError: string | null;
  onGenerate: () => void;
  onReset: () => void;
  hasCustomOrigin: boolean;
  onFavoriteSelect: (route: GeneratedRoute) => void;
  onAddressSelect: (coord: Coordinate, name: string) => void;
}

export default function MainBottomContent({
  duration, onDurationChange, pets, selectedPet, onSelectPet,
  isGenerating, canGenerate, routeError, onGenerate, onReset,
  hasCustomOrigin, onFavoriteSelect, onAddressSelect,
}: MainBottomContentProps) {
  const router = useRouter();
  const { routes, selectedIndex, selectRoute, progressMessage } = useRouteStore();

  if (routes.length > 0) {
    return (
      <>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-mw-gray-900">추천 루트</h2>
          <button onClick={onReset} className="text-[13px] font-medium text-mw-gray-500">다시 선택</button>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {routes.map((route, idx) => (
            <div key={route.id} className="w-[calc(100%-28px)] shrink-0 snap-center">
              <RouteCard route={route} isSelected={idx === selectedIndex} onSelect={() => selectRoute(idx)} onStartWalk={() => router.push('/app/walk')} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-bold text-mw-gray-900">산책 시간</h2>
      <p className="mt-1 text-[13px] text-mw-gray-500">
        {hasCustomOrigin ? '출발 위치를 지정했어요' : '지도를 탭하면 출발 위치를 변경할 수 있어요'}
      </p>
      <AddressSearch onSelect={onAddressSelect} />
      <PetSelector pets={pets} selectedId={selectedPet?.id ?? null} onSelect={onSelectPet} />
      <div className="mt-3"><TimeSelector value={duration} onChange={onDurationChange} /></div>
      <button onClick={onGenerate} disabled={isGenerating || !canGenerate} className="mt-3 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40">
        {isGenerating ? (progressMessage || '보행자 경로를 찾고 있어요...') : '루트 만들기'}
      </button>
      {routeError && (
        <div className="mt-2 text-center">
          <p className="text-[13px] text-mw-danger">{routeError}</p>
          <button onClick={onReset} className="mt-1 text-[13px] font-medium text-mw-green-500">다시 시도</button>
        </div>
      )}
      <FavoriteRoutes onSelectRoute={onFavoriteSelect} />
    </>
  );
}
