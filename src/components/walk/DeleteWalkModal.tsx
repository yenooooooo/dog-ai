'use client';

interface DeleteWalkModalProps {
  deleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export default function DeleteWalkModal({ deleting, onCancel, onDelete }: DeleteWalkModalProps) {
  return (
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
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-mw bg-mw-gray-100 py-3 text-[14px] font-semibold text-mw-gray-600 active:scale-[0.97] disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex-1 rounded-mw bg-mw-danger py-3 text-[14px] font-semibold text-white active:scale-[0.97] disabled:opacity-50"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
