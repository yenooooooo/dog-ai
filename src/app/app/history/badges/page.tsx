'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import LevelCard from '@/components/history/LevelCard';
import BadgeGrid from '@/components/history/BadgeGrid';

interface WalkRecord {
  startedAt: string;
  distanceMeters: number;
}

export default function BadgesPage() {
  const router = useRouter();
  const [walks, setWalks] = useState<WalkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: mu } = await supabase
        .from('mw_users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      if (!mu) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('mw_walks')
        .select('started_at, distance_meters')
        .eq('user_id', mu.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      setWalks(
        (data ?? []).map((w) => ({
          startedAt: w.started_at,
          distanceMeters: w.distance_meters,
        }))
      );
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-mw-gray-50">
        <p className="text-[14px] text-mw-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full active:scale-[0.97] active:bg-mw-gray-100"
        >
          <ArrowLeft size={20} className="text-mw-gray-700" />
        </button>
        <h1 className="text-[18px] font-bold text-mw-gray-900">
          뱃지 컬렉션
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        <LevelCard walks={walks} />
        <div className="mt-4">
          <p className="mb-3 text-[14px] font-semibold text-mw-gray-800">
            뱃지 목록
          </p>
          <BadgeGrid walks={walks} />
        </div>
      </div>
    </div>
  );
}
