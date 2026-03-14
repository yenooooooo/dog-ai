'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';

import { ALL_ARTICLES, CATEGORIES, type ReadingArticle } from '@/lib/reading';
import ArticleViewer from '@/components/reading/ArticleViewer';
import { cn } from '@/lib/utils';

export default function ReadingPage() {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<ReadingArticle | null>(null);

  const filtered = category === 'all'
    ? ALL_ARTICLES
    : ALL_ARTICLES.filter((a) => a.category === category);

  if (selected) {
    return <ArticleViewer article={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50">
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-mw-green-500" />
          <h1 className="text-[17px] font-bold text-mw-gray-900">읽을거리</h1>
        </div>
      </header>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto bg-white px-4 pb-3 pt-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
              category === c.id
                ? 'bg-mw-green-500 text-white'
                : 'bg-mw-gray-100 text-mw-gray-600'
            )}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* 글 리스트 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="flex flex-col gap-2">
          {filtered.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelected(article)}
              className="flex items-center gap-3 rounded-mw-lg border border-mw-gray-100 bg-white px-4 py-4 text-left transition-colors active:bg-mw-gray-50"
            >
              <span className="text-[28px]">{article.emoji}</span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-mw-gray-900">{article.title}</p>
                <p className="mt-0.5 text-[11px] text-mw-gray-400">{article.category} · {article.content.length}문단</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
