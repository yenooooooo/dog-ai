'use client';

import { useState } from 'react';
import { Dog, MapPin, Footprints, Tag, Share2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const GUIDES = [
  { icon: Dog, title: '반려견 등록', steps: ['프로필 탭에서 "추가" 버튼을 눌러요', '이름, 견종, 크기를 입력하세요', '크기에 따라 산책 속도가 자동 조정돼요'] },
  { icon: MapPin, title: '출발 위치 설정', steps: ['지도 탭에서 지도를 탭하면 출발 위치가 설정돼요', '빨간 마커가 출발 위치예요', '"현위치" 버튼으로 GPS 위치로 돌아올 수 있어요'] },
  { icon: Footprints, title: '루트 생성 & 산책', steps: ['산책 시간을 선택하세요 (15분~3시간)', '반려견을 선택하면 크기에 맞는 거리가 계산돼요', '"루트 만들기"를 누르면 3개 코스가 생성돼요', '"이 루트로 산책" → "산책 시작"을 눌러요'] },
  { icon: Tag, title: '태그 남기기', steps: ['산책 중 "태그 남기기"를 누르세요', '그늘, 물, 위험, 쓰레기통 등 9가지 태그를 남길 수 있어요', '다른 사람의 태그를 보고 "도움됐어요" 투표도 가능해요'] },
  { icon: Share2, title: '기록 & 공유', steps: ['산책 완료 후 기록이 자동 저장돼요', '"공유 카드 만들기"로 예쁜 카드를 만들 수 있어요', '기록 탭에서 월간 통계를 확인하세요'] },
];

export default function UsageGuide() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen size={16} className="text-mw-green-500" />
        <h2 className="text-[17px] font-bold text-mw-gray-900">사용 방법</h2>
      </div>
      <div className="flex flex-col gap-2">
        {GUIDES.map((g, i) => {
          const Icon = g.icon;
          const isOpen = openIdx === i;
          return (
            <div key={i} className="rounded-mw-lg border border-mw-gray-100 bg-white">
              <button onClick={() => setOpenIdx(isOpen ? null : i)} className="flex w-full items-center gap-3 px-4 py-3">
                <Icon size={18} className="text-mw-green-500" />
                <span className="flex-1 text-left text-[14px] font-medium text-mw-gray-800">{g.title}</span>
                {isOpen ? <ChevronUp size={16} className="text-mw-gray-400" /> : <ChevronDown size={16} className="text-mw-gray-400" />}
              </button>
              {isOpen && (
                <div className="border-t border-mw-gray-50 px-4 pb-3 pt-2">
                  {g.steps.map((s, j) => (
                    <p key={j} className="mt-1 flex gap-2 text-[13px] text-mw-gray-600">
                      <span className="shrink-0 text-mw-green-500">{j + 1}.</span>
                      {s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
