'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import PetForm from '@/components/profile/PetForm';

export default function NewPetPage() {
  const router = useRouter();

  const handleSave = async (data: { name: string; breed: string; ageMonths: number | null; size: string | null }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: mwUser } = await supabase
      .from('mw_users').select('id').eq('auth_id', user.id).single();
    if (!mwUser) return;

    const { error } = await supabase.from('mw_pets').insert({
      user_id: mwUser.id,
      name: data.name,
      breed: data.breed || null,
      age_months: data.ageMonths,
      size: data.size,
    });

    if (error) { toast.error('등록에 실패했어요.'); return; }
    toast.success('반려견이 등록되었어요!');
    router.push('/app/profile');
  };

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-mw-gray-900">반려견 등록</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-5">
          <PetForm onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
