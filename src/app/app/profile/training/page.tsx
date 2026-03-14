'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import TrainingGuides from '@/components/training/TrainingGuides';
import TrainingChat from '@/components/training/TrainingChat';

interface PetInfo {
  name: string;
  breed: string;
  ageMonths: number | null;
  size: string | null;
}

export default function TrainingPage() {
  const router = useRouter();
  const [pet, setPet] = useState<PetInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: mu } = await sb.from('mw_users').select('id').eq('auth_id', user.id).single();
      if (!mu) return;
      const { data } = await sb.from('mw_pets').select('name, breed, age_months, size').eq('user_id', mu.id).limit(1);
      if (data?.[0]) {
        setPet({ name: data[0].name, breed: data[0].breed ?? '', ageMonths: data[0].age_months, size: data[0].size });
      }
    };
    load();
  }, []);

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap size={20} className="text-mw-green-500" />
          <h1 className="text-[17px] font-bold text-mw-gray-900">훈련 가이드</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {pet && (
          <div className="mb-3 rounded-mw-sm bg-mw-green-50 px-3 py-2">
            <p className="text-[12px] text-mw-green-600">
              🐾 {pet.name} 맞춤 상담 가능
            </p>
          </div>
        )}

        <h2 className="mb-2 text-[15px] font-bold text-mw-gray-900">훈련 가이드</h2>
        <TrainingGuides />

        <div className="mt-5">
          <TrainingChat petInfo={pet} />
        </div>
      </div>
    </div>
  );
}
