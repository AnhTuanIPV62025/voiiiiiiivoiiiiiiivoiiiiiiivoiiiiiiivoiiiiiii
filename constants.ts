export interface Voice {
    id: string;
    name: string;
    description: string;
    lang?: string;
    isDefault?: boolean;
    region?: 'north' | 'central' | 'south' | 'other'; // Vùng miền
    gender?: 'male' | 'female' | 'unknown';
    age?: 'child' | 'young' | 'adult' | 'elderly' | 'unknown'; // Độ tuổi
}

// Voice categories for Vietnamese
export const VIETNAMESE_REGIONS = {
    north: { label: 'Miền Bắc', icon: '🏔️' },
    central: { label: 'Miền Trung', icon: '🌊' },
    south: { label: 'Miền Nam', icon: '🌴' },
};

// Gender labels
export const GENDER_LABELS = {
    male: { label: 'Nam', icon: '👨' },
    female: { label: 'Nữ', icon: '👩' },
    unknown: { label: 'Khác', icon: '👤' },
};

// Age labels
export const AGE_LABELS = {
    child: { label: 'Trẻ em', icon: '👶' },
    young: { label: 'Trẻ', icon: '🧑' },
    adult: { label: 'Trung niên', icon: '👤' },
    elderly: { label: 'Lớn tuổi', icon: '👴' },
    unknown: { label: 'Không rõ', icon: '❓' },
};

// Reading styles with optimized settings - UU TIEN DOC TRUYEN
export const READING_STYLES = {
    story: {
        name: 'Đọc Truyện',
        icon: '📖',
        description: 'Kể chuyện nhịp nhàng, sống động',
        settings: { rate: 0.9, pitch: 1.0, volume: 1.0 },
        priority: 1,
    },
    romance: {
        name: 'Lãng Mạn',
        icon: '💕',
        description: 'Ngọt ngào, lãng mạn, truyền cảm',
        settings: { rate: 0.85, pitch: 1.15, volume: 0.95 },
        priority: 2,
    },
    mystery: {
        name: 'Huyền Bí',
        icon: '🔮',
        description: 'Bí ẩn, hồi hộp, gay cấn',
        settings: { rate: 0.95, pitch: 0.9, volume: 1.0 },
        priority: 3,
    },
    horror: {
        name: 'Kinh Dị',
        icon: '👻',
        description: 'Rùng rợn, căng thẳng',
        settings: { rate: 0.8, pitch: 0.85, volume: 1.0 },
        priority: 4,
    },
    emotional: {
        name: 'Tình Cảm',
        icon: '💝',
        description: 'Sâu lắng, cảm động',
        settings: { rate: 0.85, pitch: 1.1, volume: 1.0 },
        priority: 5,
    },
    fairytale: {
        name: 'Cổ Tích',
        icon: '🧚',
        description: 'Nhẹ nhàng, dễ thương',
        settings: { rate: 0.95, pitch: 1.2, volume: 1.0 },
        priority: 6,
    },
    news: {
        name: 'Tin Tức',
        icon: '📰',
        description: 'Rõ ràng, trang trọng',
        settings: { rate: 1.0, pitch: 1.0, volume: 1.0 },
        priority: 7,
    },
    fast: {
        name: 'Nhanh',
        icon: '⚡',
        description: 'Tốc độ cao',
        settings: { rate: 1.3, pitch: 1.0, volume: 1.0 },
        priority: 8,
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

// Detect gender from voice name
export const detectGender = (voiceName: string): 'male' | 'female' | 'unknown' => {
    const name = voiceName.toLowerCase();

    // Female indicators
    if (name.includes('female') || name.includes('woman') || name.includes('nữ') ||
        name.includes('girl') || name.includes('linh') || name.includes('mai') ||
        name.includes('hoa') || name.includes('lan') || name.includes('hương') ||
        name.includes('thảo') || name.includes('vy') || name.includes('anh') ||
        name.match(/\b(she|her|ms|miss|mrs)\b/)) {
        return 'female';
    }

    // Male indicators
    if (name.includes('male') || name.includes('man') || name.includes('nam') ||
        name.includes('boy') || name.includes('minh') || name.includes('dũng') ||
        name.includes('hùng') || name.includes('tuấn') || name.includes('khoa') ||
        name.match(/\b(he|his|mr|mister)\b/)) {
        return 'male';
    }

    return 'unknown';
};

// Detect age from voice name
export const detectAge = (voiceName: string): 'child' | 'young' | 'adult' | 'elderly' | 'unknown' => {
    const name = voiceName.toLowerCase();

    if (name.includes('child') || name.includes('kid') || name.includes('trẻ em') ||
        name.includes('bé') || name.includes('nhỏ')) {
        return 'child';
    }

    if (name.includes('young') || name.includes('youth') || name.includes('trẻ') ||
        name.includes('teen')) {
        return 'young';
    }

    if (name.includes('old') || name.includes('elderly') || name.includes('senior') ||
        name.includes('già') || name.includes('lớn tuổi')) {
        return 'elderly';
    }

    // Default to adult if no age indicator
    return 'adult';
};

// Categorize Vietnamese voice by region (based on voice name patterns)
export const categorizeVietnameseVoice = (voiceName: string): 'north' | 'central' | 'south' | 'other' => {
    const name = voiceName.toLowerCase();

    // Pattern matching for regions (heuristic)
    if (name.includes('hà nội') || name.includes('hanoi') || name.includes('bắc') ||
        name.includes('northern') || name.includes('north')) {
        return 'north';
    }
    if (name.includes('huế') || name.includes('hue') || name.includes('trung') ||
        name.includes('central') || name.includes('đà nẵng') || name.includes('danang')) {
        return 'central';
    }
    if (name.includes('sài gòn') || name.includes('saigon') || name.includes('nam') ||
        name.includes('miền nam') || name.includes('southern') || name.includes('south') ||
        name.includes('tp hcm') || name.includes('hcm')) {
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

// TTS Engine options
export const TTS_ENGINES = {
    webSpeech: {
        id: 'webSpeech',
        name: 'Web Speech API',
        description: 'Miễn phí, chạy trên browser',
        icon: '🎤',
        isFree: true,
        features: ['Offline', 'Không giới hạn', 'Giọng địa phương'],
    },
    openai: {
        id: 'openai',
        name: 'OpenAI TTS',
        description: 'Chất lượng cao, tiếng Anh tốt',
        icon: '🤖',
        isFree: false,
        features: ['Chất lượng cao', '6 giọng', 'Tiếng Anh chuẩn'],
        cost: '$15-30/1M ký tự',
    },
};