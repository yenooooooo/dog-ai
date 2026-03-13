let loadPromise: Promise<void> | null = null;

export function loadKakaoMapSDK(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('카카오맵 SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
