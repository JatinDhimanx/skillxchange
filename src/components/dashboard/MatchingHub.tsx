'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRightLeft,
  Coins,
  ShieldCheck,
  GraduationCap,
  Star,
  CheckCircle2,
  Search,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const MatchingHub: React.FC = () => {
  const { currentUser, candidates, sendExchangeProposal, bookPaidTeacher, setActiveTab } = useApp();
  const [filterQuality, setFilterQuality] = useState<'all' | 'perfect' | 'good' | 'possible'>('all');
  const [onlyCollegeVerified, setOnlyCollegeVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const filteredCandidates = candidates.filter(cand => {
    if (filterQuality !== 'all' && cand.quality !== filterQuality) return false;
    if (onlyCollegeVerified && !cand.user.collegeVerified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cand.user.name.toLowerCase().includes(q);
      const matchSkillTeach = cand.user.skillsToTeach.some(s => s.skillName.toLowerCase().includes(q));
      const matchSkillLearn = cand.user.skillsToLearn.some(s => s.skillName.toLowerCase().includes(q));
      if (!matchName && !matchSkillTeach && !matchSkillLearn) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Signature Hero Banner (Chalkboard with Animated Chalk Connector) */}
      <div className="rounded-3xl p-6 sm:p-10 border border-[#F2EFE6]/15 bg-[#111e19] relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-ledger bg-[#F2EFE6]/10 text-[#F2EFE6] border border-[#F2EFE6]/20">
                <span>PEER-TO-PEER BARTER & LEDGER ENGINE</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F2EFE6] tracking-tight leading-tight max-w-3xl">
                Everyone knows something. <br />
                <span className="text-[#E7A33E]">Everyone can learn something.</span>
              </h1>
              <p className="text-[#D9D0B8] text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
                Connect directly with peers who want what you know and teach what you seek. Three ways to exchange: free 2-way barter, 3-person zero-fiat skill chains, or credit ledger escrow.
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('skill-chains')}
                className="px-5 py-3 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
              >
                <span>3-Person Skill Chains</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('skill-graph')}
                className="px-5 py-3 rounded-xl bg-[#16261F] hover:bg-[#1a2f26] text-[#F2EFE6] border border-[#F2EFE6]/20 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Live Public Graph</span>
              </button>
            </div>
          </div>

          {/* Signature Chalkboard Hand-Drawn Connector Strip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#16261F] border border-[#F2EFE6]/20 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              {/* Left Teach Side */}
              <div className="flex-1 w-full p-3 rounded-xl bg-[#111e19] border-2 border-dashed border-[#E7A33E] space-y-1">
                <span className="font-mono-ledger text-[10px] font-bold uppercase tracking-wider text-[#E7A33E] block">
                  You Teach (Giving):
                </span>
                <p className="font-bold text-[#F2EFE6] text-xs sm:text-sm">
                  {currentUser.skillsToTeach.map(s => s.skillName).join(' • ')}
                </p>
              </div>

              {/* Hand-Drawn Chalk-Line Connector */}
              <div className="flex flex-col items-center justify-center px-4 shrink-0">
                <div className="flex items-center gap-2 font-mono-ledger text-[11px] font-bold text-[#D9D0B8]">
                  <span>AI MATCH ENGINE</span>
                </div>
                <svg width="120" height="24" viewBox="0 0 120 24" className="overflow-visible hidden md:block">
                  <path
                    d="M 5 12 Q 35 2, 60 12 T 115 12"
                    fill="transparent"
                    stroke="#F2EFE6"
                    strokeWidth="2"
                    className="chalk-connector"
                  />
                  <polygon points="112,8 118,12 112,16" fill="#F2EFE6" />
                </svg>
                <span className="text-[10px] font-mono-ledger text-[#2E8C74] font-bold">ZERO-FIAT SWAP</span>
              </div>

              {/* Right Learn Side */}
              <div className="flex-1 w-full p-3 rounded-xl bg-[#111e19] border-2 border-dashed border-[#2E8C74] space-y-1">
                <span className="font-mono-ledger text-[10px] font-bold uppercase tracking-wider text-[#2E8C74] block">
                  You Learn (Receiving):
                </span>
                <p className="font-bold text-[#F2EFE6] text-xs sm:text-sm">
                  {currentUser.skillsToLearn.map(s => s.skillName).join(' • ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111e19] border border-[#F2EFE6]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#D9D0B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by peer name, skill..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#16261F] border border-[#F2EFE6]/20 text-xs text-[#F2EFE6] placeholder-[#D9D0B8]/60 focus:outline-none focus:border-[#E7A33E]"
          />
        </div>

        {/* Match Quality Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-[#16261F] p-1 rounded-xl border border-[#F2EFE6]/15 text-xs font-mono-ledger">
            <button
              onClick={() => setFilterQuality('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterQuality === 'all' ? 'bg-[#F2EFE6] text-[#16261F]' : 'text-[#D9D0B8] hover:text-[#F2EFE6]'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilterQuality('perfect')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterQuality === 'perfect' ? 'bg-[#2E8C74] text-[#F2EFE6]' : 'text-[#D9D0B8] hover:text-[#F2EFE6]'
              }`}
            >
              90%+ Perfect
            </button>
            <button
              onClick={() => setFilterQuality('good')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterQuality === 'good' ? 'bg-[#E7A33E] text-[#16261F]' : 'text-[#D9D0B8] hover:text-[#F2EFE6]'
              }`}
            >
              70-89% Good
            </button>
          </div>

          <button
            onClick={() => setOnlyCollegeVerified(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              onlyCollegeVerified
                ? 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]'
                : 'bg-[#16261F] text-[#D9D0B8] border-[#F2EFE6]/15 hover:text-[#F2EFE6]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>.EDU Only</span>
          </button>
        </div>
      </div>

      {/* Ledger Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCandidates.map((candidate) => {
          const user = candidate.user;
          const isDirectPerfect = candidate.quality === 'perfect';
          const isExpanded = expandedEntryId === user.id;

          return (
            <div
              key={user.id}
              className="ledger-paper rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between space-y-5 relative"
            >
              <div className="space-y-4">
                {/* Header: Photo, Name, Headline, Match % in Fraunces */}
                <div className="flex items-start justify-between gap-4 border-b border-[#D9D0B8] pb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-[#1A2620]/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-bold text-base text-[#1A2620]">{user.name}</h2>
                        <span className="text-[11px] font-mono-ledger text-[#53635A]">{user.handle}</span>
                      </div>
                      <p className="text-xs text-[#53635A] line-clamp-1 font-sans">{user.headline}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10.5px] font-mono-ledger text-[#53635A]">
                        <span>{user.location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[#E7A33E] font-bold">
                          <Star className="w-3 h-3 fill-[#E7A33E] text-[#E7A33E]" /> {user.trustScore.averageRating}
                        </span>
                        <span>•</span>
                        <span className="text-[#2E8C74] font-bold">{user.trustScore.overallScore}/100 TRUST</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Percentage in Fraunces */}
                  <div className="text-right shrink-0">
                    <div className="font-display font-black text-2xl sm:text-3xl text-[#1A2620]">
                      {candidate.matchScore}<span className="text-sm font-sans text-[#53635A]">%</span>
                    </div>
                    <span
                      className={`text-[9.5px] font-mono-ledger font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isDirectPerfect
                          ? 'bg-[#2E8C74]/15 text-[#2E8C74] border-[#2E8C74]'
                          : 'bg-[#E7A33E]/15 text-[#1A2620] border-[#E7A33E]'
                      }`}
                    >
                      {isDirectPerfect ? 'Free 2-Way Match' : 'Credit / Paid Option'}
                    </span>
                  </div>
                </div>

                {/* Ledger Two-Column Exchange Pairing (Teach Marigold | Learn Jade) */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#D9D0B8] text-xs">
                  <div className="space-y-0.5 pr-2 border-r border-[#D9D0B8]">
                    <span className="text-[10px] font-mono-ledger uppercase font-bold text-[#E7A33E]">
                      You Teach Them:
                    </span>
                    <p className="font-bold text-[#1A2620]">{candidate.skillTeachMatch.offeredByYou}</p>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    <span className="text-[10px] font-mono-ledger uppercase font-bold text-[#2E8C74]">
                      They Teach You:
                    </span>
                    <p className="font-bold text-[#1A2620]">{candidate.skillLearnMatch.offeredByThem}</p>
                  </div>
                </div>

                {/* Why Matched (Ledger Entry Expandable) */}
                <div className="space-y-2">
                  <button
                    onClick={() => setExpandedEntryId(isExpanded ? null : user.id)}
                    className="w-full flex items-center justify-between text-[11px] font-mono-ledger text-[#53635A] hover:text-[#1A2620] font-bold"
                  >
                    <span>[LEDGER ENTRY] Match Explanation</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] space-y-1.5 text-xs text-[#1A2620]">
                      {candidate.reasons.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8C74] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#D9D0B8] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {user.collegeVerified && (
                    <span className="px-2 py-0.5 rounded bg-[#2E8C74]/10 border border-[#2E8C74]/30 text-[#2E8C74] text-[10.5px] font-mono-ledger font-bold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {user.college}
                    </span>
                  )}
                  <span className="text-[10.5px] font-mono-ledger text-[#53635A]">
                    {candidate.availabilityOverlap}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isDirectPerfect ? (
                    <button
                      onClick={() =>
                        sendExchangeProposal(
                          user.id,
                          candidate.skillTeachMatch.offeredByYou,
                          candidate.skillLearnMatch.offeredByThem
                        )
                      }
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2E8C74] hover:bg-[#247561] text-[#F2EFE6] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Send exchange request</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          sendExchangeProposal(
                            user.id,
                            candidate.skillTeachMatch.offeredByYou,
                            candidate.skillLearnMatch.offeredByThem
                          )
                        }
                        className="px-3.5 py-2.5 rounded-xl bg-[#16261F] hover:bg-[#1f372d] text-[#F2EFE6] text-xs font-semibold transition-all"
                      >
                        Request credit exchange
                      </button>
                      <button
                        onClick={() =>
                          bookPaidTeacher(user.id, candidate.skillLearnMatch.offeredByThem, candidate.paidFallbackPrice || 450)
                        }
                        className="px-4 py-2.5 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Book session (₹{candidate.paidFallbackPrice}/hr)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
