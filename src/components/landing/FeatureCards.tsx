import { Route, Tag, Timer } from 'lucide-react';

const FEATURES = [
  {
    icon: <Route size={24} className="text-mw-green-500" />,
    title: 'AI가 만드는 순환 루트',
    desc: '시간만 선택하면 현위치 기반으로\n집에서 출발해 돌아오는 루트 3개를 추천해요',
  },
  {
    icon: <Tag size={24} className="text-mw-green-500" />,
    title: '견주들의 실시간 구간 정보',
    desc: '그늘, 물, 위험 구간 등\n다른 견주들이 남긴 태그로 안전하게 산책해요',
  },
  {
    icon: <Timer size={24} className="text-mw-green-500" />,
    title: '자동 기록되는 산책 일지',
    desc: 'GPS로 실시간 경로를 기록하고\n거리, 시간, 속도를 한눈에 확인해요',
  },
];

export default function FeatureCards() {
  return (
    <section className="bg-white px-5 py-16">
      <h2 className="text-center text-[20px] font-bold text-mw-gray-900">
        왜 멍산책인가요?
      </h2>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="w-[280px] shrink-0 snap-center rounded-mw-lg border border-mw-gray-100 bg-white p-5 md:w-auto"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-mw-sm bg-mw-green-50">
              {f.icon}
            </div>
            <h3 className="mt-4 text-[16px] font-bold text-mw-gray-900">
              {f.title}
            </h3>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-mw-gray-500">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
