export interface Voice {
    id: string;
    name: string;
    description: string;
    baseVoice?: string; // To handle aliased voices like the custom Vietnamese one
}

export const VOICES: Voice[] = [
  { id: 'Mai', name: 'Mai (Việt Nam)', description: 'Nữ - Kể chuyện', baseVoice: 'Kore' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Nam, Thân thiện' },
  { id: 'Kore', name: 'Kore', description: 'Nữ, Điềm tĩnh' },
  { id: 'Puck', name: 'Puck', description: 'Nam, Năng động' },
  { id: 'Charon', name: 'Charon', description: 'Nam, Giọng trầm' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Nữ, Uy quyền' },
  { id: 'Ares', name: 'Ares', description: 'Nam, Quyết đoán' },
  { id: 'Charna', name: 'Charna', description: 'Nữ, Tinh nghịch' },
  { id: 'Chiron', name: 'Chiron', description: 'Nam, Trí tuệ' },
];