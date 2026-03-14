import { createClient } from '@/lib/supabase/client';
import type { Coordinate } from '@/types/route';

/** Supabase에 산책 기록 저장 */
export async function saveWalkToDb(params: {
  startedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Coordinate[];
  petId?: string;
}): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('인증 필요');

  const { data: mu } = await sb
    .from('mw_users').select('id').eq('auth_id', user.id).single();
  if (!mu) throw new Error('유저 없음');

  const { error } = await sb.from('mw_walks').insert({
    user_id: mu.id,
    pet_id: params.petId ?? null,
    started_at: params.startedAt,
    ended_at: new Date().toISOString(),
    distance_meters: params.distanceMeters,
    duration_seconds: params.durationSeconds,
    route_geojson: {
      type: 'LineString',
      coordinates: params.coordinates.map((c) => [c.lng, c.lat]),
    },
    status: 'completed',
  });

  if (error) throw error;
}
