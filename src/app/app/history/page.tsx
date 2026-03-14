'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { getWeeklyGoal, setWeeklyGoal, getWeeklyProgress } from '@/lib/weekly-goal';
import WeeklyGoalCard from '@/components/walk/WeeklyGoalCard';
import MonthSummaryCard from '@/components/walk/MonthSummaryCard';
import WalkHistoryCard from '@/components/walk/WalkHistoryCard';

interface WalkRecord {
  id: string;
  startedAt: string;
  distanceMeters: number;
  durationSeconds: number;
}

function groupByDate(walks: WalkRecord[]) {
  const groups: Record<string, WalkRecord[]> = {};
  walks.forEach((w) => {
    const key = w.startedAt.slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function HistoryPage() {
  const [walks, setWalks] = useState<WalkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalKm, setGoalKm] = useState(10);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: mu } = await supabase
        .from('mw_users').select('id').eq('auth_id', user.id).single();
      if (!mu) { setLoading(false); return; }

      const { data } = await supabase
        .from('mw_walks')
        .select('id, started_at, distance_meters, duration_seconds')
        .eq('user_id', mu.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(50);

      setWalks(
        (data ?? []).map((w) => ({
          id: w.id,
          startedAt: w.started_at,
          distanceMeters: w.distance_meters,
          durationSeconds: w.duration_seconds,
        }))
      );
      setGoalKm(getWeeklyGoal());
      setLoading(false);
    };
    load();
  }, []);

  const now = new Date();
  const thisMonth = walks.filter((w) => {
    const d = new Date(w.startedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalDistance = thisMonth.reduce((s, w) => s + w.distanceMeters, 0);
  const totalDuration = thisMonth.reduce((s, w) => s + w.durationSeconds, 0);
  const weeklyProgress = getWeeklyProgress(walks);
  const grouped = groupByDate(walks);

  const handleGoalChange = (km: number) => {
    setWeeklyGoal(km);
    setGoalKm(km);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-mw-gray-50">
        <p className="text-[14px] text-mw-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center justify-between bg-white px-5 pb-3 pt-4">
        <h1 className="text-[20px] font-bold text-mw-gray-900">산책 기록</h1>
        <span className="text-[13px] font-medium text-mw-gray-500">이번 달</span>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <WeeklyGoalCard progressKm={weeklyProgress} goalKm={goalKm} onGoalChange={handleGoalChange} />
        <MonthSummaryCard
          totalWalks={thisMonth.length}
          totalDistanceKm={totalDistance / 1000}
          totalDurationMin={Math.round(totalDuration / 60)}
        />
        {grouped.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[15px] text-mw-gray-400">아직 산책 기록이 없어요</p>
            <p className="mt-1 text-[13px] text-mw-gray-300">첫 산책을 시작해보세요!</p>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} className="mt-4">
              <p className="mb-2 text-[13px] font-medium text-mw-gray-500">{formatDateLabel(date)}</p>
              <div className="flex flex-col gap-2">
                {items.map((w) => (
                  <WalkHistoryCard key={w.id} id={w.id} distanceMeters={w.distanceMeters} durationSeconds={w.durationSeconds} startedAt={w.startedAt} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
