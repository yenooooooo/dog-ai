'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

import { useWalkStore } from '@/stores/walkStore';

const CHECK_INTERVAL = 30_000; // 30초마다 체크
const VERSION_KEY = 'mw_app_version';

export default function UpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const savedVersion = localStorage.getItem(VERSION_KEY);

    const check = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
        const { version } = await res.json();

        if (!savedVersion) {
          // 첫 방문: 버전 저장
          localStorage.setItem(VERSION_KEY, version);
          return;
        }

        if (version !== savedVersion) {
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

  const handleUpdate = useCallback(() => {
    // 새 버전으로 localStorage 갱신
    fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(({ version }) => localStorage.setItem(VERSION_KEY, version))
      .catch(() => {});

    // 산책 중이면 즉시 백업
    const store = useWalkStore.getState();
    if (store.isWalking && store.startedAt) {
      try {
        localStorage.setItem('mw_walk_backup', JSON.stringify({
          isWalking: true, startedAt: store.startedAt,
          coordinates: store.coordinates, distance: store.distance,
          pausedDuration: store.pausedDuration, targetDistance: store.targetDistance,
        }));
      } catch { /* 실패해도 진행 */ }
    }

    window.location.reload();
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-[70] animate-slide-up">
      <div className="flex items-center justify-between rounded-mw-lg bg-mw-green-500 px-4 py-3 shadow-lg">
        <span className="text-[13px] font-medium text-white">새 버전이 있어요!</span>
        <button onClick={handleUpdate} className="flex items-center gap-1.5 rounded-mw-sm bg-white/20 px-3 py-1.5 text-[13px] font-semibold text-white active:scale-[0.97]">
          <RefreshCw size={14} /> 업데이트
        </button>
      </div>
    </div>
  );
}
