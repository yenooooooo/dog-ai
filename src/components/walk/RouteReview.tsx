'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RouteReviewProps {
  onReview: (rating: number, comment: string) => void;
}

export default function RouteReview({ onReview }: RouteReviewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const displayRating = hoveredStar || rating;

  const handleStarClick = (star: number) => {
    setRating(star);
    onReview(star, comment);
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    if (rating > 0) onReview(rating, value);
  };

  return (
    <div className="rounded-mw-lg bg-white/80 p-4">
      <p className="text-center text-[14px] font-semibold text-mw-gray-800">
        이 경로는 어땠나요?
      </p>

      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-1 transition-transform active:scale-[0.9]"
          >
            <Star
              size={28}
              className={cn(
                'transition-colors',
                star <= displayRating
                  ? 'text-mw-amber-500'
                  : 'text-mw-gray-200'
              )}
              fill={star <= displayRating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <textarea
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          maxLength={100}
          rows={2}
          placeholder="한줄평을 남겨보세요 (선택)"
          className="mt-3 w-full resize-none rounded-mw border border-mw-gray-200 px-3 py-2 text-[14px] text-mw-gray-800 placeholder:text-mw-gray-300 focus:border-mw-green-400 focus:outline-none"
        />
      )}
    </div>
  );
}
