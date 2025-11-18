export interface Voice {
    id: string;
    name: string;
    description: string;
    lang?: string;
    isDefault?: boolean;
    region?: 'north' | 'central' | 'south' | 'other'; // Vùng miền
    gender?: 'male' | 'female';
}

// Voice categories for Vietnamese
export const VIETNAMESE_REGIONS = {
    north: { label: 'Miền Bắc', icon: '🏔️' },
    central: { label: 'Miền Trung', icon: '🌊' },
    south: { label: 'Miền Nam', icon: '🌴' },
};

// Reading styles with optimized settings
export const READING_STYLES = {
    story: {
        name: 'Đọc Truyện',
        icon: '📖',
        description: 'Giọng kể chuyện, nhịp điệu chậm rãi',
        settings: { rate: 0.9, pitch: 1.0, volume: 1.0 },
    },
    news: {
        name: 'Tin Tức',
        icon: '📰',
        description: 'Giọng đọc tin tức, rõ ràng, trang trọng',
        settings: { rate: 1.0, pitch: 1.0, volume: 1.0 },
    },
    emotional: {
        name: 'Tình Cảm',
        icon: '💝',
        description: 'Giọng đọc tình cảm, truyền cảm',
        settings: { rate: 0.85, pitch: 1.1, volume: 1.0 },
    },
    fast: {
        name: 'Nhanh',
        icon: '⚡',
        description: 'Tốc độ nhanh',
        settings: { rate: 1.3, pitch: 1.0, volume: 1.0 },
    },
};

// Supported languages (focus on Vietnamese + 3 others)
export const SUPPORTED_LANGUAGES = {
    'vi': { name: 'Tiếng Việt', flag: '🇻🇳', priority: 1 },
    'en': { name: 'English', flag: '🇬🇧', priority: 2 },
    'zh': { name: '中文', flag: '🇨🇳', priority: 3 },
    'ja': { name: '日本語', flag: '🇯🇵', priority: 4 },
};

// Filter function to get only supported languages
export const isSupportedLanguage = (lang: string): boolean => {
    if (!lang) return false;
    const prefix = lang.split('-')[0].toLowerCase();
    return prefix in SUPPORTED_LANGUAGES;
};

// Categorize Vietnamese voice by region (based on voice name patterns)
export const categorizeVietnameseVoice = (voiceName: string): 'north' | 'central' | 'south' | 'other' => {
    const name = voiceName.toLowerCase();

    // Pattern matching for regions (heuristic)
    if (name.includes('hà nội') || name.includes('hanoi') || name.includes('bắc')) {
        return 'north';
    }
    if (name.includes('huế') || name.includes('hue') || name.includes('trung')) {
        return 'central';
    }
    if (name.includes('sài gòn') || name.includes('saigon') || name.includes('nam') ||
        name.includes('miền nam') || name.includes('southern')) {
        return 'south';
    }

    // Default to south for generic Vietnamese voices
    return 'south';
};

// These are placeholder voices that will be replaced by browser voices at runtime
export const VOICES: Voice[] = [];

// Default text for Vietnamese
export const DEFAULT_TEXT = 'Xin chào! Chào mừng bạn đến với trình đọc văn bản AI. Ứng dụng hỗ trợ nhiều giọng đọc tiếng Việt theo vùng miền: Bắc, Trung, Nam. Bạn có thể chọn phong cách đọc truyện, tin tức, hoặc tình cảm. Hãy nhập văn bản và chọn giọng nói bên dưới để bắt đầu.';

// Default settings for speech synthesis
export const DEFAULT_SPEECH_SETTINGS = {
    rate: 1.0,      // Speed: 0.1 to 10
    pitch: 1.0,     // Pitch: 0 to 2
    volume: 1.0,    // Volume: 0 to 1
};