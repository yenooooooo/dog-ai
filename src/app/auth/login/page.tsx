'use client';

import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redirectTo = encodeURIComponent(
      `${window.location.origin}/auth/callback`
    );
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=kakao&redirect_to=${redirectTo}&scopes=profile_nickname%20profile_image`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mw-gray-50 px-5">
      <Link href="/" className="text-[28px] font-extrabold text-mw-green-500">
        멍산책
      </Link>
      <p className="mt-2 text-[14px] text-mw-gray-500">
        매일 새로운 산책 루트를 만들어 드려요
      </p>

      <div className="mt-10 w-full max-w-sm">
        <button
          onClick={handleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-mw bg-[#FEE500] py-4 text-[15px] font-semibold text-[#191919] transition-transform active:scale-[0.97]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              d="M9 1C4.58 1 1 3.8 1 7.24c0 2.22 1.48 4.17 3.7 5.27l-.94 3.48c-.08.3.26.54.52.36l4.16-2.74c.18.01.37.02.56.02 4.42 0 8-2.8 8-6.24S13.42 1 9 1z"
              fill="#191919"
            />
          </svg>
          카카오로 시작하기
        </button>
      </div>

      <p className="mt-8 text-center text-[12px] text-mw-gray-400">
        로그인하면 이용약관 및 개인정보처리방침에
        <br />
        동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
