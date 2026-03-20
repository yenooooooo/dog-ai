'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 나침반 센서 (DeviceOrientationEvent)
 * - 서 있을 때 핸드폰이 가리키는 방향 (0=북, 90=동)
 * - iOS Safari: requestPermission 필요
 * - Android Chrome: 바로 사용 가능
 */
export function useCompass() {
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastRef = useRef(0);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const now = Date.now();
    // 100ms 쓰로틀 (너무 자주 업데이트하면 성능 저하)
    if (now - lastRef.current < 100) return;
    lastRef.current = now;

    // iOS: webkitCompassHeading (0=북, 시계방향)
    // Android: alpha (0~360, 반시계방향이므로 360 - alpha)
    const evt = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    let heading: number | null = null;

    if (typeof evt.webkitCompassHeading === 'number') {
      heading = evt.webkitCompassHeading;
    } else if (typeof e.alpha === 'number') {
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      setCompassHeading(Math.round(heading));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setPermissionDenied(true);
        }
      } catch {
        setPermissionDenied(true);
      }
    } else {
      // Android: 권한 요청 불필요
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }, [handleOrientation]);

  useEffect(() => {
    requestPermission();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [requestPermission, handleOrientation]);

  return { compassHeading, permissionDenied };
}
