'use client';

import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';

/** 야간 시간(19시~06시)에 표시되는 안내 */
export default function NightWarning() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h >= 19 || h < 6);
  }, []);

  if (!isNight) return null;

  return (
    <div className="absolute left-4 right-4 top-14 z-30 animate-slide-up">
      <div className="flex items-center gap-2 rounded-mw bg-mw-gray-800/90 px-3 py-2.5 backdrop-blur">
        <Moon size={14} className="text-mw-amber-400" />
        <span className="text-[12px] text-white">
          야간 산책 중이에요. 밝은 곳 위주로 걸어주세요
        </span>
      </div>
    </div>
  );
}
