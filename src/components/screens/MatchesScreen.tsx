'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  PlusCircle,
  Award,
  BookOpen,
  SlidersHorizontal,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coins,
  GraduationCap,
  Flame,
  LayoutGrid,
  List,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_SKILL_SUGGESTIONS = [
  'Python & Data Science',
  'React & Next.js',
  'Machine Learning & PyTorch',
  'UI/UX & Figma Design',
  'Acoustic Guitar & Music Theory',
  'Public Speaking & Leadership',
  'Blockchain & Solidity',
  'Spanish Language Fluency',
  'Video Editing & Motion Graphics',
  'Data Structures & Algorithms',
];

const CATEGORIES = [
  'All Categories',
  'Programming & AI',
  'Design & Creative',
  'Music & Audio',
  'Languages & Soft Skills',
  'Business & Finance',
  'Academics & Science',
];

export const MatchesScreen: React.FC = () => {
  const {
    currentUser,
    allUsers,
    candidates,
    skills,
    addSkillToTeach,
    addSkillToLearn,
    sendExchangeProposal,
    startLiveSession,
    openChatWithPeer,
    showToast,
    setActiveTab,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [tierFilter, setTierFilter] = useState<'all' | 'perfect' | 'good' | 'possible'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'rate_low' | 'experience'>('score');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Expanded card reasons
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [animatedScores, setAnimatedScores] = useState<{ [key: string]: number }>({});

  // Modals state
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [addSkillTab, setAddSkillTab] = useState<'teach' | 'learn'>('teach');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming & AI');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newSkillYears, setNewSkillYears] = useState(2);
  const [newSkillRateCredits, setNewSkillRateCredits] = useState(1.0);
  const [newSkillRateInr, setNewSkillRateInr] = useState(500);

  // Selected Peer Profile Details Modal
  const [selectedPeerProfile, setSelectedPeerProfile] = useState<any | null>(null);

  // Barter Proposal Modal
  const [proposalModalPeer, setProposalModalPeer] = useState<any | null>(null);
  const [proposalMySkill, setProposalMySkill] = useState('');
  const [proposalTheirSkill, setProposalTheirSkill] = useState('');
  const [proposalNotes, setProposalNotes] = useState('');

  // Animated Match Score Progress
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      const finalMap: { [key: string]: number } = {};
      candidates.forEach(c => (finalMap[c.user.id] = c.matchScore));
      setAnimatedScores(finalMap);
      return;
    }

    const start = performance.now();
    const duration = 800;

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

  // Handle Add Skill Submit
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      showToast('Please specify a skill name.', 'warning');
      return;
    }

    if (addSkillTab === 'teach') {
      addSkillToTeach(newSkillName.trim(), newSkillCategory, newSkillLevel, Number(newSkillYears));
      showToast(`Published "${newSkillName.trim()}" to your teaching catalog!`, 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      addSkillToLearn(newSkillName.trim(), newSkillLevel, 'flexible');
      showToast(`Added "${newSkillName.trim()}" to your learning goals!`, 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }

    setNewSkillName('');
    setIsAddSkillModalOpen(false);
  };

  // Open Barter Proposal Modal
  const handleOpenProposal = (candidate: any) => {
    setProposalModalPeer(candidate.user);
    setProposalMySkill(candidate.skillTeachMatch.offeredByYou || currentUser.skillsToTeach[0]?.skillName || 'General Skills');
    setProposalTheirSkill(candidate.skillLearnMatch.offeredByThem || candidate.user.skillsToTeach[0]?.skillName || 'General Skills');
    setProposalNotes('');
  };

  // Submit Barter Proposal
  const handleSendProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalModalPeer) return;

    sendExchangeProposal(proposalModalPeer.id, proposalMySkill, proposalTheirSkill, proposalNotes);
    showToast(`Bilateral barter proposal sent to ${proposalModalPeer.name}!`, 'success');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setProposalModalPeer(null);
  };

  // Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return candidates
      .filter(c => {
        const matchesSearch =
          !q ||
          c.user.name.toLowerCase().includes(q) ||
          (c.user.college && c.user.college.toLowerCase().includes(q)) ||
          c.skillTeachMatch.offeredByYou.toLowerCase().includes(q) ||
          c.skillLearnMatch.offeredByThem.toLowerCase().includes(q) ||
          c.user.skillsToTeach.some(s => s.skillName.toLowerCase().includes(q)) ||
          c.user.skillsToLearn.some(s => s.skillName.toLowerCase().includes(q));

        if (!matchesSearch) return false;

        // Category Filter
        if (selectedCategory !== 'All Categories') {
          const hasCategorySkill = c.user.skillsToTeach.some(s =>
            s.category?.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])
          );
          if (!hasCategorySkill) return false;
        }

        // Tier Filter
        if (tierFilter === 'perfect') return c.matchScore >= 90;
        if (tierFilter === 'good') return c.matchScore >= 70 && c.matchScore < 90;
        if (tierFilter === 'possible') return c.matchScore < 70;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.matchScore - a.matchScore;
        if (sortBy === 'rating') return (b.user.trustScore.averageRating || 0) - (a.user.trustScore.averageRating || 0);
        if (sortBy === 'rate_low') {
          const rateA = a.user.skillsToTeach[0]?.hourlyRateCredits || 1.0;
          const rateB = b.user.skillsToTeach[0]?.hourlyRateCredits || 1.0;
          return rateA - rateB;
        }
        if (sortBy === 'experience') {
          const expA = a.user.skillsToTeach[0]?.yearsExperience || 0;
          const expB = b.user.skillsToTeach[0]?.yearsExperience || 0;
          return expB - expA;
        }
        return 0;
      });
  }, [candidates, searchQuery, selectedCategory, tierFilter, sortBy]);

  const perfectCount = useMemo(() => candidates.filter(c => c.matchScore >= 90).length, [candidates]);
  const goodCount = useMemo(() => candidates.filter(c => c.matchScore >= 70 && c.matchScore < 90).length, [candidates]);
  const possibleCount = useMemo(() => candidates.filter(c => c.matchScore < 70).length, [candidates]);

  return (
    <div className="space-y-8 py-6 max-w-[1320px] mx-auto px-3 sm:px-6">
      
      {/* ── TOP HERO & MATCH INTELLIGENCE BANNER ────────────────────────── */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" /> AI Skill Matching Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-amber-600" /> Bilateral Peer Barter
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 tracking-tight">
              Find Peer Matches for <span className="text-emerald-600">{currentUser.name}</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-sans leading-relaxed">
              Our deterministic vector matching pairs what you are skilled at teaching with what peers across universities and networks are looking to learn.
            </p>
          </div>

          {/* Quick Primary Actions: List My Skill Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setAddSkillTab('teach');
                setIsAddSkillModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ List Skill to Teach</span>
            </button>
            <button
              onClick={() => {
                setAddSkillTab('learn');
                setIsAddSkillModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>+ Add Learning Goal</span>
            </button>
          </div>
        </div>

        {/* Top Intelligence Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 font-mono-ledger">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Registered Peers</p>
              <p className="text-base sm:text-lg font-bold text-slate-900">{allUsers.length} Members</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-emerald-800 font-bold">Perfect 2-Way Matches</p>
              <p className="text-base sm:text-lg font-bold text-emerald-950">{perfectCount} Swaps</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-amber-800 font-bold">Your Barter Balance</p>
              <p className="text-base sm:text-lg font-bold text-amber-950">{currentUser.creditsBalance.toFixed(1)} Credits</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Skills Catalog</p>
              <p className="text-base sm:text-lg font-bold text-slate-900">{skills.length} Disciplines</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH, CATEGORY PILLS & SORT CONTROLS ───────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by peer name, skill offered, skill wanted, or college..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tier Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Match Tier Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] font-mono-ledger font-bold">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  tierFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({candidates.length})
              </button>
              <button
                onClick={() => setTierFilter('perfect')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  tierFilter === 'perfect' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ≥90% ({perfectCount})
              </button>
              <button
                onClick={() => setTierFilter('good')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  tierFilter === 'good' ? 'bg-amber-500 text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                70–89% ({goodCount})
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono-ledger font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="score">Sort: Match Score (High to Low)</option>
              <option value="rating">Sort: Trust Rating (⭐)</option>
              <option value="rate_low">Sort: Rate (Lowest Credits)</option>
              <option value="experience">Sort: Experience (Years)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewLayout === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-ledger font-bold transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── PEER CANDIDATES FEED ────────────────────────────────────────── */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">No matching peers found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't find any peer matching your exact search or filter. Try listing more skills you can teach or adding new learning goals!
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setTierFilter('all');
            }}
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
          {filteredCandidates.map(candidate => {
            const user = candidate.user;
            const isExpanded = expandedId === user.id;
            const score = animatedScores[user.id] !== undefined ? animatedScores[user.id] : candidate.matchScore;
            const isPerfect = candidate.matchScore >= 90;

            const primaryTeachSkill = user.skillsToTeach[0];
            const primaryLearnGoal = user.skillsToLearn[0];

            return (
              <div
                key={user.id}
                className={`paper-card p-6 flex flex-col justify-between space-y-4 bg-white border rounded-3xl transition-all hover:shadow-md ${
                  isPerfect ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Peer Identity & Big Match Percentage */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                        />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3
                            onClick={() => setSelectedPeerProfile(user)}
                            className="font-display font-bold text-base text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            {user.name}
                          </h3>
                          <span title="Verified Peer">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans truncate max-w-xs">{user.headline}</p>
                        <div className="flex items-center gap-2 text-[10.5px] font-mono-ledger text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {user.trustScore.averageRating || 4.9}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{user.trustScore.overallScore}/100 Trust</span>
                          <span>•</span>
                          <span className="text-slate-600 truncate">{user.college}</span>
                        </div>
                      </div>
                    </div>

                    {/* Big Match Score Radial Indicator */}
                    <div className="text-right shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-2xl font-mono-ledger font-black text-lg sm:text-xl flex items-center gap-1 shadow-xs ${
                          isPerfect
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : score >= 70
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{score}%</span>
                      </div>
                      <span className="text-[9.5px] font-mono-ledger text-slate-400 font-bold block mt-0.5">
                        {isPerfect ? '2-Way Barter' : 'Skill Vector Match'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Barter Pair Swap Pill */}
                  <div className="space-y-2 text-xs">
                    {/* What they teach you */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-ledger text-[10px] font-bold uppercase text-amber-800">
                          They Teach:
                        </span>
                        <span className="font-bold text-slate-900">{candidate.skillLearnMatch.offeredByThem}</span>
                      </div>
                      <span className="font-mono-ledger text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                        {primaryTeachSkill?.hourlyRateCredits || 1.0} Credits/hr
                      </span>
                    </div>

                    {/* What they want from you */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-ledger text-[10px] font-bold uppercase text-emerald-800">
                          They Want:
                        </span>
                        <span className="font-bold text-slate-900">{candidate.skillTeachMatch.offeredByYou}</span>
                      </div>
                      <span className="font-mono-ledger text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {primaryLearnGoal?.targetLevel || 'Intermediate'} Fit
                      </span>
                    </div>
                  </div>

                  {/* "Why Matched?" Vector Breakdown Toggle */}
                  <div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : user.id)}
                      className="w-full flex items-center justify-between text-[11px] font-mono-ledger text-slate-600 hover:text-slate-900 font-bold pt-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                        Why did our algorithm match you?
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono-ledger text-[11.5px] text-slate-700 space-y-1.5 animate-fade-in">
                        {candidate.reasons.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CARD ACTION BUTTONS ────────────────────────────────── */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Start Room Live */}
                  <button
                    onClick={() => {
                      startLiveSession(
                        `1-on-1 Exchange: ${candidate.skillLearnMatch.offeredByThem}`,
                        user.name,
                        currentUser.name,
                        candidate.skillLearnMatch.offeredByThem
                      );
                      setActiveTab('session');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    title="Launch Live Study Room"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Study Room</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Chat with Peer */}
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
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Chat</span>
                    </button>

                    {/* Propose Bilateral Barter Request */}
                    <button
                      onClick={() => handleOpenProposal(candidate)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 shrink-0" />
                      <span>Propose Swap</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. MODAL: LIST NEW SKILL TO TEACH / LEARN */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isAddSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="paper-card w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up">
            <button
              onClick={() => setIsAddSkillModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setAddSkillTab('teach')}
                className={`flex-1 py-2 rounded-xl text-xs font-mono-ledger font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addSkillTab === 'teach' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>List Skill to Teach</span>
              </button>
              <button
                type="button"
                onClick={() => setAddSkillTab('learn')}
                className={`flex-1 py-2 rounded-xl text-xs font-mono-ledger font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addSkillTab === 'learn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Add Learning Goal</span>
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                  {addSkillTab === 'teach' ? 'Skill You Can Teach' : 'Skill You Want to Learn'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python & Machine Learning, Acoustic Guitar, Figma..."
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-sans"
                />
              </div>

              {/* Popular Auto-Suggestions */}
              <div>
                <p className="text-[11px] font-mono-ledger font-bold text-slate-500 mb-1.5">Popular suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILL_SUGGESTIONS.slice(0, 6).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewSkillName(s)}
                      className="px-2.5 py-1 rounded-full text-[10.5px] font-mono-ledger bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newSkillCategory}
                    onChange={e => setNewSkillCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                    Proficiency Level
                  </label>
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner (Foundational)</option>
                    <option value="Intermediate">Intermediate (Practicing)</option>
                    <option value="Advanced">Advanced (Expert)</option>
                  </select>
                </div>
              </div>

              {addSkillTab === 'teach' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newSkillYears}
                      onChange={e => setNewSkillYears(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                      Hourly Rate (Credits)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={newSkillRateCredits}
                      onChange={e => setNewSkillRateCredits(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                {addSkillTab === 'teach' ? 'Publish Teaching Skill to Marketplace' : 'Save Learning Goal & Find Instructors'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. MODAL: PEER FULL PROFILE & SKILL PROOFS */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {selectedPeerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="paper-card w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPeerProfile(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <img
                src={selectedPeerProfile.avatar}
                alt={selectedPeerProfile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-lg text-slate-900">{selectedPeerProfile.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-sans">{selectedPeerProfile.headline}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono-ledger text-slate-500 mt-1">
                  <span className="text-amber-700 font-bold">⭐ {selectedPeerProfile.trustScore?.averageRating || 4.9}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{selectedPeerProfile.trustScore?.overallScore}/100 Trust Score</span>
                  <span>•</span>
                  <span>{selectedPeerProfile.college}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedPeerProfile.bio && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                {selectedPeerProfile.bio}
              </div>
            )}

            {/* Skills Offered (Teaching) */}
            <div className="space-y-2">
              <h4 className="font-mono-ledger font-bold text-xs uppercase text-slate-700">Skills Taught:</h4>
              <div className="space-y-2">
                {selectedPeerProfile.skillsToTeach?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{s.skillName}</p>
                      <p className="text-[10px] font-mono-ledger text-amber-800">{s.level} • {s.yearsExperience || 2} yrs experience</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-mono-ledger font-bold text-xs">
                      {s.hourlyRateCredits || 1.0} Credits/hr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Learning */}
            <div className="space-y-2">
              <h4 className="font-mono-ledger font-bold text-xs uppercase text-slate-700">Looking to Learn:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPeerProfile.skillsToLearn?.map((g: any, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono-ledger font-bold text-xs">
                    {g.skillName} ({g.targetLevel || 'Intermediate'})
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  const learnSkill = selectedPeerProfile.skillsToTeach?.[0]?.skillName || 'General Skills';
                  setSelectedPeerProfile(null);
                  startLiveSession(
                    `1-on-1 Exchange: ${learnSkill}`,
                    selectedPeerProfile.name,
                    currentUser.name,
                    learnSkill
                  );
                  setActiveTab('session');
                }}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Study Room</span>
              </button>
              <button
                onClick={() => {
                  const teachSkill = selectedPeerProfile.skillsToTeach?.[0]?.skillName || 'Skills';
                  setSelectedPeerProfile(null);
                  openChatWithPeer({
                    id: selectedPeerProfile.id,
                    name: selectedPeerProfile.name,
                    avatar: selectedPeerProfile.avatar,
                    skill: teachSkill,
                    headline: selectedPeerProfile.headline,
                    rating: selectedPeerProfile.trustScore?.averageRating || 5.0,
                  });
                }}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Open Chat</span>
              </button>
              <button
                onClick={() => {
                  const candidateObj = candidates.find(c => c.user.id === selectedPeerProfile.id);
                  setSelectedPeerProfile(null);
                  if (candidateObj) {
                    handleOpenProposal(candidateObj);
                  }
                }}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Propose Swap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. MODAL: PROPOSE BILATERAL BARTER SWAP */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {proposalModalPeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="paper-card w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up space-y-5">
            <button
              onClick={() => setProposalModalPeer(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full text-[10.5px] font-mono-ledger font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                1-on-1 Barter Agreement
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900 mt-2">
                Propose Swap with {proposalModalPeer.name}
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Zero currency exchange. You trade 1 hour of your skill for 1 hour of their skill with escrow protection.
              </p>
            </div>

            <form onSubmit={handleSendProposalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                  Skill You Will Teach:
                </label>
                <select
                  value={proposalMySkill}
                  onChange={e => setProposalMySkill(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none"
                >
                  {currentUser.skillsToTeach?.map((s, idx) => (
                    <option key={idx} value={s.skillName}>{s.skillName} ({s.level})</option>
                  ))}
                  {(!currentUser.skillsToTeach || currentUser.skillsToTeach.length === 0) && (
                    <option value="General Skills">General Technical Guidance</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                  Skill You Want from {proposalModalPeer.name.split(' ')[0]}:
                </label>
                <select
                  value={proposalTheirSkill}
                  onChange={e => setProposalTheirSkill(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none"
                >
                  {proposalModalPeer.skillsToTeach?.map((s: any, idx: number) => (
                    <option key={idx} value={s.skillName}>{s.skillName} ({s.level})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-ledger font-bold text-slate-700 mb-1.5">
                  Custom Notes / Meeting Preference (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Available weekday evenings or weekends for a live hands-on coding drill..."
                  value={proposalNotes}
                  onChange={e => setProposalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-mono-ledger text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Smart contract escrow automatically holds 1.0 barter credits upon agreement.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Bilateral Swap Request</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
