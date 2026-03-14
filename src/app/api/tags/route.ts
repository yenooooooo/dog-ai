import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const TAG_TYPES = [
  'shade', 'water', 'danger', 'big_dog',
  'off_leash', 'traffic', 'scenic', 'pet_friendly', 'trash_bin',
] as const;

const createTagSchema = z.object({
  tagType: z.enum(TAG_TYPES),
  description: z.string().max(100).nullable(),
  location: z.object({ lat: z.number(), lng: z.number() }),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요해요.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createTagSchema.parse(body);

    // 태그 유효기간: 생성 후 24시간
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('mw_tags')
      .insert({
        user_id: user.id,
        tag_type: parsed.tagType,
        description: parsed.description,
        location: `POINT(${parsed.location.lng} ${parsed.location.lat})`,
        is_active: true,
        helpful_count: 0,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tag: data });
  } catch (err) {
    console.error('태그 생성 실패:', err);
    const status = err instanceof z.ZodError ? 400 : 500;
    const code = err instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    return NextResponse.json(
      { error: '태그 생성에 실패했어요.', code },
      { status }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: '좌표가 필요해요.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mw_tags')
      .select('*')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ tags: data ?? [] });
  } catch (err) {
    console.error('태그 조회 실패:', err);
    return NextResponse.json(
      { error: '태그를 불러오지 못했어요.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
