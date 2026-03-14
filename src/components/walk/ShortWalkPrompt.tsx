'use client';

interface ShortWalkPromptProps {
  distance: number;
  durationSec: number;
  onSave: () => void;
  onDiscard: () => void;
}

export default function ShortWalkPrompt({
  distance,
  durationSec,
  onSave,
  onDiscard,
}: ShortWalkPromptProps) {
  const distText = distance < 10 ? `${Math.round(distance)}m` : '';
  const timeText = durationSec < 30 ? `${durationSec}초` : '';
  const detail = [distText, timeText].filter(Boolean).join(' / ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-6 w-full max-w-sm animate-slide-up rounded-mw-xl bg-white px-6 pb-6 pt-8 text-center">
        <p className="text-[17px] font-bold text-mw-gray-900">
          짧은 산책이에요
        </p>
        <p className="mt-2 text-[14px] text-mw-gray-500">
          {detail && <span className="font-medium text-mw-gray-700">{detail}</span>}
          {detail ? '의 ' : ''}짧은 산책이에요.{'\n'}저장할까요?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 rounded-mw bg-mw-gray-100 py-3 text-[14px] font-semibold text-mw-gray-600 active:scale-[0.97]"
          >
            삭제하기
          </button>
          <button
            onClick={onSave}
            className="flex-1 rounded-mw bg-mw-green-500 py-3 text-[14px] font-semibold text-white active:scale-[0.97]"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
