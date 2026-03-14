'use client';

import { useState } from 'react';
import { Target, Check } from 'lucide-react';

interface WeeklyGoalCardProps {
  progressKm: number;
  goalKm: number;
  onGoalChange: (km: number) => void;
}

/** 원형 프로그레스 바로 주간 목표 달성률을 표시한다 */
export default function WeeklyGoalCard({ progressKm, goalKm, onGoalChange }: WeeklyGoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goalKm));

  const ratio = goalKm > 0 ? Math.min(progressKm / goalKm, 1) : 0;
  const percent = Math.round(ratio * 100);
  const isCompleted = percent >= 100;

  // SVG 원형 프로그레스 파라미터
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  const handleSave = () => {
    const num = Number(inputVal);
    if (num > 0 && num <= 999) {
      onGoalChange(num);
    } else {
      setInputVal(String(goalKm));
    }
    setEditing(false);
  };

  return (
    <div className="mb-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <div className="flex items-center gap-3">
        {/* 원형 프로그레스 */}
        <div className="relative flex h-[90px] w-[90px] shrink-0 items-center justify-center">
          <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="6" />
            <circle
              cx="45" cy="45" r={radius} fill="none"
              stroke={isCompleted ? '#22C55E' : '#4ADE80'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-[15px] font-bold text-mw-gray-900">{percent}%</span>
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Target size={14} className="text-mw-green-500" />
            <span className="text-[13px] font-semibold text-mw-gray-800">이번 주 목표</span>
          </div>
          <p className="mt-1 text-[15px] font-bold text-mw-gray-900">
            {progressKm.toFixed(1)}km / {goalKm}km
          </p>
          {isCompleted && (
            <div className="mt-1 flex items-center gap-1">
              <Check size={14} className="text-mw-green-500" />
              <span className="text-[13px] font-medium text-mw-green-600">목표 달성!</span>
            </div>
          )}
          {editing ? (
            <div className="mt-2 flex items-center gap-1.5">
              <input
                type="number" min={1} max={999} value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-16 rounded-md border border-mw-gray-200 px-2 py-1 text-[13px] text-mw-gray-900 outline-none focus:border-mw-green-500"
              />
              <span className="text-[12px] text-mw-gray-500">km</span>
              <button onClick={handleSave} className="rounded-md bg-mw-green-500 px-2.5 py-1 text-[12px] font-medium text-white">
                저장
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="mt-1.5 text-[12px] text-mw-gray-400 underline">
              목표 변경
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
