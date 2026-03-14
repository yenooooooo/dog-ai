/**
 * 출발 위치 근처에 공원이 있는지 감지.
 * 공원이면 공원 모드(차량 경로 대신 원형 가이드) 사용.
 */
import type { Coordinate } from '@/types/route';

interface ParkInfo {
  name: string;
  center: Coordinate;
}

/**
 * 좌표 200m 반경 내 공원 검색.
 * 공원이 있으면 ParkInfo 반환, 없으면 null.
 */
export async function detectNearbyPark(
  coord: Coordinate,
  apiKey: string
): Promise<ParkInfo | null> {
  try {
    const params = new URLSearchParams({
      query: '공원',
      x: String(coord.lng),
      y: String(coord.lat),
      radius: '200',
      sort: 'distance',
      size: '1',
    });

    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const doc = data.documents?.[0];
    if (!doc) return null;

    return {
      name: doc.place_name,
      center: { lat: Number(doc.y), lng: Number(doc.x) },
    };
  } catch {
    return null;
  }
}
