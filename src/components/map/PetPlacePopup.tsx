'use client';

import { MapPin, Navigation, ExternalLink, Phone } from 'lucide-react';
import type { Coordinate } from '@/types/route';

interface PetPlaceInfo {
  name: string;
  address: string;
  phone: string;
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
  verified: { text: '✅ 동반 확인됨', cls: 'bg-mw-green-50 text-mw-green-600' },
  yes: { text: '🐾 동반 추정', cls: 'bg-mw-green-50 text-mw-green-600' },
  maybe: { text: '🔍 확인 권장', cls: 'bg-mw-amber-400/10 text-mw-amber-500' },
  unknown: { text: '❓ 전화 확인', cls: 'bg-mw-gray-100 text-mw-gray-500' },
  banned: { text: '🚫 출입 불가', cls: 'bg-red-50 text-mw-danger' },
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
            {place.phone && (
              <a href={`tel:${place.phone}`} className="mt-1 flex items-center gap-1 text-[12px] text-mw-info">
                <Phone size={11} />
                <span>{place.phone}</span>
              </a>
            )}
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
        <p className="mt-2 text-center text-[10px] text-mw-gray-300">방문 전 매장에 전화로 동반 가능 여부를 확인해주세요</p>
      </div>
    </div>
  );
}

export type { PetPlaceInfo };
