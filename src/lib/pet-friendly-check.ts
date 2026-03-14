import { getTags } from '@/lib/tag-storage';
import { getDistanceMeters } from '@/lib/geo-utils';

/**
 * 특정 좌표 근처(50m)에 pet_allowed / pet_banned 태그가 있는지 확인.
 * 크라우드소싱 데이터로 동반 여부를 보강.
 */
export function checkCrowdsourcedPetStatus(
  lat: number,
  lng: number
): { allowed: number; banned: number } {
  const tags = getTags();
  let allowed = 0;
  let banned = 0;

  for (const tag of tags) {
    const dist = getDistanceMeters(
      { lat, lng },
      { lat: tag.location.lat, lng: tag.location.lng }
    );
    if (dist > 50) continue;
    if (tag.tagType === 'pet_allowed') allowed++;
    if (tag.tagType === 'pet_banned') banned++;
  }

  return { allowed, banned };
}

/**
 * API petFriendly + 크라우드소싱 결합하여 최종 동반 여부 판정
 */
export function combinePetStatus(
  apiStatus: string,
  crowdsourced: { allowed: number; banned: number }
): string {
  // 크라우드소싱에서 확인된 경우 우선
  if (crowdsourced.banned > 0 && crowdsourced.banned >= crowdsourced.allowed) return 'banned';
  if (crowdsourced.allowed >= 2) return 'verified';
  if (crowdsourced.allowed === 1) return 'yes';
  return apiStatus;
}
