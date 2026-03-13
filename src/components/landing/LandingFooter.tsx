import Link from 'next/link';

export default function LandingFooter() {
  return (
    <section className="bg-mw-gray-50">
      {/* 마지막 CTA */}
      <div className="px-5 py-16 text-center">
        <h2 className="text-[20px] font-bold text-mw-gray-900">
          지금 바로 새로운
          <br />
          산책을 시작하세요
        </h2>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-mw bg-mw-green-500 px-8 py-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
        >
          무료로 시작하기
        </Link>
      </div>

      {/* 푸터 */}
      <footer className="border-t border-mw-gray-100 px-5 py-6">
        <p className="text-[15px] font-bold text-mw-green-500">멍산책</p>
        <p className="mt-1 text-[12px] text-mw-gray-400">
          매일 새로운 산책 루트를 만들어 드려요
        </p>
        <div className="mt-4 flex gap-4 text-[12px] text-mw-gray-400">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>문의하기</span>
        </div>
        <p className="mt-4 text-[11px] text-mw-gray-300">
          &copy; 2026 멍산책 (MungWalk). All rights reserved.
        </p>
      </footer>
    </section>
  );
}
