import type { TagType } from '@/types/database';
import type { Coordinate } from '@/types/route';

export interface StoredTag {
  id: string;
  tagType: TagType;
  description: string | null;
  location: Coordinate;
  createdAt: string;
  helpfulCount: number;
}

const STORAGE_KEY = 'mw_tags';
const VOTES_KEY = 'mw_tag_votes';

export function saveTag(
  tag: Omit<StoredTag, 'id' | 'createdAt' | 'helpfulCount'>
): StoredTag {
  const records = getTags();
  const newTag: StoredTag = {
    ...tag,
    id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
  };
  records.unshift(newTag);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newTag;
}

export function getTags(): StoredTag[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    // 기존 데이터 호환: helpfulCount 없는 태그에 기본값 추가
    return (JSON.parse(raw) as StoredTag[]).map((t) => ({
      ...t,
      helpfulCount: t.helpfulCount ?? 0,
    }));
  } catch {
    return [];
  }
}

export function deleteTag(id: string): void {
  const records = getTags().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** 이미 투표했는지 확인 */
export function hasVoted(tagId: string): boolean {
  const votes = getVotedIds();
  return votes.includes(tagId);
}

/** 도움됐어요 투표 */
export function voteTag(tagId: string): StoredTag | null {
  if (hasVoted(tagId)) return null;
  const tags = getTags();
  const idx = tags.findIndex((t) => t.id === tagId);
  if (idx === -1) return null;
  tags[idx].helpfulCount += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  // 투표 기록 저장
  const votes = getVotedIds();
  votes.push(tagId);
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  return tags[idx];
}

function getVotedIds(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(VOTES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
