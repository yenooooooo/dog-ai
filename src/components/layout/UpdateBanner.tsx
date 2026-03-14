'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const CHECK_INTERVAL = 60_000; // 1분마다 체크

/** 새 버전 감지 시 업데이트 배너 표시 */
export default function UpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/version');
        const { version } = await res.json();
        if (!initialVersion.current) {
          initialVersion.current = version;
          return;
        }
        if (version !== initialVersion.current) {
          setHasUpdate(true);
        }
      } catch {
        // 네트워크 오류 무시
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-[70] animate-slide-up">
      <div className="flex items-center justify-between rounded-mw-lg bg-mw-green-500 px-4 py-3 shadow-lg">
        <span className="text-[13px] font-medium text-white">
          새 버전이 있어요!
        </span>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 rounded-mw-sm bg-white/20 px-3 py-1.5 text-[13px] font-semibold text-white active:scale-[0.97]"
        >
          <RefreshCw size={14} />
          업데이트
        </button>
      </div>
    </div>
  );
}
