'use client';

import { useState, useCallback } from 'react';
import { Dog, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import PetPlacePopup, { type PetPlaceInfo } from '@/components/map/PetPlacePopup';
import type { Coordinate } from '@/types/route';

interface PetFriendlyButtonProps {
  map: kakao.maps.Map | null;
  position: { lat: number; lng: number } | null;
  onSetOrigin: (coord: Coordinate, name: string) => void;
}

const CATEGORIES = [
  { label: '☕ 카페', query: '애견동반 카페' },
  { label: '🍽️ 음식점', query: '애견동반 음식점' },
  { label: '🌳 공원', query: '반려견 공원' },
  { label: '⛰️ 산', query: '반려견 산책 산' },
  { label: '🏨 숙소', query: '애견동반 펜션' },
  { label: '🏥 병원', query: '동물병원' },
];

export default function PetFriendlyButton({ map, position, onSetOrigin }: PetFriendlyButtonProps) {
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState<PetPlaceInfo[]>([]);
  const [overlays, setOverlays] = useState<kakao.maps.CustomOverlay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PetPlaceInfo | null>(null);

  const clearOverlays = useCallback(() => {
    overlays.forEach((o) => o.setMap(null));
    setOverlays([]);
    setPlaces([]);
    setSelected(null);
  }, [overlays]);

  const handleSearch = async (query: string) => {
    if (!map || !position) { toast.error('위치를 확인할 수 없어요.'); return; }
    setLoading(true);
    clearOverlays();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lat=${position.lat}&lng=${position.lng}&size=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 카테고리 검색은 이미 애견동반 키워드 → 무조건 동반 가능 처리
      const items: PetPlaceInfo[] = (data.places ?? []).map((p: Record<string, string>) => ({
        name: p.name, address: p.address, lat: Number(p.lat), lng: Number(p.lng),
        category: p.category ?? '', petFriendly: 'yes',
      }));
      setPlaces(items);

      // 지도에 마커 표시
      const newOvs = items.map((p) => {
        const ov = new window.kakao.maps.CustomOverlay({
          content: `<div style="background:#2D8A42;color:white;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;">🐾 ${p.name}</div>`,
          position: new window.kakao.maps.LatLng(p.lat, p.lng), yAnchor: 1.3,
        });
        ov.setMap(map);
        return ov;
      });
      setOverlays(newOvs);

      if (items.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        items.forEach((p) => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)));
        bounds.extend(new window.kakao.maps.LatLng(position.lat, position.lng));
        map.setBounds(bounds);
      } else { toast.info('주변에 결과가 없어요.'); }
    } catch { toast.error('검색에 실패했어요.'); }
    finally { setLoading(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="absolute left-4 top-12 z-30 flex items-center gap-1.5 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur active:scale-[0.97]">
        <Dog size={16} className="text-mw-green-500" />
        <span className="text-[12px] font-semibold text-mw-gray-800">반려견 동반</span>
      </button>
    );
  }

  return (
    <>
      <div className="absolute left-4 right-4 top-12 z-30 max-h-[50vh] overflow-y-auto rounded-mw-lg bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-mw-gray-900">🐾 반려견 동반 장소</p>
          <button onClick={() => { setOpen(false); clearOverlays(); }} className="p-1"><X size={16} className="text-mw-gray-400" /></button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.label} onClick={() => handleSearch(c.query)} disabled={loading} className="rounded-mw-sm bg-mw-green-50 py-2 text-[11px] font-medium text-mw-green-600 active:bg-mw-green-100 disabled:opacity-50">
              {c.label}
            </button>
          ))}
        </div>

        {/* 결과 리스트 — 탭하면 상세 팝업 */}
        {places.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-[11px] text-mw-gray-400">{places.length}곳 발견</p>
            {places.map((p, i) => (
              <button key={i} onClick={() => { setSelected(p); map?.panTo(new window.kakao.maps.LatLng(p.lat, p.lng)); }} className="flex items-center gap-2 rounded-mw-sm px-2 py-2 text-left active:bg-mw-gray-50">
                <MapPin size={13} className="shrink-0 text-mw-green-500" />
                <div className="flex-1 truncate">
                  <p className="truncate text-[12px] font-medium text-mw-gray-900">{p.name}</p>
                  <p className="truncate text-[10px] text-mw-gray-400">{p.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <PetPlacePopup place={selected} onSetOrigin={onSetOrigin} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
