import React from 'react';
import { READING_STYLES } from '../constants';

interface ReadingStyleSelectorProps {
    selectedStyle: keyof typeof READING_STYLES;
    onSelectStyle: (style: keyof typeof READING_STYLES) => void;
}

export const ReadingStyleSelector: React.FC<ReadingStyleSelectorProps> = ({ selectedStyle, onSelectStyle }) => {
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <span className="mr-2">🎭</span>
                Phong cách đọc
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(READING_STYLES).map(([key, style]) => (
                    <button
                        key={key}
                        onClick={() => onSelectStyle(key as keyof typeof READING_STYLES)}
                        className={`p-3 rounded-lg text-center transition-all duration-200 ${
                            selectedStyle === key
                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-400 scale-105'
                                : 'bg-gray-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600/60 hover:scale-105'
                        }`}
                    >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="font-semibold text-sm">{style.name}</div>
                        <div className={`text-xs mt-1 ${selectedStyle === key ? 'text-purple-100' : 'text-gray-500 dark:text-slate-400'}`}>
                            {style.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
