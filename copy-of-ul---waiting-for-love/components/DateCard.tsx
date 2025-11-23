import React from 'react';
import { DateItem } from '../types';
import { HeartIcon } from './HeartIcon';

interface DateCardProps {
  item: DateItem;
  isChecked: boolean;
  isToday: boolean;
  note: string;
  onToggle: (id: string) => void;
  onNoteChange: (id: string, text: string) => void;
}

export const DateCard: React.FC<DateCardProps> = ({ 
  item, 
  isChecked, 
  isToday, 
  note, 
  onToggle, 
  onNoteChange 
}) => {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`
        relative overflow-hidden cursor-pointer group
        flex flex-col p-4 rounded-2xl
        border transition-all duration-500 ease-out
        ${isToday 
          ? 'border-rose-400 bg-white/80 shadow-lg shadow-rose-200 ring-2 ring-rose-200 ring-offset-2 ring-offset-rose-50' 
          : 'border-white/50 bg-white/40 hover:bg-white/70 hover:shadow-md'
        }
        ${isChecked ? 'bg-gradient-to-r from-rose-100/80 to-pink-100/80 border-rose-200' : ''}
      `}
    >
      {/* Main Row: Date info and Checkbox */}
      <div className="flex items-center justify-between w-full z-10">
        <div className="flex flex-col">
          <span 
            className={`
              font-sans text-xs sm:text-sm tracking-wider uppercase font-bold
              ${isChecked ? 'text-rose-400 line-through decoration-rose-300' : 'text-gray-500'}
            `}
          >
            {item.dateObject.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
          <span 
            className={`
              font-sans text-xl sm:text-2xl font-bold mt-1 tracking-tight
              ${isChecked ? 'text-rose-800 line-through decoration-rose-400 opacity-70' : 'text-gray-800'}
              ${isToday && !isChecked ? 'text-rose-600' : ''}
            `}
          >
            {item.formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className={`
              w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border
              transition-all duration-300
              ${isChecked 
                ? 'bg-rose-500 border-rose-500 shadow-inner' 
                : 'bg-transparent border-rose-200 group-hover:border-rose-300'
              }
            `}
          >
            {isChecked && (
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-scale-in" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          
          <HeartIcon 
            filled={isChecked} 
            className={`
              w-5 h-5 sm:w-6 sm:h-6 
              ${isChecked ? 'text-rose-500 animate-pulse-slow' : 'text-rose-200 group-hover:text-rose-300'}
            `} 
          />
        </div>
      </div>

      {/* Journal Entry Area */}
      {isChecked && (
        <div 
          className="mt-4 pt-3 border-t border-rose-200/50 w-full animate-fade-in z-20"
          onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking textarea
        >
          <textarea
            value={note}
            onChange={(e) => onNoteChange(item.id, e.target.value)}
            placeholder="Write a thought for today..."
            className="w-full bg-white/50 hover:bg-white/80 focus:bg-white rounded-lg p-3 text-sm text-gray-700 font-sans focus:outline-none focus:ring-1 focus:ring-rose-300 resize-none placeholder-rose-300/70 transition-colors"
            rows={2}
          />
        </div>
      )}

      {/* Background glow effect for active state */}
      {isChecked && (
        <div className="absolute inset-0 bg-gradient-to-r from-rose-200/20 to-pink-200/20 pointer-events-none" />
      )}
      
      {/* Today Indicator Tag */}
      {isToday && (
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-rose-500 blur-xl opacity-20 pointer-events-none rounded-full"></div>
      )}
    </div>
  );
};