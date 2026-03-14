'use client';

import { useState } from 'react';
import { Search, MapPin, X, Dog } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { checkCrowdsourcedPetStatus, combinePetStatus } from '@/lib/pet-friendly-check';
import type { Coordinate } from '@/types/route';

interface AddressSearchProps {
  onSelect: (coord: Coordinate, name: string) => void;
}

interface Place {
  name: string;
  address: string;
  lat: string;
  lng: string;
  category: string;
  petFriendly: 'yes' | 'maybe' | 'unknown';
}

const PET_LABEL = {
  verified: { text: '동반 확인됨', cls: 'bg-mw-green-50 text-mw-green-600' },
  yes: { text: '동반 추정', cls: 'bg-mw-green-50 text-mw-green-600' },
  maybe: { text: '확인 권장', cls: 'bg-mw-amber-400/10 text-mw-amber-500' },
  unknown: { text: '전화 확인', cls: 'bg-mw-gray-100 text-mw-gray-500' },
  banned: { text: '출입 불가', cls: 'bg-red-50 text-mw-danger' },
};

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const enhanced = (data.places ?? []).map((p: Place) => {
        const crowd = checkCrowdsourcedPetStatus(Number(p.lat), Number(p.lng));
        return { ...p, petFriendly: combinePetStatus(p.petFriendly, crowd) };
      });
      setResults(enhanced);
      if (data.places.length === 0) toast.info('검색 결과가 없어요.');
    } catch { toast.error('장소 검색에 실패했어요.'); }
    finally { setLoading(false); }
  };

  const handleSelect = (r: Place) => {
    onSelect({ lat: Number(r.lat), lng: Number(r.lng) }, r.name);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 flex w-full items-center gap-2 rounded-mw-sm border border-dashed border-mw-gray-300 px-3 py-2.5 text-[13px] text-mw-gray-400 active:bg-mw-gray-50">
        <Search size={14} />
        주소·장소 검색 (반려견 동반 여부 확인)
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-mw-lg border border-mw-green-500 bg-white p-3">
      <div className="flex items-center gap-2">
        <Search size={16} className="shrink-0 text-mw-green-500" />
        <input
          type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="카페, 공원, 음식점, 산..."
          autoFocus
          className="flex-1 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:outline-none"
        />
        <button onClick={() => { setOpen(false); setResults([]); }} className="p-1">
          <X size={16} className="text-mw-gray-400" />
        </button>
      </div>
      <button onClick={handleSearch} disabled={loading || !query.trim()} className="mt-2 w-full rounded-mw-sm bg-mw-green-500 py-2 text-[13px] font-semibold text-white disabled:opacity-40">
        {loading ? '검색 중...' : '검색'}
      </button>
      {results.length > 0 && (
        <div className="mt-2 flex max-h-[200px] flex-col gap-1 overflow-y-auto">
          {results.map((r, i) => {
            const pet = PET_LABEL[r.petFriendly];
            return (
              <button key={i} onClick={() => handleSelect(r)} className="flex items-start gap-2 rounded-mw-sm px-2 py-2.5 text-left active:bg-mw-gray-50">
                <MapPin size={14} className="mt-0.5 shrink-0 text-mw-danger" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-mw-gray-900">{r.name}</p>
                    <span className={cn('flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium', pet.cls)}>
                      <Dog size={9} /> {pet.text}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-mw-gray-400">{r.address}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
