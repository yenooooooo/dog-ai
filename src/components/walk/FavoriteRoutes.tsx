'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, Route, Timer } from 'lucide-react';

import { getFavoriteRoutes, deleteFavoriteRoute } from '@/lib/supabase/favorite-routes';
import type { GeneratedRoute } from '@/types/route';

interface FavoriteRoutesProps {
  onSelectRoute: (route: GeneratedRoute) => void;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

export default function FavoriteRoutes({ onSelectRoute }: FavoriteRoutesProps) {
  const [favorites, setFavorites] = useState<GeneratedRoute[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteRoutes());
  }, []);

  const handleDelete = (id: string) => {
    deleteFavoriteRoute(id);
    setFavorites(getFavoriteRoutes());
  };

  if (favorites.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5">
        <Heart size={14} className="text-mw-danger" fill="currentColor" />
        <h3 className="text-[14px] font-semibold text-mw-gray-800">즐겨찾기 루트</h3>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {favorites.map((route) => (
          <div
            key={route.id}
            onClick={() => onSelectRoute(route)}
            className="flex items-center justify-between rounded-mw border border-mw-gray-100 bg-white px-3 py-2.5 active:scale-[0.98]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-mw-gray-900">{route.name}</p>
              <div className="mt-0.5 flex items-center gap-3 text-[12px] text-mw-gray-500">
                <span className="flex items-center gap-0.5">
                  <Route size={12} strokeWidth={1.75} />
                  {formatDistance(route.totalDistance)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Timer size={12} strokeWidth={1.75} />
                  약 {route.estimatedDuration}분
                </span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(route.id); }}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-mw-gray-400 active:bg-mw-gray-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
