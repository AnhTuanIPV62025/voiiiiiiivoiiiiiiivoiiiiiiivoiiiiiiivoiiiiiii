import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  isActive: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isActive, label }) => {
  if (!isActive && progress === 0) return null;

  const progressPercent = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{progressPercent}%</span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
        {/* Progress Fill */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Animated Shimmer Effect */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                 style={{
                   animation: 'shimmer 1.5s infinite',
                   backgroundSize: '200% 100%'
                 }}
            />
          )}

          {/* Progress Text Inside */}
          {progressPercent > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-md">
                {progressPercent}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      {isActive && (
        <div className="text-center">
          <span className="text-xs text-slate-600 dark:text-slate-400 inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Đang chuyển đổi văn bản thành giọng nói...
          </span>
        </div>
      )}
    </div>
  );
};

// Add shimmer animation to global CSS (will be added to index.css)
export const SHIMMER_KEYFRAMES = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;
