import React from 'react';
import { ProgressStats } from '../types';

interface ProgressBarProps {
  stats: ProgressStats;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ stats }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10 px-4">
      <div className="flex justify-between text-rose-900/70 font-sans text-sm sm:text-base font-medium mb-2">
        <span>{stats.completed} Days Completed</span>
        <span>{stats.remaining} Days Remaining</span>
      </div>
      
      <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden shadow-inner border border-rose-200/50">
        <div 
          className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-1000 ease-out relative"
          style={{ width: `${stats.percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-xs text-rose-400 italic font-serif">
          {stats.percentage.toFixed(1)}% closer to forever
        </p>
      </div>
    </div>
  );
};
