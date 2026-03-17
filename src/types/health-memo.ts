export type PoopStatus = 'none' | 'normal' | 'soft' | 'hard' | 'diarrhea';

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface HealthMemo {
  poopStatus: PoopStatus;
  energyLevel: EnergyLevel;
  note: string;
}

export const POOP_OPTIONS: { value: PoopStatus; emoji: string; label: string }[] = [
  { value: 'none', emoji: '🚫', label: '없음' },
  { value: 'normal', emoji: '💩', label: '정상' },
  { value: 'soft', emoji: '💧', label: '무름' },
  { value: 'hard', emoji: '🪨', label: '딱딱' },
  { value: 'diarrhea', emoji: '🌊', label: '설사' },
];
