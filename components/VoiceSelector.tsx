import React, { useState, useMemo } from 'react';
import type { Voice } from '../constants';
import { SUPPORTED_LANGUAGES } from '../constants';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

const SpeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-white transition-all duration-300 transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M19 4v16m-6-12v8m-4-6v4m-4-2v2m12 2v-4" />
    </svg>
);

type LanguageCode = 'vi' | 'en' | 'zh' | 'ja';

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onSelectVoice }) => {
  // Mặc định hiển thị tab Việt Nam
  const [activeTab, setActiveTab] = useState<LanguageCode>('vi');

  // Group voices by language
  const voicesByLanguage = useMemo(() => {
    const grouped: Record<LanguageCode, Voice[]> = {
      vi: [],
      en: [],
      zh: [],
      ja: [],
    };

    voices.forEach(voice => {
      const lang = voice.lang?.split('-')[0].toLowerCase() as LanguageCode;
      if (lang && lang in grouped) {
        grouped[lang].push(voice);
      }
    });

    return grouped;
  }, [voices]);

  const currentVoices = voicesByLanguage[activeTab] || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <span className="mr-2">🎙️</span>
        Chọn giọng đọc
      </h2>

      {/* Language Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-200 dark:border-slate-700 overflow-x-auto">
        {(Object.entries(SUPPORTED_LANGUAGES) as [LanguageCode, typeof SUPPORTED_LANGUAGES[LanguageCode]][]).map(([code, lang]) => {
          const count = voicesByLanguage[code]?.length || 0;
          const isActive = activeTab === code;

          return (
            <button
              key={code}
              onClick={() => setActiveTab(code)}
              disabled={count === 0}
              className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : count > 0
                    ? 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    : 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
              {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Voices Grid */}
      {currentVoices.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {currentVoices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`group p-4 rounded-lg text-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-offset-gray-100 ${
                selectedVoice === voice.id
                  ? 'bg-blue-600 text-white shadow-xl ring-2 ring-blue-500 scale-105 -translate-y-1'
                  : 'bg-gray-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600/80 hover:-translate-y-1 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center">
                <SpeakerIcon/>
                <span className="block text-sm font-bold truncate w-full">{voice.name}</span>
                {voice.region && (
                  <span className={`text-xs mt-1 ${selectedVoice === voice.id ? 'text-blue-200' : 'text-gray-500 dark:text-slate-400'}`}>
                    {voice.region === 'north' ? '🏔️ Bắc' : voice.region === 'central' ? '🌊 Trung' : voice.region === 'south' ? '🌴 Nam' : ''}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Không tìm thấy giọng nói cho ngôn ngữ này</p>
          <p className="text-sm mt-2">Vui lòng thử ngôn ngữ khác</p>
        </div>
      )}
    </div>
  );
};
