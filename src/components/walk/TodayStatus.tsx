'use client';

import { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

/** 오늘의 산책 상태 배지 */
export default function TodayStatus() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: mu } = await sb.from('mw_users').select('id').eq('auth_id', user.id).single();
      if (!mu) return;

      const today = new Date().toISOString().slice(0, 10);
      const { count: c } = await sb
        .from('mw_walks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', mu.id)
        .gte('started_at', `${today}T00:00:00`)
        .eq('status', 'completed');

      setCount(c ?? 0);
    };
    load();
  }, []);

  if (count === null) return null;

  return (
    <div className="absolute right-4 top-3 z-30 flex items-center gap-1.5 rounded-mw bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
      <Footprints size={14} className={count > 0 ? 'text-mw-green-500' : 'text-mw-gray-400'} />
      <span className="text-[12px] font-medium text-mw-gray-700">
        {count > 0 ? `오늘 ${count}회 완료` : '오늘 아직 산책 전'}
      </span>
    </div>
  );
}
