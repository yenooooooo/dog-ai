import type { Badge, LevelInfo } from '@/types/badge';

export const LEVELS: LevelInfo[] = [
  { level: 1, name: '아기 산책러', minKm: 0, maxKm: 10 },
  { level: 2, name: '동네 탐험가', minKm: 10, maxKm: 50 },
  { level: 3, name: '공원 지킴이', minKm: 50, maxKm: 100 },
  { level: 4, name: '산책 달인', minKm: 100, maxKm: 200 },
  { level: 5, name: '마라톤 독', minKm: 200, maxKm: 500 },
  { level: 6, name: '전설의 산책러', minKm: 500, maxKm: Infinity },
];

export const BADGES: Badge[] = [
  {
    id: 'first_walk',
    name: '첫 산책',
    icon: '🐾',
    description: '첫 번째 산책을 완료했어요!',
    condition: '산책 1회 완료',
  },
  {
    id: 'streak_3',
    name: '3일 연속',
    icon: '🔥',
    description: '3일 연속 산책 성공!',
    condition: '3일 연속 산책',
  },
  {
    id: 'streak_7',
    name: '7일 연속',
    icon: '💪',
    description: '일주일 내내 산책했어요!',
    condition: '7일 연속 산책',
  },
  {
    id: 'streak_30',
    name: '30일 연속',
    icon: '👑',
    description: '한 달 동안 매일 산책!',
    condition: '30일 연속 산책',
  },
  {
    id: 'distance_5km',
    name: '5km 돌파',
    icon: '🏃',
    description: '한 번에 5km를 걸었어요!',
    condition: '한 번의 산책에서 5km 이상',
  },
  {
    id: 'night_walker',
    name: '야간 산책러',
    icon: '🌙',
    description: '밤에도 산책을 즐겨요!',
    condition: '21시 이후에 산책 시작',
  },
  {
    id: 'early_bird',
    name: '얼리버드',
    icon: '🌅',
    description: '이른 아침부터 산책!',
    condition: '7시 이전에 산책 시작',
  },
  {
    id: 'walks_10',
    name: '10회 산책',
    icon: '⭐',
    description: '산책 10회를 달성했어요!',
    condition: '누적 산책 10회',
  },
  {
    id: 'walks_50',
    name: '50회 산책',
    icon: '🌟',
    description: '산책 50회를 달성했어요!',
    condition: '누적 산책 50회',
  },
  {
    id: 'walks_100',
    name: '100회 산책',
    icon: '💎',
    description: '산책 100회를 달성했어요!',
    condition: '누적 산책 100회',
  },
];
