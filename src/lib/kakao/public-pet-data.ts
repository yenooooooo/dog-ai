/**
 * 공공데이터 포털 — 전국 반려동물 동반 가능 문화시설 위치 데이터
 * API: https://api.odcloud.kr/api/15111389/v1/uddi:41944402-8249-4e45-9e9d-a52d0a7db1cc
 */

interface PublicPetPlace {
  name: string;
  address: string;
  tel: string;
  petInfo: string;
  sizeLimit: string;
  restriction: string;
  indoor: string;
  outdoor: string;
}

interface ApiItem {
  '시설명'?: string;
  '도로명주소'?: string;
  '지번주소'?: string;
  '전화번호'?: string;
  '반려동물 동반 가능정보'?: string;
  '입장 가능 동물 크기'?: string;
  '반려동물 제한사항'?: string;
  '장소(실내) 여부'?: string;
  '장소(실외)여부'?: string;
}

const API_URL = 'https://api.odcloud.kr/api/15111389/v1/uddi:41944402-8249-4e45-9e9d-a52d0a7db1cc';

/**
 * 공공데이터에서 반려동물 동반 가능 시설 검색
 * 전체 데이터를 가져와서 키워드로 필터링 (API가 검색 미지원)
 */
export async function searchPublicPetPlaces(
  keyword: string
): Promise<PublicPetPlace[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      page: '1',
      perPage: '100',
      serviceKey: apiKey,
    });

    const res = await fetch(`${API_URL}?${params}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const items: ApiItem[] = json?.data ?? [];

    const kw = keyword.toLowerCase();
    return items
      .filter((item) => {
        const text = `${item['시설명'] ?? ''} ${item['도로명주소'] ?? ''} ${item['지번주소'] ?? ''}`.toLowerCase();
        return text.includes(kw);
      })
      .slice(0, 10)
      .map((item) => ({
        name: item['시설명'] ?? '',
        address: item['도로명주소'] ?? item['지번주소'] ?? '',
        tel: item['전화번호'] ?? '',
        petInfo: item['반려동물 동반 가능정보'] ?? '',
        sizeLimit: item['입장 가능 동물 크기'] ?? '',
        restriction: item['반려동물 제한사항'] ?? '',
        indoor: item['장소(실내) 여부'] ?? '',
        outdoor: item['장소(실외)여부'] ?? '',
      }));
  } catch {
    return [];
  }
}
