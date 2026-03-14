import type { GeneratedRoute } from '@/types/route';

const STORAGE_KEY = 'mw_favorite_routes';

/** localStorage에서 즐겨찾기 루트 목록을 가져온다 */
export function getFavoriteRoutes(): GeneratedRoute[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GeneratedRoute[];
  } catch {
    return [];
  }
}

/** 즐겨찾기 루트를 저장한다 (중복 id 방지) */
export function saveFavoriteRoute(route: GeneratedRoute): void {
  const current = getFavoriteRoutes();
  const exists = current.some((r) => r.id === route.id);
  if (exists) return;
  const updated = [route, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/** id로 즐겨찾기 루트를 삭제한다 */
export function deleteFavoriteRoute(id: string): void {
  const current = getFavoriteRoutes();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/** 특정 루트가 즐겨찾기에 있는지 확인한다 */
export function isFavoriteRoute(id: string): boolean {
  return getFavoriteRoutes().some((r) => r.id === id);
}
