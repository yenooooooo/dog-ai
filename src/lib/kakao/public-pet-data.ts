/**
 * 공공데이터 포털 — 반려동물 동반 가능 문화시설 조회
 * API 키: DATA_GO_KR_API_KEY 환경변수
 * 데이터: 농림축산식품부 제공
 *
 * 사용법: 검색 API에서 결과 보강 시 호출
 */

interface PublicPetPlace {
  name: string;
  address: string;
  tel: string;
  petOk: boolean;
}

const API_BASE = 'https://apis.data.go.kr/1543061/animalCultureFcltyRceptPetService';

/**
 * 공공데이터에서 반려동물 동반 가능 시설 조회
 * @param keyword 검색어 (시설명 또는 주소)
 */
export async function searchPublicPetPlaces(
  keyword: string
): Promise<PublicPetPlace[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      serviceKey: apiKey,
      keyword,
      numOfRows: '10',
      pageNo: '1',
      _type: 'json',
    });

    const res = await fetch(`${API_BASE}/getAnimalCultureFcltyRceptPetList?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data?.response?.body?.items?.item ?? [];

    return (Array.isArray(items) ? items : [items]).map(
      (item: Record<string, string>) => ({
        name: item.fcltyNm ?? '',
        address: item.rdnmadrNm ?? item.lnmAddr ?? '',
        tel: item.telNo ?? '',
        petOk: true,
      })
    );
  } catch {
    return [];
  }
}
