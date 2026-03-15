'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Check, X, Link2 } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { getWalkMemo, setWalkMemo } from '@/lib/walk-memo';
import DeleteWalkModal from '@/components/walk/DeleteWalkModal';

interface WalkDetailActionsProps {
  walkId: string;
}

export default function WalkDetailActions({ walkId }: WalkDetailActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memo, setMemo] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const saved = getWalkMemo(walkId);
    setMemo(saved);
  }, [walkId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error, count } = await supabase.from('mw_walks').delete({ count: 'exact' }).eq('id', walkId);
      if (error) throw error;
      if (count === 0) throw new Error('삭제 권한이 없어요');
      toast.success('삭제되었어요');
      router.replace('/app/history');
    } catch {
      toast.error('삭제에 실패했어요.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleSaveMemo = () => {
    const trimmed = draft.trim();
    if (!trimmed && !memo) { setEditing(false); return; }
    setWalkMemo(walkId, trimmed);
    setMemo(trimmed);
    setEditing(false);
    if (trimmed) toast.success('메모가 저장되었어요');
  };

  const handleStartEdit = () => {
    setDraft(memo);
    setEditing(true);
  };

  return (
    <>
      {/* 메모 섹션 */}
      <div className="mt-4 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-mw-gray-800">메모</span>
          {!editing && (
            <button
              onClick={handleStartEdit}
              className="flex h-8 w-8 items-center justify-center rounded-mw-sm active:bg-mw-gray-50"
            >
              <Pencil size={15} className="text-mw-gray-400" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="산책에 대한 메모를 남겨보세요"
              className="w-full resize-none rounded-mw border border-mw-gray-200 px-3 py-2 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-300 focus:border-mw-green-400 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-mw-sm bg-mw-gray-100 active:scale-[0.97]"
              >
                <X size={15} className="text-mw-gray-500" />
              </button>
              <button
                onClick={handleSaveMemo}
                className="flex h-8 w-8 items-center justify-center rounded-mw-sm bg-mw-green-500 active:scale-[0.97]"
              >
                <Check size={15} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-[13px] text-mw-gray-500">
            {memo || '메모가 없어요. 연필 아이콘을 눌러 추가해보세요.'}
          </p>
        )}
      </div>

      {/* 링크 복사 버튼 */}
      <button
        onClick={async () => {
          const url = `${window.location.origin}/app/history/${walkId}`;
          try {
            await navigator.clipboard.writeText(url);
            toast.success('링크가 복사되었어요');
          } catch { toast.error('링크 복사에 실패했어요'); }
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-mw bg-mw-green-50 py-3 text-[14px] font-semibold text-mw-green-600 active:scale-[0.97]"
      >
        <Link2 size={16} />
        경로 링크 복사
      </button>

      {/* 삭제 버튼 */}
      <button
        onClick={() => setShowConfirm(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-mw bg-red-50 py-3 text-[14px] font-semibold text-mw-danger active:scale-[0.97]"
      >
        <Trash2 size={16} />
        기록 삭제
      </button>

      {showConfirm && (
        <DeleteWalkModal deleting={deleting} onCancel={() => setShowConfirm(false)} onDelete={handleDelete} />
      )}
    </>
  );
}
