'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

import type { Coordinate } from '@/types/route';
import type { WalkPhoto } from '@/types/walk-photo';

interface PhotoCaptureProps {
  position: Coordinate | null;
}

const STORAGE_KEY = 'mw_walk_photos';
const MAX_PHOTOS = 20;

function getPhotos(): WalkPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WalkPhoto[];
  } catch {
    return [];
  }
}

function savePhotos(photos: WalkPhoto[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function getWalkPhotos(): WalkPhoto[] {
  return getPhotos();
}

export function clearWalkPhotos(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default function PhotoCapture({ position }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<WalkPhoto[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(getPhotos());
  }, []);

  const handleCapture = () => {
    if (!position) {
      toast.error('현재 위치를 확인할 수 없어요.');
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !position) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const photo: WalkPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        dataUrl,
        coordinate: { lat: position.lat, lng: position.lng },
        timestamp: Date.now(),
      };
      const updated = [...getPhotos(), photo].slice(-MAX_PHOTOS);
      savePhotos(updated);
      setPhotos(updated);
      toast.success('사진이 저장되었어요!');
    };
    reader.readAsDataURL(file);
    // input 리셋 (같은 파일 재선택 허용)
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    const updated = getPhotos().filter((p) => p.id !== id);
    savePhotos(updated);
    setPhotos(updated);
  };

  return (
    <>
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        onChange={handleFileChange} className="hidden"
      />
      <button onClick={handleCapture} className="flex flex-1 items-center justify-center gap-2 rounded-mw bg-white/90 py-3.5 shadow-sm backdrop-blur active:scale-[0.97]">
        <Camera size={16} className="text-mw-green-500" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-mw-gray-800">사진</span>
      </button>

      {/* 최근 사진 썸네일 미리보기 */}
      {photos.length > 0 && (
        <div className="absolute bottom-36 left-4 z-30 flex gap-1.5">
          {photos.slice(-3).map((p) => (
            <div key={p.id} className="relative h-12 w-12 overflow-hidden rounded-lg shadow-sm">
              <img src={p.dataUrl} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
