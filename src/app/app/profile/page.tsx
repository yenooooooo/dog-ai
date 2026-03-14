'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, User, GraduationCap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import UserForm from '@/components/profile/UserForm';
import PetCard from '@/components/profile/PetCard';
import UsageGuide from '@/components/layout/UsageGuide';
import type { StoredUser, StoredPet } from '@/lib/profile-storage';

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [pets, setPets] = useState<StoredPet[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      let { data: mwUser } = await supabase
        .from('mw_users')
        .select('id, nickname, neighborhood')
        .eq('auth_id', authUser.id)
        .single();

      if (!mwUser) {
        await supabase.from('mw_users').insert({ auth_id: authUser.id, nickname: authUser.email?.split('@')[0] ?? '견주' });
        ({ data: mwUser } = await supabase.from('mw_users').select('id, nickname, neighborhood').eq('auth_id', authUser.id).single());
      }

      if (mwUser) {
        setUser({ nickname: mwUser.nickname, neighborhood: mwUser.neighborhood });

        const { data: petData } = await supabase
          .from('mw_pets')
          .select('id, name, breed, age_months, size')
          .eq('user_id', mwUser.id);

        setPets(
          (petData ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            breed: p.breed ?? '',
            ageMonths: p.age_months,
            size: p.size,
          }))
        );
      }
    } catch {
      toast.error('프로필을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveUser = async (data: StoredUser) => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('mw_users')
      .update({ nickname: data.nickname, neighborhood: data.neighborhood || null })
      .eq('auth_id', authUser.id);

    if (error) { toast.error('저장에 실패했어요.'); return; }
    setUser(data);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-mw-gray-50">
        <p className="text-[14px] text-mw-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center justify-between bg-white px-5 pb-3 pt-4">
        <h1 className="text-[20px] font-bold text-mw-gray-900">내 프로필</h1>
        <button onClick={signOut} className="flex items-center gap-1 text-[13px] text-mw-gray-500">
          <LogOut size={14} />
          로그아웃
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-5">
          {editing || !user ? (
            <UserForm
              initialData={user ?? undefined}
              onSave={handleSaveUser}
              onCancel={user ? () => setEditing(false) : undefined}
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mw-green-50">
                <User size={24} className="text-mw-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-mw-gray-900">{user.nickname}</p>
                {user.neighborhood && <p className="text-[13px] text-mw-gray-500">{user.neighborhood}</p>}
              </div>
              <button onClick={() => setEditing(true)} className="text-[13px] font-medium text-mw-green-500">수정</button>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-mw-gray-900">반려견</h2>
            <button onClick={() => router.push('/app/profile/pet/new')} className="flex items-center gap-1 text-[13px] font-medium text-mw-green-500">
              <Plus size={16} /> 추가
            </button>
          </div>
          {pets.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-mw-gray-400">등록된 반려견이 없어요</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pets.map((pet) => (<PetCard key={pet.id} pet={pet} />))}
            </div>
          )}
        </div>

        <button onClick={() => router.push('/app/profile/training')} className="mt-5 flex w-full items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white px-4 py-4">
          <GraduationCap size={22} className="text-mw-green-500" />
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold text-mw-gray-900">훈련 가이드</p>
            <p className="text-[12px] text-mw-gray-400">AI 맞춤 훈련법 + 단계별 가이드</p>
          </div>
          <ChevronRight size={16} className="text-mw-gray-400" />
        </button>

        <UsageGuide />
      </div>
    </div>
  );
}
