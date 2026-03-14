import { create } from 'zustand';

import type { Coordinate, GeneratedRoute } from '@/types/route';

interface RouteState {
  routes: GeneratedRoute[];
  selectedIndex: number;
  isGenerating: boolean;
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
  error: null,
  selectedPetId: null,
  selectedPetName: null,

  generateRoutes: async (origin, durationMinutes, petSize) => {
    set({ isGenerating: true, error: null, routes: [] });
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
      set({ routes, selectedIndex: 0, isGenerating: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '루트를 생성하지 못했어요.';
      console.error('루트 생성 실패:', err);
      set({ error: message, isGenerating: false });
    }
  },

  selectRoute: (index) => set({ selectedIndex: index }),

  setSelectedPet: (id, name) => set({ selectedPetId: id, selectedPetName: name }),

  reset: () => set({ routes: [], selectedIndex: 0, error: null }),
}));
