import { toPng } from 'html-to-image';

const PIXEL_RATIO = 3; // 360×450 → 1080×1350 (인스타 4:5)

export async function captureShareCard(
  element: HTMLElement
): Promise<string> {
  return toPng(element, {
    pixelRatio: PIXEL_RATIO,
    quality: 0.95,
  });
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/** Web Share API로 공유 시도, 불가하면 false 반환 */
export async function shareImage(dataUrl: string): Promise<boolean> {
  if (!navigator.share) return false;

  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], 'mungwalk.png', { type: 'image/png' });

  if (!navigator.canShare?.({ files: [file] })) return false;

  await navigator.share({
    title: '멍산책',
    text: '오늘의 산책 기록 🐾',
    files: [file],
  });
  return true;
}
