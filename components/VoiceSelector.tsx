import React from 'react';
import type { Voice } from '../constants';

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


export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onSelectVoice }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Chọn giọng đọc</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {voices.map((voice) => (
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
                {/* When the parent is selected, its `text-white` color will be inherited by the SVG's `currentColor` stroke */}
                <SpeakerIcon/>
                <span className="block text-md font-bold">{voice.name}</span>
                <span className={`block text-xs transition-colors duration-300 ${selectedVoice === voice.id ? 'text-blue-200' : 'text-gray-500 dark:text-slate-400'}`}>{voice.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
