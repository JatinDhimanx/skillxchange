'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SVIMarketTicker: React.FC = () => {
  const { dynamicRates } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animFrame: number;
    let pos = 0;

    const scroll = () => {
      pos += 0.5;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animFrame = requestAnimationFrame(scroll);
    };

    animFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const items = [...dynamicRates, ...dynamicRates]; // duplicate for seamless loop

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 py-1.5 px-4 overflow-x-hidden whitespace-nowrap select-none"
        style={{ scrollBehavior: 'auto' }}
      >
        {items.map((rate, i) => (
          <div key={`${rate.skillId}-${i}`} className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-[10px] font-mono-ledger font-bold uppercase tracking-wider">
              {rate.skillName.split(' ')[0]}
            </span>
            <span className={`text-[11px] font-mono-ledger font-black ${
              rate.trend === 'up' ? 'text-emerald-400' :
              rate.trend === 'down' ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {rate.creditPerHour.toFixed(2)} CR
            </span>
            {rate.trend === 'up'
              ? <TrendingUp className="w-3 h-3 text-emerald-400" />
              : rate.trend === 'down'
              ? <TrendingDown className="w-3 h-3 text-rose-400" />
              : <Minus className="w-3 h-3 text-slate-500" />}
            <span className={`text-[10px] font-mono-ledger ${
              rate.change24h > 0 ? 'text-emerald-500' : rate.change24h < 0 ? 'text-rose-500' : 'text-slate-500'
            }`}>
              {rate.change24h > 0 ? '+' : ''}{rate.change24h.toFixed(1)}%
            </span>
            <span className="text-slate-700 text-[10px]">|</span>
          </div>
        ))}
      </div>
    </div>
  );
};
