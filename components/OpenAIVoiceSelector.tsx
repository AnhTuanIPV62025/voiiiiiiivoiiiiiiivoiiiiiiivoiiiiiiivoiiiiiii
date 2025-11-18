import React from 'react';
import { OPENAI_VOICES } from '../services/openaiTTSService';

interface OpenAIVoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
}

export const OpenAIVoiceSelector: React.FC<OpenAIVoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
}) => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">
        🎙️ Chọn giọng OpenAI
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(OPENAI_VOICES).map(([key, voice]) => (
          <button
            key={key}
            onClick={() => onSelectVoice(key)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedVoice === key
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{voice.icon}</div>
              <div className="font-bold text-gray-800 dark:text-white mb-1">
                {voice.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {voice.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
        ℹ️ <strong>Lưu ý:</strong> OpenAI TTS không có giọng tiếng Việt riêng.
        Các giọng này sẽ đọc tiếng Việt với accent tiếng Anh.
      </div>
    </div>
  );
};
