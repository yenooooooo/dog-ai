'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

async function ensureMwUser(supabase: SupabaseClient, authId: string, email: string) {
  await supabase.from('mw_users').upsert(
    { auth_id: authId, nickname: email.split('@')[0] },
    { onConflict: 'auth_id' }
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // 회원가입 성공 → mw_users 자동 생성
        if (signUpData.user) {
          await ensureMwUser(supabase, signUpData.user.id, email);
        }
        toast.success('가입 완료!');
        window.location.href = '/app';
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // 로그인 성공 → mw_users 없으면 생성
        if (signInData.user) {
          await ensureMwUser(supabase, signInData.user.id, email);
        }
        window.location.href = '/app';
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했어요.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mw-gray-50 px-5">
      <Link href="/" className="text-[28px] font-extrabold text-mw-green-500">
        멍산책
      </Link>
      <p className="mt-2 text-[14px] text-mw-gray-500">
        매일 새로운 산책 루트를 만들어 드려요
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-sm">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-mw border border-mw-gray-200 px-4 py-3.5 text-[15px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:border-mw-green-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-mw border border-mw-gray-200 px-4 py-3.5 text-[15px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:border-mw-green-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-3 w-full rounded-mw bg-mw-green-500 py-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-[13px] text-mw-gray-500"
      >
        {isSignUp ? '이미 계정이 있어요 →' : '계정이 없어요 → 회원가입'}
      </button>

      <p className="mt-8 text-center text-[12px] text-mw-gray-400">
        로그인하면 이용약관 및 개인정보처리방침에
        <br />
        동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
