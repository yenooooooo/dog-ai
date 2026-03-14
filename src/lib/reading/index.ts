export type { ReadingArticle } from './types';
export { EMOTIONAL_ARTICLES } from './emotional';
export { BEHAVIOR_ARTICLES } from './behavior';
export { HEALTH_ARTICLES } from './health';
export { BONDING_ARTICLES } from './bonding';
export { QUOTES_ARTICLES } from './quotes';

import { EMOTIONAL_ARTICLES } from './emotional';
import { BEHAVIOR_ARTICLES } from './behavior';
import { HEALTH_ARTICLES } from './health';
import { BONDING_ARTICLES } from './bonding';
import { QUOTES_ARTICLES } from './quotes';

export const ALL_ARTICLES = [
  ...EMOTIONAL_ARTICLES,
  ...BEHAVIOR_ARTICLES,
  ...HEALTH_ARTICLES,
  ...BONDING_ARTICLES,
  ...QUOTES_ARTICLES,
];

export const CATEGORIES = [
  { id: 'all', label: '전체', emoji: '📚' },
  { id: '감성', label: '감성', emoji: '💕' },
  { id: '행동 이해', label: '행동 이해', emoji: '🧠' },
  { id: '건강/안전', label: '건강/안전', emoji: '🏥' },
  { id: '유대감', label: '유대감', emoji: '💛' },
  { id: '명언', label: '명언', emoji: '💬' },
];
