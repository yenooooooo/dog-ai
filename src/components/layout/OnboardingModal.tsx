'use client';

import { useState, useEffect } from 'react';
import { Dog, MapPin, Footprints, Share2, X } from 'lucide-react';

const ONBOARDING_KEY = 'mw_onboarding_done';

const STEPS = [
  { icon: Dog, title: '반려견 등록', desc: '프로필에서 강아지를 등록하세요' },
  { icon: MapPin, title: '출발 위치 선택', desc: '지도를 탭해서 출발 위치를 정해요' },
  { icon: Footprints, title: '루트 생성 & 산책', desc: '시간을 선택하고 루트를 만들어요' },
  { icon: Share2, title: '기록 & 공유', desc: '산책 후 기록을 저장하고 공유해요' },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setShow(true);
  }, []);

  const handleDone = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-6 w-full max-w-sm rounded-mw-lg bg-white px-6 py-8">
        <div className="flex justify-end">
          <button onClick={handleDone} className="p-1">
            <X size={18} className="text-mw-gray-400" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mw-green-50">
            <Icon size={32} className="text-mw-green-500" />
          </div>
          <p className="mt-4 text-[13px] font-medium text-mw-green-500">
            STEP {step + 1}/{STEPS.length}
          </p>
          <h3 className="mt-1 text-[20px] font-bold text-mw-gray-900">
            {current.title}
          </h3>
          <p className="mt-2 text-center text-[14px] text-mw-gray-500">
            {current.desc}
          </p>
        </div>

        {/* 인디케이터 */}
        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-mw-green-500' : 'w-1.5 bg-mw-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={isLast ? handleDone : () => setStep(step + 1)}
          className="mt-6 w-full rounded-mw bg-mw-green-500 py-3.5 text-[15px] font-semibold text-white active:scale-[0.97]"
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
