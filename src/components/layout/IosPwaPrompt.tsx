'use client';

import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

const DISMISSED_KEY = 'mw_pwa_dismissed';

/** iOS Safari에서 홈화면 추가 안내 배너 */
export default function IosPwaPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // iOS Safari + standalone 모드가 아닐 때만 표시
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    const dismissed = localStorage.getItem(DISMISSED_KEY);

    if (isIos && isSafari && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-50 animate-slide-up">
      <div className="rounded-mw-lg bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-mw-sm bg-mw-green-50">
            <Share size={20} className="text-mw-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-mw-gray-900">
              홈 화면에 추가하기
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-mw-gray-500">
              하단의{' '}
              <Share size={12} className="inline text-mw-info" />{' '}
              공유 버튼을 누른 뒤
              <br />
              <strong>&quot;홈 화면에 추가&quot;</strong>를 선택하세요
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1">
            <X size={18} className="text-mw-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
