'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  getTags,
  saveTag,
  voteTag,
  hasVoted,
  type StoredTag,
} from '@/lib/tag-storage';
import TagSheet from '@/components/walk/TagSheet';
import TagMarkers from '@/components/map/TagMarkers';
import TagDetailPopup from '@/components/walk/TagDetailPopup';
import type { TagType } from '@/types/database';
import type { Coordinate } from '@/types/route';

interface WalkTagManagerProps {
  map: kakao.maps.Map | null;
  position: Coordinate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WalkTagManager({
  map,
  position,
  isOpen,
  onClose,
}: WalkTagManagerProps) {
  const [tags, setTags] = useState<StoredTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<StoredTag | null>(null);

  useEffect(() => {
    setTags(getTags());
  }, []);

  const handleCreate = async (tagType: TagType, description: string | null) => {
    if (!position) {
      toast.error('현재 위치를 확인할 수 없어요.');
      return;
    }
    const tag = saveTag({ tagType, description, location: position });
    setTags((prev) => [tag, ...prev]);
    onClose();
    toast.success('태그가 등록되었어요!');

    // Supabase에도 저장 (베스트 에포트 — 실패해도 로컬은 이미 저장됨)
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagType, description, location: position }),
      });
    } catch {
      // 서버 저장 실패는 무시 (로컬에 이미 저장됨)
    }
  };

  const handleTagClick = useCallback((tag: StoredTag) => {
    setSelectedTag(tag);
  }, []);

  const handleVote = () => {
    if (!selectedTag) return;
    const updated = voteTag(selectedTag.id);
    if (updated) {
      setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTag(updated);
      toast.success('투표 완료!');
    }
  };

  return (
    <>
      <TagMarkers map={map} tags={tags} onTagClick={handleTagClick} />
      {isOpen && <TagSheet onSelect={handleCreate} onClose={onClose} />}
      {selectedTag && !isOpen && (
        <TagDetailPopup
          tag={selectedTag}
          voted={hasVoted(selectedTag.id)}
          onVote={handleVote}
          onClose={() => setSelectedTag(null)}
        />
      )}
    </>
  );
}
