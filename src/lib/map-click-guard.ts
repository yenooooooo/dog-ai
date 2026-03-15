/**
 * 오버레이 클릭 시 지도 클릭 이벤트를 무시하기 위한 가드.
 * 카카오 맵은 자체 이벤트 시스템이라 DOM stopPropagation이 안 먹힘.
 */
let blocked = false;

export function blockMapClick(): void {
  blocked = true;
  setTimeout(() => { blocked = false; }, 500);
}

export function isMapClickBlocked(): boolean {
  return blocked;
}
