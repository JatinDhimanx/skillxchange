'use client';

import React, { useEffect, useRef } from 'react';
import { Zap, PartyPopper, Repeat, Star, FileText, GraduationCap, Coins, Users, Flame } from 'lucide-react';

const FEED_EVENTS = [
  { icon: <PartyPopper className="w-3.5 h-3.5 text-emerald-600" />, text: 'Alex just finished teaching Python to Maya Chen', time: '2m ago' },
  { icon: <Zap className="w-3.5 h-3.5 text-amber-600" />, text: 'New 1-on-1 swap completed: Guitar ⇄ React', time: '5m ago' },
  { icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, text: 'Priya earned "Top Teacher" badge — 50+ sessions!', time: '8m ago' },
  { icon: <FileText className="w-3.5 h-3.5 text-blue-600" />, text: 'David posted a Figma Design Bounty · 5 bids received', time: '12m ago' },
  { icon: <GraduationCap className="w-3.5 h-3.5 text-purple-600" />, text: 'Liam completed Advanced GLSL with verified certificate', time: '15m ago' },
  { icon: <Coins className="w-3.5 h-3.5 text-amber-600" />, text: 'Maya earned 2.8 CR teaching rare WebGL Shaders session', time: '18m ago' },
  { icon: <Users className="w-3.5 h-3.5 text-emerald-600" />, text: 'New match: Riya (Tamil) ↔ Sam (French) — 97% compatibility', time: '22m ago' },
  { icon: <Flame className="w-3.5 h-3.5 text-orange-500" />, text: 'Alex is on a 30-day teaching streak!', time: '25m ago' },
];

export const CommunityActivityFeed: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animFrame: number;
    let pos = 0;

    const scroll = () => {
      pos += 0.35;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animFrame = requestAnimationFrame(scroll);
    };

    animFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const items = [...FEED_EVENTS, ...FEED_EVENTS]; // seamless loop

  return (
    <div className="w-full bg-emerald-50 border-b border-emerald-200/80 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-8 py-2 px-4 overflow-x-hidden whitespace-nowrap select-none"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="flex items-center gap-1.5 shrink-0 mr-2">
          <Zap className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-mono-ledger font-black uppercase tracking-widest text-emerald-700">
            LIVE FEED
          </span>
        </div>

        {items.map((event, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="flex items-center shrink-0">{event.icon}</span>
            <span className="text-[11.5px] font-medium text-slate-700">{event.text}</span>
            <span className="text-[10px] font-mono-ledger text-slate-400">{event.time}</span>
            <span className="text-emerald-300 text-xs ml-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
