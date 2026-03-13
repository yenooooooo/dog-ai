import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-mw-gray-50 px-5">
      <p className="rounded-full bg-mw-green-50 px-4 py-1.5 text-[13px] font-medium text-mw-green-500">
        반려견 산책 루트 추천 서비스
      </p>

      <h1 className="mt-5 text-center text-[28px] font-extrabold leading-tight text-mw-gray-900">
        오늘은 어디로
        <br />
        산책할까?
      </h1>
      <p className="mt-3 text-center text-[15px] leading-relaxed text-mw-gray-500">
        매일 새로운 산책 루트를 만들어 드려요
      </p>

      <Link
        href="/auth/login"
        className="mt-8 rounded-mw bg-mw-green-500 px-8 py-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
      >
        무료로 시작하기
      </Link>

      {/* 폰 목업 */}
      <div className="relative mx-auto mt-14 h-[340px] w-[180px] rounded-[28px] border-[5px] border-mw-gray-800 bg-mw-gray-800 p-1 shadow-xl">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-mw-green-50">
          <svg
            width="140"
            height="180"
            viewBox="0 0 140 180"
            fill="none"
          >
            {/* 순환 루트 일러스트 */}
            <path
              d="M70 30 C115 35, 125 80, 105 120 C90 150, 45 155, 35 120 C20 80, 30 35, 70 30Z"
              stroke="#2D8A42"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="70" cy="30" r="5" fill="#2D8A42" />
            <circle cx="105" cy="120" r="3.5" fill="#86EFAC" />
            <circle cx="35" cy="120" r="3.5" fill="#86EFAC" />
            {/* 현위치 표시 */}
            <circle cx="70" cy="30" r="9" fill="#2D8A42" opacity="0.15" />
          </svg>
        </div>
        {/* 노치 */}
        <div className="absolute left-1/2 top-1 h-[18px] w-[50px] -translate-x-1/2 rounded-b-xl bg-mw-gray-800" />
      </div>
    </section>
  );
}
