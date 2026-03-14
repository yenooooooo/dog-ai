'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, ChevronRight } from 'lucide-react';

export default function ProfileMenus() {
  const router = useRouter();

  return (
    <div className="mt-5 flex flex-col gap-2">
      <button onClick={() => router.push('/app/profile/training')} className="flex w-full items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white px-4 py-3.5">
        <GraduationCap size={20} className="text-mw-green-500" />
        <div className="flex-1 text-left">
          <p className="text-[14px] font-semibold text-mw-gray-900">훈련 가이드</p>
          <p className="text-[11px] text-mw-gray-400">AI 맞춤 훈련법 + 4주 커리큘럼</p>
        </div>
        <ChevronRight size={16} className="text-mw-gray-400" />
      </button>
      <button onClick={() => router.push('/app/profile/reading')} className="flex w-full items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white px-4 py-3.5">
        <BookOpen size={20} className="text-mw-green-500" />
        <div className="flex-1 text-left">
          <p className="text-[14px] font-semibold text-mw-gray-900">읽을거리</p>
          <p className="text-[11px] text-mw-gray-400">감성 글, 행동 이해, 건강 정보, 명언</p>
        </div>
        <ChevronRight size={16} className="text-mw-gray-400" />
      </button>
    </div>
  );
}
