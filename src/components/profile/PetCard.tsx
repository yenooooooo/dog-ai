'use client';

import Link from 'next/link';
import { ChevronRight, Dog } from 'lucide-react';

import type { StoredPet } from '@/lib/profile-storage';

const SIZE_LABELS: Record<string, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
};

function formatAge(months: number | null): string {
  if (!months) return '';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) return `${y}살 ${m}개월`;
  if (y > 0) return `${y}살`;
  return `${m}개월`;
}

export default function PetCard({ pet }: { pet: StoredPet }) {
  const details = [
    pet.breed,
    pet.size ? SIZE_LABELS[pet.size] : null,
    formatAge(pet.ageMonths),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/app/profile/pet/${pet.id}/edit`}
      className="flex items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4 transition-colors active:bg-mw-gray-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mw-green-50">
        <Dog size={20} className="text-mw-green-500" />
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-semibold text-mw-gray-900">
          {pet.name}
        </p>
        {details && (
          <p className="mt-0.5 text-[12px] text-mw-gray-500">{details}</p>
        )}
      </div>
      <ChevronRight size={18} className="text-mw-gray-300" />
    </Link>
  );
}
