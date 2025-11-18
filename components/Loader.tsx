
import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex justify-center items-center space-x-2 bg-gray-200 dark:bg-slate-700/50 px-6 py-3 rounded-full">
    <div className="w-3 h-3 rounded-full animate-pulse bg-blue-500 dark:bg-blue-400"></div>
    <div className="w-3 h-3 rounded-full animate-pulse bg-blue-500 dark:bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-3 h-3 rounded-full animate-pulse bg-blue-500 dark:bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
    <span className="text-slate-600 dark:text-slate-300 ml-3 font-medium">Đang tạo âm thanh...</span>
  </div>
);