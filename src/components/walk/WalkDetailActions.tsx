'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { getWalkMemo, setWalkMemo } from '@/lib/walk-memo';

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
    setWalkMemo(walkId, draft);
    setMemo(draft.trim());
    setEditing(false);
    toast.success('메모가 저장되었어요');
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

      {/* 삭제 버튼 */}
      <button
        onClick={() => setShowConfirm(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-mw bg-red-50 py-3 text-[14px] font-semibold text-mw-danger active:scale-[0.97]"
      >
        <Trash2 size={16} />
        기록 삭제
      </button>

      {/* 삭제 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-mw-xl bg-white px-6 pb-6 pt-8 text-center">
            <p className="text-[17px] font-bold text-mw-gray-900">
              이 산책 기록을 삭제할까요?
            </p>
            <p className="mt-2 text-[13px] text-mw-gray-500">
              삭제하면 되돌릴 수 없어요.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-mw bg-mw-gray-100 py-3 text-[14px] font-semibold text-mw-gray-600 active:scale-[0.97] disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-mw bg-mw-danger py-3 text-[14px] font-semibold text-white active:scale-[0.97] disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
