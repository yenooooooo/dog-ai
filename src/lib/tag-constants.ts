import type { TagType } from '@/types/database';

export interface TagMeta {
  type: TagType;
  emoji: string;
  label: string;
  color: string;
}

export const TAG_META: Record<TagType, TagMeta> = {
  shade: { type: 'shade', emoji: '☀️', label: '그늘 많음', color: '#86EFAC' },
  water: { type: 'water', emoji: '💧', label: '물 마실 곳', color: '#4A90D9' },
  danger: { type: 'danger', emoji: '⚠️', label: '위험', color: '#DC4A3F' },
  big_dog: { type: 'big_dog', emoji: '🐕', label: '큰 개 출몰', color: '#E8973E' },
  off_leash: { type: 'off_leash', emoji: '🌿', label: '풀어도 OK', color: '#2D8A42' },
  traffic: { type: 'traffic', emoji: '🚗', label: '차 많음', color: '#6B6B67' },
  scenic: { type: 'scenic', emoji: '✨', label: '뷰 좋음', color: '#FBBF24' },
  pet_friendly: { type: 'pet_friendly', emoji: '🏪', label: '반려견 가게', color: '#4ADE80' },
  trash_bin: { type: 'trash_bin', emoji: '🗑️', label: '쓰레기통', color: '#78716C' },
  pet_allowed: { type: 'pet_allowed', emoji: '✅', label: '출입 가능', color: '#2D8A42' },
  pet_banned: { type: 'pet_banned', emoji: '🚫', label: '출입 불가', color: '#DC4A3F' },
};

export const TAG_TYPES = Object.values(TAG_META);
