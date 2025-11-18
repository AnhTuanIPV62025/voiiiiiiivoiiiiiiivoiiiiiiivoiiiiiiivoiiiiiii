export interface Voice {
    id: string;
    name: string;
    description: string;
    lang?: string;
    isDefault?: boolean;
}

// These are placeholder voices that will be replaced by browser voices at runtime
export const VOICES: Voice[] = [];

// Default text for Vietnamese
export const DEFAULT_TEXT = 'Xin chào! Chào mừng bạn đến với trình tạo Giọng nói AI. Bạn có thể nhập văn bản và chọn giọng nói bên dưới để nghe.';

// Settings for speech synthesis
export const SPEECH_SETTINGS = {
  rate: 1.0,      // Speed: 0.1 to 10
  pitch: 1.0,     // Pitch: 0 to 2
  volume: 1.0,    // Volume: 0 to 1
};