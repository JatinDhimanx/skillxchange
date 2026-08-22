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
    <div className="fixed z-[70] flex flex-col overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-300 origin-bottom-right
      bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-3xl border-t border-slate-200/80
      sm:bottom-22 sm:right-6 sm:left-auto sm:w-[440px] sm:h-[580px] sm:max-h-[calc(100vh-7rem)] sm:rounded-2xl sm:border sm:border-slate-200/90 sm:shadow-2xl">
      {/* Top Header matching HeaderNav slate-900 / emerald styling */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                SkillXchange AI
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-ledger bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold tracking-wide uppercase">
                Discovery
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Interactive Barter Matchmaker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={startNewDiscovery}
            title="Restart Discovery"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Restart</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
        {/* Conversation History Stream */}
        <div className="space-y-3.5">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs sm:text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2 text-xs text-slate-600 font-mono-ledger">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>AI is matching skills...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 3 Clickable Option Cards (CHAT-13 Native UI) */}
        {!showMatchResults && currentOptions && currentOptions.length === 3 && (
          <div className="pt-2 border-t border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono-ledger text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Choose Your Path</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono-ledger">
                3 Options
              </span>
            </div>

            <div className="space-y-2">
              {currentOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full p-3 rounded-xl text-left bg-white hover:bg-emerald-50/70 border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-sm transition-all group active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 text-[10px] font-bold font-mono-ledger flex items-center justify-center shrink-0 transition-colors">
                      {['A', 'B', 'C'][i]}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-950 transition-colors truncate">
                      {opt}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real SkillXchange Matches Connection */}
        {showMatchResults && (
          <div className="space-y-3 pt-2 border-t border-slate-200/80 animate-in fade-in duration-300">
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Handshake className="w-4 h-4 text-emerald-600" />
                  <span>Real Peer Matches Found!</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono-ledger">
                  {matchedPeers.length} Available
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Matches based on your discovered teaching and learning skills.
              </p>
            </div>

            {/* Match Cards List */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
              {matchedPeers.length > 0 ? (
                matchedPeers.map(candidate => (
                  <div
                    key={candidate.user.id}
                    className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-400/80 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Peer Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={candidate.user.avatar}
                          alt={candidate.user.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{candidate.user.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono-ledger shrink-0">{candidate.user.handle}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{candidate.user.headline || 'SkillXchange Member'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono-ledger mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-700">{candidate.user.trustScore?.averageRating || 5.0}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{candidate.matchScore}% Match</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Action */}
                      <button
                        onClick={() => handleRequestExchange(candidate)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <Handshake className="w-3 h-3" />
                        <span>Swap</span>
                      </button>
                    </div>

                    {/* Barter Reasoning */}
                    {candidate.reasons && candidate.reasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">Reason: </span>
                        <span>{candidate.reasons[0]}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    No direct swap found yet for this exact combo.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('bounties');
                    }}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold"
                  >
                    Post Learning Bounty →
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setShowMatchResults(false);
                  startNewDiscovery();
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('matches');
                  if (onNavigateToMatches) onNavigateToMatches();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Full Matches</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Manual Navigation */}
      <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono-ledger shrink-0">
        <button
          onClick={() => {
            onClose();
            setActiveTab('matches');
          }}
          className="text-slate-600 hover:text-emerald-700 hover:underline font-semibold cursor-pointer"
        >
          ← Browse Directory
        </button>

        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SkillXchange Engine</span>
        </span>
      </div>
    </div>
  );
};
