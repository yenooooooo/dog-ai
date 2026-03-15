'use client';

import { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';

/** 여름철(6-8월) 한낮(12-15시)에 표시되는 안내 */
export default function WeatherWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();
    const isSummerMidday = month >= 6 && month <= 8 && hour >= 12 && hour <= 15;
    setShowWarning(isSummerMidday);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="absolute left-4 right-4 top-28 z-30 animate-slide-up">
      <div className="flex items-center gap-2 rounded-mw bg-mw-amber-500/90 px-3 py-2.5 backdrop-blur">
        <Sun size={14} className="shrink-0 text-white" />
        <span className="text-[12px] text-white">
          한낮에는 아스팔트가 뜨거울 수 있어요. 그늘진 곳을 찾아보세요
        </span>
      </div>
    </div>
  );
}
