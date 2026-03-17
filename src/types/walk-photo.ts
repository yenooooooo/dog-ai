/** 산책 중 촬영한 사진 */
export interface WalkPhoto {
  id: string;
  dataUrl: string;
  coordinate: { lat: number; lng: number };
  timestamp: number;
  walkId?: string;
}

/** 지도 위 사진 핀 표시용 */
export interface PhotoPin {
  coordinate: { lat: number; lng: number };
  thumbnailUrl: string;
}
