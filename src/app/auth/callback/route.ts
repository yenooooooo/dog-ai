import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback 에러:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
  }

  // 로그인 성공 → mw_users 레코드 자동 생성 (없으면)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: existingUser } = await supabase
      .from('mw_users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!existingUser) {
      const nickname =
        user.user_metadata?.full_name ??
        user.email?.split('@')[0] ??
        '견주';

      await supabase.from('mw_users').insert({
        auth_id: user.id,
        nickname,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
