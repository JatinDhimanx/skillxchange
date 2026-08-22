'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  RotateCcw,
  X,
  ArrowRight,
  CheckCircle2,
  Users,
  Handshake,
  Star,
  ShieldCheck,
  Zap,
  BookOpen,
  GraduationCap,
  Coins,
  MessageSquare,
  Video,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { MatchCandidate, UserProfile } from '../../types';

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

interface AISkillDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMatches?: () => void;
}

export const AISkillDiscoveryModal: React.FC<AISkillDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMatches,
}) => {
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
  const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showMatchResults]);

  // Initialize conversation when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startNewDiscovery();
    }
  }, [isOpen]);

  // Start fresh discovery flow
  const startNewDiscovery = async () => {
    const newConvId = `disc-${Date.now()}`;
    setConversationId(newConvId);
    setMessages([]);
    setContext({});
    setShowMatchResults(false);
    setSelectedMatch(null);
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

  // Handle option click (CHAT-13 turn)
  const handleSelectOption = async (optionText: string) => {
    if (loading) return;

    // Check if user clicked completion actions
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

    // Add user message to thread
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

      // If discovery completed, run real matching in background
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

  // Extract skills and find real matches from allUsers
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

  if (!isOpen) return null;

  return (
    <div className="fixed z-[70] flex flex-col overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right 
      bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-3xl border-t-2 border-amber-500/30 
      sm:bottom-24 sm:right-6 sm:left-auto sm:w-[450px] sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:rounded-3xl sm:border-2 sm:border-amber-500/20">
      {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>SkillXchange AI</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-ledger bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  🕷️ AI Skill Discovery
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Interactive Multi-Choice AI Storyteller (CHAT-13)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewDiscovery}
              title="Restart Discovery"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {/* Conversation History Stream */}
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* AI Thinking Animation */}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-slate-600 font-mono-ledger">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>🤖 SkillXchange AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 3 Clickable Option Cards (CHAT-13 Standard) */}
          {!showMatchResults && currentOptions && currentOptions.length === 3 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold font-mono-ledger text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select an option (3 Choices)</span>
                </span>
                <span className="text-[11px] text-amber-600 font-semibold font-mono-ledger">
                  CHAT-13 AI Storyteller
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    disabled={loading}
                    onClick={() => handleSelectOption(opt)}
                    className="p-3.5 rounded-xl text-left bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group active:scale-98 disabled:opacity-50 cursor-pointer flex flex-col justify-between min-h-[90px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors line-clamp-2">
                        {opt}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-amber-100 text-slate-500 group-hover:text-amber-700 flex items-center justify-center shrink-0 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono-ledger mt-2">
                      Option {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real SkillXchange Matches Connection */}
          {showMatchResults && (
            <div className="space-y-4 pt-3 border-t border-slate-200 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Handshake className="w-5 h-5 text-emerald-600" />
                    <span>🎯 Real SkillXchange Matches Discovered!</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white font-mono-ledger">
                    {matchedPeers.length} Peers Available
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  We found real registered users who match your discovered teaching & learning preferences.
                </p>
              </div>

              {/* Match Cards List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {matchedPeers.length > 0 ? (
                  matchedPeers.map(candidate => (
                    <div
                      key={candidate.user.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Peer Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.user.avatar}
                            alt={candidate.user.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{candidate.user.name}</h4>
                              <span className="text-xs text-slate-500 font-mono-ledger">{candidate.user.handle}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{candidate.user.headline}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-ledger mt-1">
                              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {candidate.user.trustScore?.averageRating || 5.0}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">
                                Trust {candidate.user.trustScore?.overallScore || 90}/100
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Badge & Action */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {candidate.matchScore}% Match
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono-ledger">
                              {candidate.quality === 'perfect' ? '🤝 Bilateral Barter' : '⚡ 1-Way / Credits'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRequestExchange(candidate)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Request Swap</span>
                          </button>
                        </div>
                      </div>

                      {/* Barter Reasoning */}
                      {candidate.reasons && candidate.reasons.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-700 font-mono-ledger">Why this matches:</span>
                          <span>{candidate.reasons[0]}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-600">
                      No direct registered peer offers this exact pair yet. You can post a <strong>Reverse Skill Bounty</strong> or explore our open skill directory!
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        setActiveTab('bounties');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                    >
                      Post Learning Bounty →
                    </button>
                  </div>
                )}
              </div>

              {/* Full Matches Screen Link */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setShowMatchResults(false);
                    startNewDiscovery();
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Discovery</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('matches');
                    if (onNavigateToMatches) onNavigateToMatches();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Explore Full Matches Screen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Manual Navigation */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
          <button
            onClick={() => {
              onClose();
              setActiveTab('matches');
            }}
            className="text-slate-600 hover:text-slate-900 hover:underline font-medium cursor-pointer"
          >
            ← Browse Skills Manually
          </button>

          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Guided • Real Supabase Matches</span>
          </span>
        </div>
    </div>
  );
};
