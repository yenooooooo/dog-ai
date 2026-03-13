import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const saveSchema = z.object({
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  distanceMeters: z.number().min(0),
  durationSeconds: z.number().min(0),
  coordinates: z.array(z.object({ lat: z.number(), lng: z.number() })),
  petId: z.string().uuid().optional(),
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
    const parsed = saveSchema.parse(body);

    // GeoJSON LineString 변환
    const routeGeojson = {
      type: 'LineString' as const,
      coordinates: parsed.coordinates.map((c) => [c.lng, c.lat]),
    };

    const { data, error } = await supabase
      .from('mw_walks')
      .insert({
        user_id: user.id,
        pet_id: parsed.petId ?? null,
        started_at: parsed.startedAt,
        ended_at: parsed.endedAt,
        distance_meters: Math.round(parsed.distanceMeters),
        duration_seconds: parsed.durationSeconds,
        route_geojson: routeGeojson,
        status: 'completed',
        share_card_url: null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ walk: data });
  } catch (err) {
    console.error('산책 저장 실패:', err);
    const status = err instanceof z.ZodError ? 400 : 500;
    const code = err instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    return NextResponse.json({ error: '산책 저장에 실패했어요.', code }, { status });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요해요.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('mw_walks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ walks: data });
  } catch (err) {
    console.error('산책 기록 조회 실패:', err);
    return NextResponse.json(
      { error: '기록을 불러오지 못했어요.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
