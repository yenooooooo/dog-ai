import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요해요.', code: 'NO_QUERY' }, { status: 400 });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API 키 미설정', code: 'NO_KEY' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );

    if (!res.ok) throw new Error(`Kakao ${res.status}`);

    const data = await res.json();
    const places = (data.documents ?? []).map((d: Record<string, string>) => ({
      name: d.place_name,
      address: d.address_name,
      lat: d.y,
      lng: d.x,
    }));

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: '검색에 실패했어요.', code: 'SEARCH_ERROR' }, { status: 500 });
  }
}
