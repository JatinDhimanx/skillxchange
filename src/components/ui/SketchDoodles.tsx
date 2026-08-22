'use client';

import React from 'react';
import { Pencil } from 'lucide-react';

export const FloatingPencilSketch: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      {/* Animated Pencil */}
      <div className="flex items-center gap-1 animate-float">
        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs transform -rotate-45">
          <Pencil className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible opacity-70">
          <path
            d="M 0 10 Q 10 2, 20 10 T 40 10"
            fill="none"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="chalk-line-anim"
          />
        </svg>
      </div>
    </div>
  );
};

export const HandDrawnArrow: React.FC<{ direction?: 'left' | 'right' | 'down'; label?: string; className?: string }> = ({
  direction = 'right',
  label,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center pointer-events-none select-none text-slate-400 font-mono-ledger text-[10px] ${className}`}>
      {label && <span className="mb-0.5 tracking-wider font-semibold text-amber-700/80 italic">{label}</span>}
      <svg width="60" height="28" viewBox="0 0 60 28" className="overflow-visible">
        {direction === 'right' && (
          <g>
            <path
              d="M 5 20 Q 28 4, 52 14"
              fill="none"
              stroke="#D97706"
              strokeWidth="1.8"
              strokeDasharray="4 2"
              strokeLinecap="round"
              className="chalk-line-anim"
            />
            <polygon points="46,10 55,14 48,18" fill="#D97706" />
          </g>
        )}
        {direction === 'left' && (
          <g>
            <path
              d="M 55 20 Q 32 4, 8 14"
              fill="none"
              stroke="#059669"
              strokeWidth="1.8"
              strokeDasharray="4 2"
              strokeLinecap="round"
              className="chalk-line-anim"
            />
            <polygon points="14,10 5,14 12,18" fill="#059669" />
          </g>
        )}
        {direction === 'down' && (
          <g>
            <path
              d="M 30 2 Q 40 14, 30 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.8"
              strokeDasharray="3 2"
              strokeLinecap="round"
              className="chalk-line-anim"
            />
            <polygon points="26,18 30,26 34,18" fill="#94A3B8" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const SketchLightbulb: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none animate-float ${className}`}>
      <svg width="48" height="48" viewBox="0 0 48 48" className="overflow-visible opacity-75">
        {/* Light rays */}
        <line x1="24" y1="4" x2="24" y2="8" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="10" x2="13" y2="13" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="38" y1="10" x2="35" y2="13" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="24" x2="8" y2="24" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="24" x2="44" y2="24" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Bulb shape */}
        <path
          d="M 16 22 C 16 16, 32 16, 32 22 C 32 26, 28 28, 28 32 L 20 32 C 20 28, 16 26, 16 22 Z"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Filament */}
        <path d="M 22 24 Q 24 20, 26 24" fill="none" stroke="#D97706" strokeWidth="1.5" />
        {/* Screw base */}
        <line x1="21" y1="34" x2="27" y2="34" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="37" x2="26" y2="37" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const SketchDoodleCluster: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none space-y-4 ${className}`}>
      {/* Code bracket sketch */}
      <svg width="44" height="28" viewBox="0 0 44 28" className="opacity-40 animate-pulse">
        <path d="M 14 6 L 6 14 L 14 22" fill="none" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 30 6 L 38 14 L 30 22" fill="none" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24" y1="4" x2="20" y2="24" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Music note sketch */}
      <svg width="36" height="36" viewBox="0 0 36 36" className="opacity-40 animate-float">
        <circle cx="10" cy="26" r="4" fill="#0F172A" />
        <circle cx="26" cy="22" r="4" fill="#0F172A" />
        <line x1="14" y1="26" x2="14" y2="8" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="22" x2="30" y2="4" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        <path d="M 14 8 Q 22 4, 30 4" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* Sparkle star */}
      <svg width="32" height="32" viewBox="0 0 32 32" className="opacity-50 animate-pulse">
        <path
          d="M 16 2 Q 16 16, 2 16 Q 16 16, 16 30 Q 16 16, 30 16 Q 16 16, 16 2"
          fill="#D97706"
          opacity="0.2"
          stroke="#D97706"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
