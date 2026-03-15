const STORAGE_KEY = 'mw_route_reviews';

export interface RouteReviewData {
  rating: number;
  comment: string;
}

interface ReviewMap {
  [walkId: string]: RouteReviewData;
}

function loadReviews(): ReviewMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReviewMap;
  } catch {
    return {};
  }
}

function saveReviews(reviews: ReviewMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // 저장 실패 무시
  }
}

export function saveRouteReview(
  walkId: string,
  rating: number,
  comment: string
): void {
  const reviews = loadReviews();
  reviews[walkId] = {
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment: comment.trim(),
  };
  saveReviews(reviews);
}

export function getRouteReview(walkId: string): RouteReviewData | null {
  const reviews = loadReviews();
  return reviews[walkId] ?? null;
}
