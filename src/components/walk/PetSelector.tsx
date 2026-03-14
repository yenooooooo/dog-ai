'use client';

import { Dog } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Pet {
  id: string;
  name: string;
  size: string | null;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedId: string | null;
  onSelect: (pet: Pet) => void;
}

/** 산책 시작 전 반려견 선택 */
export default function PetSelector({ pets, selectedId, onSelect }: PetSelectorProps) {
  if (pets.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[13px] font-medium text-mw-gray-600">누구와 산책할까요?</p>
      <div className="mt-2 flex gap-2">
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => onSelect(pet)}
            className={cn(
              'flex items-center gap-1.5 rounded-mw-sm px-3 py-2 text-[13px] font-medium transition-all',
              selectedId === pet.id
                ? 'bg-mw-green-500 text-white'
                : 'bg-mw-gray-50 text-mw-gray-700 active:bg-mw-gray-100'
            )}
          >
            <Dog size={14} />
            {pet.name}
          </button>
        ))}
      </div>
    </div>
  );
}
