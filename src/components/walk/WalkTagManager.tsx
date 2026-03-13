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

  const handleCreate = (tagType: TagType, description: string | null) => {
    if (!position) {
      toast.error('현재 위치를 확인할 수 없어요.');
      return;
    }
    const tag = saveTag({ tagType, description, location: position });
    setTags((prev) => [tag, ...prev]);
    onClose();
    toast.success('태그가 등록되었어요!');
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
