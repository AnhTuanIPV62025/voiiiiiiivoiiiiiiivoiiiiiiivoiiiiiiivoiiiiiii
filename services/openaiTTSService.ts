/**
 * OpenAI Text-to-Speech Service
 * Calls backend API proxy to generate high-quality speech
 */

export interface OpenAITTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  onProgress?: (progress: number) => void;
}

export const OPENAI_VOICES = {
  alloy: { name: 'Alloy', description: 'Trung tính, cân bằng', icon: '🎭' },
  echo: { name: 'Echo', description: 'Nam, trầm ấm', icon: '🎙️' },
  fable: { name: 'Fable', description: 'Anh, ấm áp', icon: '📖' },
  onyx: { name: 'Onyx', description: 'Nam, mạnh mẽ', icon: '💎' },
  nova: { name: 'Nova', description: 'Nữ, trẻ trung', icon: '✨' },
  shimmer: { name: 'Shimmer', description: 'Nữ, nhẹ nhàng', icon: '🌟' },
};

// Backend API URL - sẽ cập nhật sau khi deploy
const API_URL = import.meta.env.VITE_TTS_API_URL || 'http://localhost:3001';

/**
 * Generate speech using OpenAI TTS via backend proxy
 */
export const generateOpenAITTS = async (
  text: string,
  options: OpenAITTSOptions = {}
): Promise<Blob> => {
  const { voice = 'alloy', model = 'tts-1', onProgress } = options;

  // Validation
  if (!text || text.length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (text.length > 4096) {
    throw new Error('Text too long (maximum 4096 characters)');
  }

  try {
    // Start progress
    if (onProgress) onProgress(10);

    const response = await fetch(`${API_URL}/api/tts/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        model,
      }),
    });

    // Update progress
    if (onProgress) onProgress(50);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Complete progress
    if (onProgress) onProgress(100);

    return audioBlob;
  } catch (error) {
    console.error('OpenAI TTS error:', error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to generate speech');
    }
  }
};

/**
 * Play audio blob
 */
export const playAudioBlob = (blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Audio playback failed'));
    };

    audio.play().catch(reject);
  });
};

/**
 * Check if backend API is available
 */
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Backend API not available:', error);
    return false;
  }
};
