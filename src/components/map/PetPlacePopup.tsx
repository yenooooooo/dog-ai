'use client';

import { MapPin, Navigation, Dog, ExternalLink } from 'lucide-react';
import type { Coordinate } from '@/types/route';

interface PetPlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  petFriendly: string;
}

interface PetPlacePopupProps {
  place: PetPlaceInfo;
  onSetOrigin: (coord: Coordinate, name: string) => void;
  onClose: () => void;
}

const PET_LABEL: Record<string, { text: string; cls: string }> = {
  yes: { text: '🐾 동반 가능', cls: 'bg-mw-green-50 text-mw-green-600' },
  maybe: { text: '🐾 동반 가능성', cls: 'bg-mw-amber-400/10 text-mw-amber-500' },
  unknown: { text: '확인 필요', cls: 'bg-mw-gray-100 text-mw-gray-500' },
};

export default function PetPlacePopup({ place, onSetOrigin, onClose }: PetPlacePopupProps) {
  const pet = PET_LABEL[place.petFriendly] ?? PET_LABEL.unknown;
  const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div className="absolute bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="rounded-mw-lg bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold text-mw-gray-900">{place.name}</p>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${pet.cls}`}>{pet.text}</span>
            </div>
            <p className="mt-1 text-[12px] text-mw-gray-400">{place.category}</p>
            <div className="mt-1 flex items-center gap-1 text-[12px] text-mw-gray-500">
              <MapPin size={11} />
              <span>{place.address}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[18px] text-mw-gray-400">✕</button>
        </div>

        <div className="mt-3 flex gap-2">
          <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-mw bg-mw-amber-400/10 py-2.5 text-[12px] font-semibold text-mw-amber-500 active:scale-[0.97]">
            <ExternalLink size={13} /> 길찾기
          </a>
          <button onClick={() => { onSetOrigin({ lat: place.lat, lng: place.lng }, place.name); onClose(); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-mw bg-mw-green-500 py-2.5 text-[12px] font-semibold text-white active:scale-[0.97]">
            <Navigation size={13} /> 출발 위치로
          </button>
        </div>
      </div>
    </div>
  );
}

export type { PetPlaceInfo };
