import { NextResponse } from 'next/server';

// 반려견 동반 가능 판별 키워드
const PET_FRIENDLY_KEYWORDS = [
  '애견', '반려견', '반려동물', '펫', 'pet', '강아지', '동반',
  '애견동반', '펫프렌들리', 'dog',
];

// 카테고리별 기본 동반 가능 여부
const PET_FRIENDLY_CATEGORIES: Record<string, boolean> = {
  '동물병원': true,
  '반려동물': true,
  '애견': true,
  '공원': true,
  '산': true,
  '해수욕장': true,
};

function checkPetFriendly(
  name: string,
  category: string
): 'yes' | 'maybe' | 'unknown' {
  const text = `${name} ${category}`.toLowerCase();
  // 이름/카테고리에 반려견 키워드 포함
  if (PET_FRIENDLY_KEYWORDS.some((kw) => text.includes(kw))) return 'yes';
  // 기본 동반 가능 카테고리
  for (const cat of Object.keys(PET_FRIENDLY_CATEGORIES)) {
    if (text.includes(cat.toLowerCase())) return 'maybe';
  }
  return 'unknown';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요해요.', code: 'NO_QUERY' }, { status: 400 });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API 키 미설정', code: 'NO_KEY' }, { status: 503 });
  }

  try {
    // 원래 검색 (좌표 있으면 반경 2km 내 우선)
    const locParams = lat && lng ? `&x=${lng}&y=${lat}&radius=2000&sort=distance` : '';
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5${locParams}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );
    if (!res.ok) throw new Error(`Kakao ${res.status}`);
    const data = await res.json();

    // 반려견 동반 2차 검색 (동반 가능 매장 교차 확인)
    const petRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(`애견동반 ${query}`)}&size=10${locParams}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );
    const petData = petRes.ok ? await petRes.json() : { documents: [] };
    const petPlaceNames = new Set(
      (petData.documents ?? []).map((d: Record<string, string>) => d.place_name)
    );

    const places = (data.documents ?? []).map((d: Record<string, string>) => {
      let petFriendly = checkPetFriendly(d.place_name, d.category_name ?? '');
      // 2차 검색에서 같은 이름 발견 → 확실히 동반 가능
      if (petPlaceNames.has(d.place_name)) petFriendly = 'yes';
      return {
        name: d.place_name,
        address: d.address_name,
        lat: d.y,
        lng: d.x,
        category: d.category_name ?? '',
        petFriendly,
      };
    });

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: '검색에 실패했어요.', code: 'SEARCH_ERROR' }, { status: 500 });
  }
}
