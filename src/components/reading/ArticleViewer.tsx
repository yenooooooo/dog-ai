'use client';

import { ArrowLeft } from 'lucide-react';

import type { ReadingArticle } from '@/lib/reading';

interface ArticleViewerProps {
  article: ReadingArticle;
  onBack: () => void;
}

export default function ArticleViewer({ article, onBack }: ArticleViewerProps) {
  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-mw-gray-900">{article.title}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[32px]">{article.emoji}</span>
          <div>
            <p className="text-[20px] font-bold text-mw-gray-900">{article.title}</p>
            <p className="text-[12px] text-mw-gray-400">{article.category}</p>
          </div>
        </div>

        <div className="rounded-mw-lg bg-white p-5">
          {article.content.map((paragraph, i) => (
            <p
              key={i}
              className="mt-4 text-[14px] leading-[1.8] text-mw-gray-700 first:mt-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
