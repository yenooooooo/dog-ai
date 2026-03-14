'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

interface MwUser {
  id: string;
  authId: string;
  nickname: string;
  neighborhood: string | null;
}

/**
 * 현재 로그인된 유저의 mw_users 레코드를 반환한다.
 * 모든 Supabase 테이블이 mw_users.id를 FK로 사용하므로 이 훅이 필요하다.
 */
export function useMwUser() {
  const [mwUser, setMwUser] = useState<MwUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('mw_users')
        .select('id, auth_id, nickname, neighborhood')
        .eq('auth_id', user.id)
        .single();

      if (data) {
        setMwUser({
          id: data.id,
          authId: data.auth_id,
          nickname: data.nickname,
          neighborhood: data.neighborhood,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return { mwUser, loading };
}
