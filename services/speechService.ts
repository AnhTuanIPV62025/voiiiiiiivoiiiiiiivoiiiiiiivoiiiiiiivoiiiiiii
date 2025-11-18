/**
 * Web Speech API service for text-to-speech
 * This uses the browser's built-in speech synthesis - no API key required!
 */

export interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onProgress?: (progress: number) => void; // Progress callback (0-100)
}

/**
 * Get all available voices from the browser
 */
export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Chrome loads voices asynchronously
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};

/**
 * Get Vietnamese voices specifically
 */
export const getVietnameseVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  const allVoices = await getAvailableVoices();
  return allVoices.filter(voice => voice.lang.startsWith('vi'));
};

/**
 * Generate speech from text using Web Speech API
 * Returns a Promise that resolves when speech is complete
 */
export const generateSpeech = async (
  text: string,
  voiceId: string,
  options: SpeechOptions = {}
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if speech synthesis is supported
      if (!('speechSynthesis' in window)) {
        throw new Error('Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản. Vui lòng sử dụng Chrome, Firefox, hoặc Edge.');
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Get all voices and find the selected one
      const voices = await getAvailableVoices();
      const selectedVoice = voices.find(v => v.name === voiceId);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (options.voice) {
        utterance.voice = options.voice;
      }

      // Set options
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Track progress via boundary events (word/sentence boundaries)
      if (options.onProgress) {
        utterance.onboundary = (event) => {
          // Calculate progress based on character index
          const progress = Math.round((event.charIndex / text.length) * 100);
          options.onProgress!(Math.min(100, progress));
        };

        // Initial progress
        options.onProgress(0);
      }

      // Handle events
      utterance.onstart = () => {
        if (options.onProgress) {
          options.onProgress(5); // Show initial progress when starting
        }
      };

      utterance.onend = () => {
        if (options.onProgress) {
          options.onProgress(100); // Complete
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error('Đã xảy ra lỗi khi tạo giọng nói. Vui lòng thử lại.'));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech generation error:', error);
      reject(error);
    }
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = (): void => {
  speechSynthesis.cancel();
};

/**
 * Pause ongoing speech
 */
export const pauseSpeech = (): void => {
  speechSynthesis.pause();
};

/**
 * Resume paused speech
 */
export const resumeSpeech = (): void => {
  speechSynthesis.resume();
};

/**
 * Check if speech is currently being synthesized
 */
export const isSpeaking = (): boolean => {
  return speechSynthesis.speaking;
};
