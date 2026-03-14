'use client';

import { useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import type { Coordinate } from '@/types/route';

interface PastRoutesProps {
  map: kakao.maps.Map;
}

interface PastRoute {
  id: string;
  path: Coordinate[];
}

const PAST_ROUTE_STYLE = {
  color: '#A0A0A0',
  opacity: 0.15,
  weight: 3,
} as const;

/** Supabase에서 최근 5개 산책 경로를 로드하여 지도에 연하게 표시한다 */
export default function PastRoutes({ map }: PastRoutesProps) {
  const [routes, setRoutes] = useState<PastRoute[]>([]);
  const polylinesRef = useRef<kakao.maps.Polyline[]>([]);

  // 최근 산책 경로 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mu } = await supabase
        .from('mw_users').select('id').eq('auth_id', user.id).single();
      if (!mu) return;

      const { data } = await supabase
        .from('mw_walks')
        .select('id, route_geojson')
        .eq('user_id', mu.id)
        .eq('status', 'completed')
        .not('route_geojson', 'is', null)
        .order('started_at', { ascending: false })
        .limit(5);

      if (!data) return;

      const parsed: PastRoute[] = data
        .filter((w) => w.route_geojson)
        .map((w) => {
          const geojson = w.route_geojson as { coordinates?: number[][] };
          const coords = geojson?.coordinates ?? [];
          return {
            id: w.id,
            path: coords.map((c: number[]) => ({ lat: c[1], lng: c[0] })),
          };
        })
        .filter((r) => r.path.length >= 2);

      setRoutes(parsed);
    };
    load();
  }, []);

  // 폴리라인 렌더링
  useEffect(() => {
    // 이전 폴리라인 제거
    polylinesRef.current.forEach((pl) => pl.setMap(null));
    polylinesRef.current = [];

    routes.forEach((route) => {
      const linePath = route.path.map(
        (c) => new window.kakao.maps.LatLng(c.lat, c.lng)
      );
      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: PAST_ROUTE_STYLE.weight,
        strokeColor: PAST_ROUTE_STYLE.color,
        strokeOpacity: PAST_ROUTE_STYLE.opacity,
        strokeStyle: 'solid',
      });
      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    });

    return () => {
      polylinesRef.current.forEach((pl) => pl.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routes]);

  return null;
}
