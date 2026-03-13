const STEPS = [
  {
    num: '1',
    title: '시간을 선택하세요',
    desc: '15분, 30분, 1시간 — 원하는 산책 시간을 고르면 맞춤 루트를 추천해 드려요.',
  },
  {
    num: '2',
    title: '루트를 고르세요',
    desc: '3개의 다양한 방향 루트 중 마음에 드는 길을 선택하세요.',
  },
  {
    num: '3',
    title: '산책을 즐기세요',
    desc: 'GPS로 실시간 경로가 기록되고, 태그로 유용한 정보를 공유할 수 있어요.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-mw-gray-50 px-5 py-16">
      <h2 className="text-center text-[20px] font-bold text-mw-gray-900">
        이렇게 사용해요
      </h2>

      <div className="mx-auto mt-10 max-w-sm">
        {STEPS.map((step, idx) => (
          <div key={step.num} className="relative flex gap-4 pb-8">
            {/* 세로 라인 */}
            {idx < STEPS.length - 1 && (
              <div className="absolute left-[17px] top-[38px] h-[calc(100%-38px)] w-0.5 bg-mw-green-100" />
            )}

            {/* 번호 원 */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mw-green-500 text-[14px] font-bold text-white">
              {step.num}
            </div>

            <div className="pt-1">
              <h3 className="text-[16px] font-bold text-mw-gray-900">
                {step.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mw-gray-500">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
