'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import PetForm from '@/components/profile/PetForm';
import type { StoredPet } from '@/lib/profile-storage';

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<StoredPet | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('mw_pets').select('id, name, breed, age_months, size')
        .eq('id', id).single();
      if (!data) { router.replace('/app/profile'); return; }
      setPet({ id: data.id, name: data.name, breed: data.breed ?? '', ageMonths: data.age_months, size: data.size });
    };
    load();
  }, [id, router]);

  const handleSave = async (data: { name: string; breed: string; ageMonths: number | null; size: string | null }) => {
    const supabase = createClient();
    const { error } = await supabase.from('mw_pets')
      .update({ name: data.name, breed: data.breed || null, age_months: data.ageMonths, size: data.size })
      .eq('id', id);
    if (error) { toast.error('수정에 실패했어요.'); return; }
    toast.success('반려견 정보가 수정되었어요!');
    router.push('/app/profile');
  };

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from('mw_pets').delete().eq('id', id);
    toast.success('반려견이 삭제되었어요.');
    router.push('/app/profile');
  };

  if (!pet) return null;

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-mw-gray-900">{pet.name} 수정</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-5">
          <PetForm initialData={pet} onSave={handleSave} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
