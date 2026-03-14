'use client';

import { useState, useEffect } from 'react';
import { MapPin, Route, Footprints } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useRouteStore } from '@/stores/routeStore';
import PetSelector from '@/components/walk/PetSelector';
import type { GeneratedRoute } from '@/types/route';

interface Pet { id: string; name: string; size: string | null }

interface WalkStartPanelProps {
  route: GeneratedRoute | null;
  positionReady: boolean;
  onStartGuide: () => void;
  onStartFree: () => void;
}

/** 산책 전 패널 — 가이드/자유 산책 선택 + 반려견 선택 */
export default function WalkStartPanel({
  route, positionReady, onStartGuide, onStartFree,
}: WalkStartPanelProps) {
  const { selectedPetId, setSelectedPet } = useRouteStore();
  const [pets, setPets] = useState<Pet[]>([]);

  // routeStore에 반려견이 없으면 Supabase에서 로드
  useEffect(() => {
    if (selectedPetId) return;
    const loadPets = async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from('mw_pets').select('id, name, size').eq('user_id', user.id);
      if (data && data.length > 0) {
        setPets(data as Pet[]);
        setSelectedPet(data[0].id, data[0].name);
      }
    };
    loadPets();
  }, [selectedPetId, setSelectedPet]);

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet.id, pet.name);
  };

  const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
  const formatMin = (sec: number) => `${Math.round(sec / 60)}분`;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-30 space-y-3">
      {/* 반려견 선택 */}
      {pets.length > 0 && !selectedPetId && (
        <div className="rounded-mw bg-white/95 p-3 shadow-sm backdrop-blur">
          <PetSelector pets={pets} selectedId={selectedPetId} onSelect={handleSelectPet} />
        </div>
      )}

      {/* 가이드 산책 (루트가 있을 때만) */}
      {route && (
        <button
          onClick={onStartGuide}
          disabled={!positionReady}
          className="flex w-full items-center gap-3 rounded-mw bg-mw-green-500 px-4 py-4 shadow-sm active:scale-[0.97] disabled:opacity-40"
        >
          <MapPin size={20} className="shrink-0 text-white" />
          <div className="flex-1 text-left">
            <span className="block text-[15px] font-bold text-white">가이드 산책 시작</span>
            <span className="text-[12px] text-white/80">
              {route.name} · {formatDist(route.totalDistance)} · {formatMin(route.estimatedDuration)}
            </span>
          </div>
          <Route size={16} className="shrink-0 text-white/70" />
        </button>
      )}

      {/* 자유 산책 (항상) */}
      <button
        onClick={onStartFree}
        disabled={!positionReady}
        className="flex w-full items-center gap-3 rounded-mw border-2 border-mw-green-500 bg-white px-4 py-4 shadow-sm active:scale-[0.97] disabled:opacity-40"
      >
        <Footprints size={20} className="shrink-0 text-mw-green-500" />
        <div className="flex-1 text-left">
          <span className="block text-[15px] font-bold text-mw-gray-900">자유 산책 시작</span>
          <span className="text-[12px] text-mw-gray-500">루트 없이 자유롭게</span>
        </div>
      </button>
    </div>
  );
}
