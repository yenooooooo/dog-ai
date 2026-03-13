const TESTIMONIALS = [
  {
    name: '뭉치 보호자',
    dog: '포메라니안',
    text: '매일 같은 코스만 걷다가 멍산책 덕분에 새로운 길을 발견했어요!',
  },
  {
    name: '코코맘',
    dog: '골든리트리버',
    text: '위험한 구간 태그 덕분에 안심하고 산책해요. 견주들끼리 서로 돕는 느낌이라 좋아요.',
  },
  {
    name: '초코 아빠',
    dog: '웰시코기',
    text: '산책 기록이 자동으로 쌓이니까 뿌듯하고, 공유 카드로 자랑하는 재미도 있어요.',
  },
];

export default function SocialProof() {
  return (
    <section className="bg-white px-5 py-16">
      {/* 카운터 */}
      <p className="text-center text-[13px] font-medium text-mw-gray-500">
        지금 이 순간에도
      </p>
      <p className="mt-1 text-center text-[24px] font-extrabold text-mw-green-500">
        1,234마리 강아지
      </p>
      <p className="text-center text-[15px] font-medium text-mw-gray-700">
        가 멍산책과 함께 걷고 있어요
      </p>

      {/* 후기 캐러셀 */}
      <div className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="w-[260px] shrink-0 snap-center rounded-mw-lg border border-mw-gray-100 bg-white p-5"
          >
            <p className="text-[14px] leading-relaxed text-mw-gray-700">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-mw-green-50" />
              <div>
                <p className="text-[13px] font-semibold text-mw-gray-900">
                  {t.name}
                </p>
                <p className="text-[11px] text-mw-gray-400">{t.dog}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
