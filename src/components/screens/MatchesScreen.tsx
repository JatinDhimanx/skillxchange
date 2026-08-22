'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  Search,
  Video,
  X,
  Sparkles,
  Users,
} from 'lucide-react';

export const MatchesScreen: React.FC = () => {
  const { 
    currentUser, 
    candidates, 
    sendExchangeProposal, 
    startLiveSession, 
    openChatWithPeer,
    showToast 
  } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [animatedScores, setAnimatedScores] = useState<{ [key: string]: number }>({});

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'perfect' | 'good' | 'possible'>('all');

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      const finalMap: { [key: string]: number } = {};
      candidates.forEach(c => (finalMap[c.user.id] = c.matchScore));
      setAnimatedScores(finalMap);
      return;
    }

    const start = performance.now();
    const duration = 900;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const currentMap: { [key: string]: number } = {};
      candidates.forEach(c => {
        currentMap[c.user.id] = Math.floor(progress * c.matchScore);
      });
      setAnimatedScores(currentMap);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [candidates]);

  // Filter list
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.user.name.toLowerCase().includes(q) ||
      c.skillTeachMatch.offeredByYou.toLowerCase().includes(q) ||
      c.skillLearnMatch.offeredByThem.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (tierFilter === 'perfect') return c.matchScore >= 90;
    if (tierFilter === 'good') return c.matchScore >= 70 && c.matchScore < 90;
    if (tierFilter === 'possible') return c.matchScore < 70;
    return true;
  });

  const perfectMatches = filteredCandidates.filter(c => c.matchScore >= 90);
  const goodMatches = filteredCandidates.filter(c => c.matchScore >= 70 && c.matchScore < 90);
  const possibleMatches = filteredCandidates.filter(c => c.matchScore < 70);

  const renderTier = (title: string, dotColor: string, list: typeof candidates) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
            <h2 className="font-display font-bold text-lg text-slate-900">{title}</h2>
            <span className="text-xs font-mono-ledger text-slate-500 font-bold">({list.length})</span>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-mono-ledger text-slate-400">
            Calculated by mutual skill vectors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(candidate => {
            const user = candidate.user;
            const isExpanded = expandedId === user.id;
            const score = animatedScores[user.id] !== undefined ? animatedScores[user.id] : candidate.matchScore;

            return (
              <div
                key={user.id}
                className="paper-card p-6 flex flex-col justify-between space-y-4 bg-white border border-slate-200 shadow-sm"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-bold text-base text-slate-900">{user.name}</h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] font-mono-ledger text-slate-500">
                          <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {user.trustScore.averageRating}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{user.trustScore.overallScore}/100 Trust</span>
                        </div>
                      </div>
                    </div>

                    {/* Big Match Score */}
                    <div className="text-right shrink-0">
                      <div className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                        {score}<span className="text-sm font-sans text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Two Pills: What they teach (Amber) vs What they want (Emerald) */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <span className="font-mono-ledger text-[10px] font-bold uppercase text-amber-800 whitespace-nowrap">
                        They Teach You:
                      </span>
                      <span className="font-bold text-slate-900">{candidate.skillLearnMatch.offeredByThem}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <span className="font-mono-ledger text-[10px] font-bold uppercase text-emerald-800 whitespace-nowrap">
                        They Want From You:
                      </span>
                      <span className="font-bold text-slate-900">{candidate.skillTeachMatch.offeredByYou}</span>
                    </div>
                  </div>

                  {/* "Why matched?" Inline Toggle */}
                  <div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : user.id)}
                      className="w-full flex items-center justify-between text-[11px] font-mono-ledger text-slate-600 hover:text-slate-900 font-bold pt-1"
                    >
                      <span>Why matched?</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono-ledger text-[11px] text-slate-700 space-y-1">
                        {candidate.reasons.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">›</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      startLiveSession(
                        `1-on-1 Exchange: ${candidate.skillLearnMatch.offeredByThem}`,
                        user.name,
                        currentUser.name,
                        candidate.skillLearnMatch.offeredByThem
                      )
                    }
                    className="p-2 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 shadow-xs whitespace-nowrap active:scale-95"
                    title="Start Live Study Room"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">Start room</span>
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        openChatWithPeer({
                          id: user.id,
                          name: user.name,
                          avatar: user.avatar,
                          skill: candidate.skillLearnMatch.offeredByThem,
                          headline: user.headline,
                          rating: user.trustScore.averageRating,
                        })
                      }
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() =>
                        sendExchangeProposal(
                          user.id,
                          candidate.skillTeachMatch.offeredByYou,
                          candidate.skillLearnMatch.offeredByThem
                        )
                      }
                      className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 shrink-0" />
                      <span>Request</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-6 max-w-[1180px] mx-auto px-4 relative">
      {/* Header & Interactive Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            Live Peer Matches for {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Deterministic vector ranking matching what you can teach with what peers are looking to learn.
          </p>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter matches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                tierFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({filteredCandidates.length})
            </button>
            <button
              onClick={() => setTierFilter('perfect')}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                tierFilter === 'perfect' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              ≥90%
            </button>
            <button
              onClick={() => setTierFilter('good')}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                tierFilter === 'good' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              70–89%
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No matching peers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adding more skills to your teaching profile or learning roadmap to unlock automatic barter swaps.
          </p>
        </div>
      ) : (
        <>
          {/* 3 Tiers */}
          {(tierFilter === 'all' || tierFilter === 'perfect') &&
            renderTier('Perfect Matches (≥90%)', '#059669', perfectMatches)}
          {(tierFilter === 'all' || tierFilter === 'good') &&
            renderTier('Good Matches (70–89%)', '#D97706', goodMatches)}
          {(tierFilter === 'all' || tierFilter === 'possible') &&
            renderTier('Possible Matches (50–69%)', '#DC2626', possibleMatches)}
        </>
      )}
    </div>
  );
};
