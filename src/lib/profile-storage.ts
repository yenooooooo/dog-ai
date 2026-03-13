import type { PetSize } from '@/types/database';

export interface StoredUser {
  nickname: string;
  neighborhood: string;
}

export interface StoredPet {
  id: string;
  name: string;
  breed: string;
  ageMonths: number | null;
  size: PetSize | null;
}

const USER_KEY = 'mw_user_profile';
const PETS_KEY = 'mw_pets';

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function saveUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getPets(): StoredPet[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredPet[];
  } catch {
    return [];
  }
}

export function getPetById(id: string): StoredPet | null {
  return getPets().find((p) => p.id === id) ?? null;
}

export function savePet(pet: Omit<StoredPet, 'id'>): StoredPet {
  const pets = getPets();
  const newPet: StoredPet = {
    ...pet,
    id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  pets.push(newPet);
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  return newPet;
}

export function updatePet(
  id: string,
  data: Partial<Omit<StoredPet, 'id'>>
): StoredPet | null {
  const pets = getPets();
  const idx = pets.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pets[idx] = { ...pets[idx], ...data };
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  return pets[idx];
}

export function deletePet(id: string): void {
  const pets = getPets().filter((p) => p.id !== id);
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
}
