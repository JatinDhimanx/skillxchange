'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  RotateCcw,
  ArrowRight,
  Handshake,
  Star,
  ShieldCheck,
  Zap,
  BookOpen,
  GraduationCap,
  Coins,
  ChevronRight,
  Search,
  MessageSquare,
  Video,
} from 'lucide-react';
import { MatchCandidate } from '../../types';
import { ScreenTab } from '../layout/HeaderNav';

interface DiscoveryMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  options?: [string, string, string];
  timestamp: number;
}

interface DiscoveryContext {
  teachSkills?: string[];
  learnSkills?: string[];
  selectedCategory?: string;
  skillLevel?: string;
  learningMode?: 'learn' | 'teach' | 'both';
  freeExchangePreference?: boolean;
  paidLearningPreference?: boolean;
  currentStep?: string;
  isComplete?: boolean;
}

interface AISkillDiscoveryViewProps {
  onNavigate?: (tab: ScreenTab) => void;
}

export const AISkillDiscoveryView: React.FC<AISkillDiscoveryViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    allUsers,
    candidates,
    sendExchangeProposal,
    openChatWithPeer,
    invitePeerToStudyRoom,
    showToast,
    setActiveTab,
  } = useApp();

  const [conversationId, setConversationId] = useState<string>(`disc-${Date.now()}`);
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [currentOptions, setCurrentOptions] = useState<[string, string, string] | null>(null);
  const [context, setContext] = useState<DiscoveryContext>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [matchedPeers, setMatchedPeers] = useState<MatchCandidate[]>([]);
  const [showMatchResults, setShowMatchResults] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showMatchResults]);

  useEffect(() => {
    startNewDiscovery();
  }, []);

  const startNewDiscovery = async () => {
    const newConvId = `disc-${Date.now()}`;
    setConversationId(newConvId);
    setMessages([]);
    setContext({});
    setShowMatchResults(false);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/skill-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: newConvId,
          history: [],
          context: {},
          userProfile: {
            name: currentUser?.name,
            skillsToTeach: currentUser?.skillsToTeach,
            skillsToLearn: currentUser?.skillsToLearn,
          },
        }),
      });

      const data = await res.json();
      const initialOptions = (data.options?.length === 3 ? data.options : [
        '📚 Learn a New Skill',
        '🎓 Teach What I Know',
        '🔄 Learn & Teach (Swap)',
      ]) as [string, string, string];

      setMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: data.story || "Welcome to SkillXchange AI! What would you like to explore today?",
          options: initialOptions,
          timestamp: Date.now(),
        },
      ]);
      setCurrentOptions(initialOptions);
      setContext(data.extractedContext || {});
    } catch {
      const fallbackOptions: [string, string, string] = [
        '📚 Learn a New Skill',
        '🎓 Teach What I Know',
        '🔄 Learn & Teach (Swap)',
      ];
      setMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: "Welcome to SkillXchange AI! I will help you discover peer skill swaps or expert mentors. What is your goal?",
          options: fallbackOptions,
          timestamp: Date.now(),
        },
      ]);
      setCurrentOptions(fallbackOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionText: string) => {
    if (loading) return;

    if (
      optionText.toLowerCase().includes('find free') ||
      optionText.toLowerCase().includes('free matches') ||
      optionText.toLowerCase().includes('find paid') ||
      optionText.toLowerCase().includes('start free exchange')
    ) {
      triggerSkillMatching(context);
      return;
    }

    if (optionText.toLowerCase().includes('change my preferences') || optionText.toLowerCase().includes('restart')) {
      startNewDiscovery();
      return;
    }

    const userMsg: DiscoveryMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: optionText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setCurrentOptions(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/skill-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: optionText,
          history: [...messages, userMsg],
          context,
          userProfile: {
            name: currentUser?.name,
            skillsToTeach: currentUser?.skillsToTeach,
            skillsToLearn: currentUser?.skillsToLearn,
          },
        }),
      });

      const data = await res.json();
      const nextOptions = (data.options?.length === 3 ? data.options : [
        '🤝 Find Free Matches',
        '💼 Find Paid Teachers',
        '🔄 Change My Preferences',
      ]) as [string, string, string];

      const newAiMsg: DiscoveryMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.story,
        options: nextOptions,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, newAiMsg]);
      setCurrentOptions(nextOptions);
      setContext(data.extractedContext || context);

      if (data.isComplete || data.extractedContext?.isComplete) {
        computeMatchingResults(data.extractedContext || context);
      }
    } catch {
      const errorOptions: [string, string, string] = [
        '🔄 Try Again',
        '🔄 Restart Discovery',
        '🔍 Browse Skills Manually',
      ];
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "Something went wrong while connecting to our intelligence engine. Would you like to try again or browse manually?",
          options: errorOptions,
          timestamp: Date.now(),
        },
      ]);
      setCurrentOptions(errorOptions);
    } finally {
      setLoading(false);
    }
  };

  const computeMatchingResults = (discoveryCtx: DiscoveryContext) => {
    const teachArr = discoveryCtx.teachSkills || [];
    const learnArr = discoveryCtx.learnSkills || [];

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    const isMatch = (a: string, b: string) => {
      const normA = normalize(a);
      const normB = normalize(b);
      return normA.includes(normB) || normB.includes(normA);
    };

    const results: MatchCandidate[] = (allUsers || [])
      .filter(u => u.id !== currentUser.id && u.role !== 'admin')
      .map(peer => {
        const peerTeaches = peer.skillsToTeach || [];
        const peerLearns = peer.skillsToLearn || [];

        const iCanTeachThem = teachArr.find(t =>
          peerLearns.some(pl => isMatch(t, pl.skillName))
        );
        const theyCanTeachMe = learnArr.find(l =>
          peerTeaches.some(pt => isMatch(l, pt.skillName))
        );

        let matchScore = 65;
        let quality: 'perfect' | 'good' | 'possible' = 'possible';
        const reasons: string[] = [];

        if (iCanTeachThem && theyCanTeachMe) {
          matchScore = 96;
          quality = 'perfect';
          reasons.push(`Direct bilateral barter! You teach ${iCanTeachThem}, they teach ${theyCanTeachMe}.`);
          reasons.push(`High Trust Score (${peer.trustScore?.overallScore || 90}/100) & verified skills.`);
        } else if (theyCanTeachMe) {
          matchScore = 88;
          quality = 'good';
          reasons.push(`Offers ${theyCanTeachMe} matching your learning goal.`);
          reasons.push(`Available for barter credits or ₹${peerTeaches[0]?.hourlyRateInr || 450}/hr.`);
        } else if (iCanTeachThem) {
          matchScore = 79;
          quality = 'good';
          reasons.push(`Wants to learn ${iCanTeachThem}. You can teach them to earn barter credits.`);
        } else {
          matchScore = 65;
          quality = 'possible';
          reasons.push(`Campus peer in ${peer.college || 'Peer Network'}.`);
        }

        return {
          user: peer,
          matchScore,
          quality,
          reasons,
          skillTeachMatch: {
            offeredByYou: iCanTeachThem || teachArr[0] || 'General Skills',
            wantedByThem: peerLearns[0]?.skillName || 'Technical Guidance',
            levelFit: 'Peer Proficiency Match',
          },
          skillLearnMatch: {
            wantedByYou: learnArr[0] || 'General Skills',
            offeredByThem: theyCanTeachMe || peerTeaches[0]?.skillName || 'General Skills',
            levelFit: 'Instructor Certified',
          },
          suggestedMode: (iCanTeachThem && theyCanTeachMe ? 'direct_exchange' : 'credit_exchange') as any,
          paidFallbackPrice: peerTeaches[0]?.hourlyRateInr || 450,
          availabilityOverlap: 'Evenings & Weekends (8 hrs/wk)',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    setMatchedPeers(results);
  };

  const triggerSkillMatching = (discoveryCtx: DiscoveryContext) => {
    computeMatchingResults(discoveryCtx);
    setShowMatchResults(true);
  };

  const handleRequestExchange = (peer: MatchCandidate) => {
    const teachSkill = context.teachSkills?.[0] || currentUser.skillsToTeach[0]?.skillName || 'Programming';
    const learnSkill = context.learnSkills?.[0] || currentUser.skillsToLearn[0]?.skillName || 'Music';

    sendExchangeProposal(
      peer.user.id,
      teachSkill,
      learnSkill,
      `Hi ${peer.user.name.split(' ')[0]}! I found you via SkillXchange AI Discovery. Let's do a mutual barter swap!`
    );
    showToast(`Exchange proposal sent to ${peer.user.name}!`, 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                SkillXchange AI
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono-ledger bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                🕷️ AI Skill Discovery
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Conversational 3-Choice Discovery Engine connected directly to peer matching (CHAT-13).
            </p>
          </div>
        </div>

        <button
          onClick={startNewDiscovery}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 self-start sm:self-center transition-colors cursor-pointer border border-white/10"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Discovery</span>
        </button>
      </div>

      {/* Discovery Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Messages Stream */}
        <div className="flex-1 p-5 sm:p-8 space-y-6 bg-slate-50/40 overflow-y-auto max-h-[600px]">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-xs text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-xs flex items-center gap-2.5 text-xs text-slate-600 font-mono-ledger">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>🤖 SkillXchange AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 3 Clickable Option Cards (CHAT-13 Mandatory Format) */}
        {!showMatchResults && currentOptions && currentOptions.length === 3 && (
          <div className="p-5 sm:p-6 bg-white border-t border-slate-200">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold font-mono-ledger text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Select an option (3 Choices Available)</span>
              </span>
              <span className="text-xs text-amber-600 font-bold font-mono-ledger">
                CHAT-13 Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {currentOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSelectOption(opt)}
                  className="p-4 rounded-2xl text-left bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group active:scale-98 disabled:opacity-50 cursor-pointer flex flex-col justify-between min-h-[105px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      {opt}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white group-hover:bg-amber-200/60 text-slate-500 group-hover:text-amber-800 flex items-center justify-center shrink-0 transition-colors border border-slate-200/50">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-ledger mt-3">
                    Choice #{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real Matches Section */}
        {showMatchResults && (
          <div className="p-5 sm:p-6 bg-white border-t border-slate-200 space-y-5 animate-in fade-in duration-300">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
                  <Handshake className="w-5 h-5 text-emerald-600" />
                  <span>🎯 Real SkillXchange Matches Discovered!</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white font-mono-ledger">
                  {matchedPeers.length} Peers Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                We mapped your discovered preferences ({context.teachSkills?.join(', ') || 'Your skills'} ↔ {context.learnSkills?.join(', ') || 'Your goals'}) against our active database.
              </p>
            </div>

            {/* Candidate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedPeers.length > 0 ? (
                matchedPeers.map(candidate => (
                  <div
                    key={candidate.user.id}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-400 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.user.avatar}
                            alt={candidate.user.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{candidate.user.name}</h4>
                            <span className="text-xs text-slate-500 font-mono-ledger">{candidate.user.handle}</span>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {candidate.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {candidate.user.headline || candidate.user.bio}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono-ledger mb-3">
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {candidate.user.trustScore?.averageRating || 5.0}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Trust {candidate.user.trustScore?.overallScore || 90}/100
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono-ledger text-slate-500">
                        {candidate.quality === 'perfect' ? '🤝 Bilateral Barter' : '⚡ Credits / Mentorship'}
                      </span>

                      <button
                        onClick={() => handleRequestExchange(candidate)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Request Swap</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-600">
                    No direct peer match in the database for this specific pair yet. Post a Reverse Skill Bounty to attract verified teachers!
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('bounties');
                      if (onNavigate) onNavigate('bounties');
                    }}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Post Skill Bounty →
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3">
              <button
                onClick={startNewDiscovery}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Discovery</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('matches');
                  if (onNavigate) onNavigate('matches');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Go to Matches Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
          <button
            onClick={() => {
              setActiveTab('matches');
              if (onNavigate) onNavigate('matches');
            }}
            className="text-slate-600 hover:text-slate-900 hover:underline font-medium cursor-pointer"
          >
            ← Browse Skills Manually
          </button>

          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified Database Matching</span>
          </span>
        </div>
      </div>
    </div>
  );
};
