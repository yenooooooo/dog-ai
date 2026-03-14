/**
 * 기하학적 웨이포인트를 공공 도로 위 장소로 보정한다.
 * 카카오 키워드 검색 API로 근처 공공 장소를 찾아 대체.
 * → 아파트 단지 내부로 경로가 잡히는 문제 방지.
 */
import type { Coordinate } from '@/types/route';

// 공공 장소 검색 키워드 (우선순위 순)
const SEARCH_KEYWORDS = ['산책로', '공원', '보행자도로', '교차로', '편의점', '버스정류장'];

interface KakaoPlace {
  x: string;
  y: string;
  place_name: string;
  category_group_code: string;
}

interface KakaoSearchResponse {
  documents: KakaoPlace[];
}

/**
 * 좌표 근처의 공공 장소를 검색하여 가장 가까운 곳의 좌표를 반환한다.
 * 찾지 못하면 원래 좌표를 그대로 반환 (폴백).
 */
async function snapOnePoint(
  coord: Coordinate,
  apiKey: string
): Promise<Coordinate> {
  for (const keyword of SEARCH_KEYWORDS) {
    try {
      const params = new URLSearchParams({
        query: keyword,
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

      if (!res.ok) continue;

      const data: KakaoSearchResponse = await res.json();
      if (data.documents.length > 0) {
        const place = data.documents[0];
        return { lng: Number(place.x), lat: Number(place.y) };
      }
    } catch {
      continue;
    }
  }

  // 공공 장소 못 찾으면 원래 좌표 사용
  return coord;
}

/**
 * 웨이포인트 배열을 공공 도로 위 장소로 보정한다.
 * 각 웨이포인트를 병렬로 검색하여 속도 최적화.
 */
export async function snapWaypointsToRoad(
  waypoints: Coordinate[],
  apiKey: string
): Promise<Coordinate[]> {
  const results = await Promise.all(
    waypoints.map((wp) => snapOnePoint(wp, apiKey))
  );
  return results;
}
