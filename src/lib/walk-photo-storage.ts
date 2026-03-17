import type { WalkPhoto } from '@/types/walk-photo';

/** walkId별 사진 저장 키 */
function storageKey(walkId: string): string {
  return `mw_walk_photos_${walkId}`;
}

/** walkId에 해당하는 사진 목록 저장 */
export function saveWalkPhotos(walkId: string, photos: WalkPhoto[]): void {
  try {
    const serialized = photos.map((p) => ({
      id: p.id,
      dataUrl: p.dataUrl,
      coordinate: p.coordinate,
      timestamp: p.timestamp,
      walkId,
    }));
    localStorage.setItem(storageKey(walkId), JSON.stringify(serialized));
  } catch (err) {
    console.error('사진 저장 실패:', err);
  }
}

/** walkId에 해당하는 사진 목록 조회 */
export function getWalkPhotos(walkId: string): WalkPhoto[] {
  try {
    const raw = localStorage.getItem(storageKey(walkId));
    if (!raw) return [];
    return JSON.parse(raw) as WalkPhoto[];
  } catch {
    return [];
  }
}

/** walkId에 해당하는 사진 삭제 */
export function deleteWalkPhotos(walkId: string): void {
  try {
    localStorage.removeItem(storageKey(walkId));
  } catch {
    // noop
  }
}
