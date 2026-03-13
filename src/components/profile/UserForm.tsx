'use client';

import { useState } from 'react';

import type { StoredUser } from '@/lib/profile-storage';

interface UserFormProps {
  initialData?: StoredUser;
  onSave: (data: StoredUser) => void;
  onCancel?: () => void;
}

const inputClass =
  'mt-1 w-full rounded-mw-sm border border-mw-gray-100 px-4 py-3 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:border-mw-green-500 focus:outline-none';

export default function UserForm({
  initialData,
  onSave,
  onCancel,
}: UserFormProps) {
  const [nickname, setNickname] = useState(initialData?.nickname ?? '');
  const [neighborhood, setNeighborhood] = useState(
    initialData?.neighborhood ?? ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onSave({ nickname: nickname.trim(), neighborhood: neighborhood.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">
          닉네임 *
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-mw-gray-600">
          동네
        </label>
        <input
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="예: 합정동"
          maxLength={30}
          className={inputClass}
        />
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-mw border border-mw-gray-200 py-3 text-[14px] font-medium text-mw-gray-600 transition-transform active:scale-[0.97]"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={!nickname.trim()}
          className="flex-1 rounded-mw bg-mw-green-500 py-3 text-[14px] font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
        >
          저장
        </button>
      </div>
    </form>
  );
}
