'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface PetInfo {
  name: string;
  breed: string;
  ageMonths: number | null;
  size: string | null;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface TrainingChatProps {
  petInfo: PetInfo | null;
}

export default function TrainingChat({ petInfo }: TrainingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/training/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, petInfo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      toast.error('답변을 가져오지 못했어요.');
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col rounded-mw-lg border border-mw-gray-100 bg-white">
      <div className="border-b border-mw-gray-50 px-4 py-3">
        <p className="text-[14px] font-bold text-mw-gray-900">🤖 AI 훈련 상담</p>
        <p className="text-[11px] text-mw-gray-400">
          {petInfo ? `${petInfo.name}에 맞는 맞춤 상담` : '반려견을 등록하면 맞춤 상담이 가능해요'}
        </p>
      </div>

      <div ref={scrollRef} className="flex max-h-[300px] min-h-[150px] flex-col gap-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="py-6 text-center text-[13px] text-mw-gray-400">
            훈련 관련 궁금한 점을 물어보세요!
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-mw-lg px-3 py-2 text-[13px] leading-relaxed ${
              m.role === 'user'
                ? 'bg-mw-green-500 text-white'
                : 'bg-mw-gray-50 text-mw-gray-800'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-mw-lg bg-mw-gray-50 px-3 py-2 text-[13px] text-mw-gray-400">
              답변 작성 중...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-mw-gray-50 px-3 py-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 강아지가 물어요"
          maxLength={200}
          className="flex-1 rounded-mw-sm bg-mw-gray-50 px-3 py-2.5 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-mw-sm bg-mw-green-500 text-white disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>

      <p className="px-4 pb-2 text-[10px] text-mw-gray-300">
        AI 답변은 참고용이며 전문 훈련사 상담을 대체하지 않습니다
      </p>
    </div>
  );
}
