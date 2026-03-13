'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import {
  getPetById,
  updatePet,
  deletePet,
  type StoredPet,
} from '@/lib/profile-storage';
import PetForm from '@/components/profile/PetForm';

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<StoredPet | null>(null);

  useEffect(() => {
    const data = getPetById(id);
    if (!data) {
      router.replace('/app/profile');
      return;
    }
    setPet(data);
  }, [id, router]);

  if (!pet) return null;

  return (
    <div className="flex h-full flex-col bg-mw-gray-50">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-mw-sm active:bg-mw-gray-50"
        >
          <ArrowLeft size={20} className="text-mw-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-mw-gray-900">
          {pet.name} 수정
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div className="rounded-mw-lg border border-mw-gray-100 bg-white p-5">
          <PetForm
            initialData={pet}
            onSave={(data) => {
              updatePet(id, data);
              toast.success('반려견 정보가 수정되었어요!');
              router.push('/app/profile');
            }}
            onDelete={() => {
              deletePet(id);
              toast.success('반려견이 삭제되었어요.');
              router.push('/app/profile');
            }}
          />
        </div>
      </div>
    </div>
  );
}
