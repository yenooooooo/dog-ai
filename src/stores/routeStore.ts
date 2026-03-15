import { create } from 'zustand';

import type { Coordinate, GeneratedRoute } from '@/types/route';

interface RouteState {
  routes: GeneratedRoute[];
  selectedIndex: number;
  isGenerating: boolean;
  progressMessage: string;
  error: string | null;
  selectedPetId: string | null;
  selectedPetName: string | null;
  generateRoutes: (origin: Coordinate, durationMinutes: number, petSize?: string) => Promise<void>;
  selectRoute: (index: number) => void;
  setSelectedPet: (id: string | null, name: string | null) => void;
  reset: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedIndex: 0,
  isGenerating: false,
  progressMessage: '',
  error: null,
  selectedPetId: null,
  selectedPetName: null,

  generateRoutes: async (origin, durationMinutes, petSize) => {
    set({ isGenerating: true, error: null, routes: [], progressMessage: '보행자 경로를 찾고 있어요...' });
    try {
      const res = await fetch('/api/route/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, durationMinutes, petSize }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '루트 생성 실패');
      }

      const { routes } = await res.json();
      set({ routes, selectedIndex: 0, isGenerating: false, progressMessage: '' });
    } catch (err) {
      const raw = err instanceof Error ? err.message : '루트를 생성하지 못했어요.';
      const hint = raw.includes('NO_ROUTE') || raw.includes('경로를 찾을 수 없')
        ? '위치를 도로 근처로 옮기거나 시간을 줄여보세요.'
        : '';
      const message = hint ? `${raw} ${hint}` : raw;
      console.error('루트 생성 실패:', err);
      set({ error: message, isGenerating: false, progressMessage: '' });
    }
  },

  selectRoute: (index) => set({ selectedIndex: index }),

  setSelectedPet: (id, name) => set({ selectedPetId: id, selectedPetName: name }),

  reset: () => set({ routes: [], selectedIndex: 0, error: null, progressMessage: '' }),
}));
