'use client';

import { useMemo, useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

import { BADGES } from '@/lib/badge-constants';
import { evaluateBadges } from '@/lib/badge-engine';
import { getSeenBadges, markBadgeSeen } from '@/lib/badge-storage';
import type { Badge, BadgeId } from '@/types/badge';

interface BadgeGridProps {
  walks: { startedAt: string; distanceMeters: number }[];
}

function BadgeItem({
  badge,
  earned,
  isNew,
  onTap,
}: {
  badge: Badge;
  earned: boolean;
  isNew: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`relative flex flex-col items-center gap-1 rounded-mw-md p-3 active:scale-[0.97] ${
        earned
          ? 'border border-green-200 bg-green-50'
          : 'border border-mw-gray-100 bg-mw-gray-50'
      }`}
    >
      {isNew && (
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
          New
        </span>
      )}
      <span className={`text-[24px] ${earned ? '' : 'grayscale opacity-40'}`}>
        {earned ? badge.icon : <Lock size={24} className="text-mw-gray-300" />}
      </span>
      <span
        className={`text-[11px] font-medium ${
          earned ? 'text-mw-gray-800' : 'text-mw-gray-400'
        }`}
      >
        {badge.name}
      </span>
    </button>
  );
}

export default function BadgeGrid({ walks }: BadgeGridProps) {
  const earnedIds = useMemo(() => evaluateBadges(walks), [walks]);
  const [seenIds, setSeenIds] = useState<BadgeId[]>([]);
  const [selected, setSelected] = useState<Badge | null>(null);

  useEffect(() => {
    setSeenIds(getSeenBadges());
  }, []);

  const handleTap = (badge: Badge) => {
    setSelected(badge);
    if (earnedIds.includes(badge.id) && !seenIds.includes(badge.id)) {
      markBadgeSeen(badge.id);
      setSeenIds((prev) => [...prev, badge.id]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {BADGES.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            earned={earnedIds.includes(badge.id)}
            isNew={earnedIds.includes(badge.id) && !seenIds.includes(badge.id)}
            onTap={() => handleTap(badge)}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-3 rounded-mw-md border border-mw-gray-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">{selected.icon}</span>
            <div>
              <p className="text-[13px] font-bold text-mw-gray-900">
                {selected.name}
              </p>
              <p className="text-[11px] text-mw-gray-500">
                {selected.description}
              </p>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-mw-gray-400">
            조건: {selected.condition}
          </p>
        </div>
      )}
    </div>
  );
}
