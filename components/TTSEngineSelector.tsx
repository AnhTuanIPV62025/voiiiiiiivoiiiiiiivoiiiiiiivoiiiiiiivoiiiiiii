import React from 'react';
import { TTS_ENGINES } from '../constants';

interface TTSEngineSelectorProps {
  selectedEngine: 'webSpeech' | 'openai';
  onSelectEngine: (engine: 'webSpeech' | 'openai') => void;
  apiAvailable: boolean;
}

export const TTSEngineSelector: React.FC<TTSEngineSelectorProps> = ({
  selectedEngine,
  onSelectEngine,
  apiAvailable,
}) => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">
        ⚙️ Chọn Engine TTS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Web Speech API */}
        <button
          onClick={() => onSelectEngine('webSpeech')}
          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedEngine === 'webSpeech'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{TTS_ENGINES.webSpeech.icon}</span>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {TTS_ENGINES.webSpeech.name}
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  MIỄN PHÍ
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {TTS_ENGINES.webSpeech.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {TTS_ENGINES.webSpeech.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
            {selectedEngine === 'webSpeech' && (
              <div className="ml-2">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* OpenAI TTS */}
        <button
          onClick={() => onSelectEngine('openai')}
          disabled={!apiAvailable}
          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            !apiAvailable
              ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-900'
              : selectedEngine === 'openai'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{TTS_ENGINES.openai.icon}</span>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {TTS_ENGINES.openai.name}
                </h3>
                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {TTS_ENGINES.openai.description}
              </p>
              {!apiAvailable && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  ⚠️ Backend API chưa cấu hình
                </p>
              )}
              <div className="flex flex-wrap gap-1 mb-2">
                {TTS_ENGINES.openai.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded"
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💰 Chi phí: {TTS_ENGINES.openai.cost}
              </p>
            </div>
            {selectedEngine === 'openai' && apiAvailable && (
              <div className="ml-2">
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
