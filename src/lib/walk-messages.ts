/** 산책 완료 시 보여줄 감성 멘트 (랜덤) */
const MESSAGES_WITH_PET = [
  (name: string, km: string) => `${name}와 ${km}km! 행복한 시간이었어요 🐾`,
  (name: string) => `${name}가 오늘도 즐거워했을 거예요 💛`,
  (name: string, km: string) => `${km}km 완주! ${name}에게 간식 하나 줄까요? 🦴`,
  (name: string) => `${name}와의 산책, 오늘도 최고였어요! ⭐`,
  (name: string, km: string) => `대단해요! ${name}와 함께 ${km}km 🎉`,
];

const MESSAGES_NO_PET = [
  (km: string) => `${km}km 완주! 오늘도 멋진 산책이었어요 🐾`,
  (km: string) => `${km}km! 강아지가 행복해했을 거예요 💛`,
  () => '오늘의 산책, 수고했어요! ⭐',
  (km: string) => `대단해요! ${km}km 달성 🎉`,
  () => '좋은 산책이었어요. 내일도 함께해요! 🐕',
];

export function getWalkCompleteMessage(petName?: string, km?: string): string {
  if (petName) {
    const fn = MESSAGES_WITH_PET[Math.floor(Math.random() * MESSAGES_WITH_PET.length)];
    return fn(petName, km ?? '0');
  }
  const fn = MESSAGES_NO_PET[Math.floor(Math.random() * MESSAGES_NO_PET.length)];
  return fn(km ?? '0');
}
