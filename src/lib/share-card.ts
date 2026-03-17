import { toPng } from 'html-to-image';

const PIXEL_RATIO = 3; // 360×640 → 1080×1920 (인스타 스토리 9:16)

export async function captureShareCard(
  element: HTMLElement
): Promise<string> {
  return toPng(element, {
    pixelRatio: PIXEL_RATIO,
    quality: 0.95,
  });
}

export async function downloadImage(dataUrl: string, filename: string): Promise<void> {
  // iOS Safari는 data URL download 미지원 → Blob URL 사용
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
