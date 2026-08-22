'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Star,
  Trophy,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  GraduationCap,
  ShieldCheck,
  Coins,
  FileCheck,
  Video,
  Sparkles,
  BookMarked,
  Check,
  Target,
  BarChart3,
  Layers,
  Crown,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { ScreenTab } from '../layout/HeaderNav';

interface ProgressDashboardProps {
  onNavigate: (tab: ScreenTab) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    allUsers,
    credentialLedger,
    notebookEntries,
    bounties,
    updateLearningGoalProgress,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'roadmap'>('overview');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const xp = currentUser.xpPoints || 100;
  const userLevel = Math.floor(xp / 500) + 1;
  const nextLevelXP = userLevel * 500;
  const currentLevelBaseXP = (userLevel - 1) * 500;
  const xpInCurrentLevel = xp - currentLevelBaseXP;
  const xpProgress = Math.min(100, Math.max(5, (xpInCurrentLevel / 500) * 100));

  const levelTitles: Record<number, string> = {
    1: 'Novice Learner',
    2: 'Skill Explorer',
    3: 'Active Peer Mentor',
    4: 'Senior Knowledge Barterer',
    5: 'Master Guild Educator',
  };

  const currentLevelTitle = levelTitles[userLevel] || 'Distinguished Scholar';

  // Dynamic calculations from Supabase DB state
  const myCertCount = credentialLedger.filter(
    c => c.learnerId === currentUser.id || c.teacherId === currentUser.id
  ).length;
  const myNotebookCount = notebookEntries.length;
  const myBountiesCount = bounties.filter(b => b.learnerId === currentUser.id).length;

  // Real Leaderboard sorted dynamically from DB users
  const sortedLeaderboard = [...allUsers]
    .map(u => ({
      ...u,
      calculatedScore: (u.teachingHours || 0) * 100 + (u.xpPoints || 0) + (u.streakDays || 1) * 20,
    }))
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const userRankIndex = sortedLeaderboard.findIndex(u => u.id === currentUser.id);
  const myRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  // Dynamic Badges evaluated against real user properties from database
  const badgesAll = [
    {
      id: 'first_teach',
      title: 'First Session',
      category: 'teaching',
      desc: 'Completed first teaching session',
      iconEl: <GraduationCap className="w-6 h-6 text-amber-600" />,
      earned: currentUser.teachingHours > 0 || currentUser.trustScore.completedSessions > 0,
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      category: 'consistency',
      desc: 'Active teaching streak of 7+ days',
      iconEl: <Flame className="w-6 h-6 text-orange-500" />,
      earned: currentUser.streakDays >= 7,
    },
    {
      id: 'verified',
      title: 'ID Verified',
      category: 'trust',
      desc: 'Identity verification passed on Supabase',
      iconEl: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      earned: Boolean(currentUser.trustScore.identityVerified),
    },
    {
      id: 'chain_master',
      title: 'Study Room Master',
      category: 'exchange',
      desc: 'Completed a live peer exchange session',
      iconEl: <Video className="w-6 h-6 text-blue-600" />,
      earned: currentUser.teachingHours > 0 || currentUser.learningHours > 0,
    },
    {
      id: 'top_teacher',
      title: 'Top Mentor',
      category: 'teaching',
      desc: 'Rated 4.8+ stars by peers',
      iconEl: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />,
      earned: currentUser.trustScore.averageRating >= 4.8,
    },
    {
      id: 'second_brain',
      title: 'Second Brain Scholar',
      category: 'learning',
      desc: 'Saved 1+ notebook entries in database',
      iconEl: <BookMarked className="w-6 h-6 text-teal-600" />,
      earned: myNotebookCount > 0,
    },
    {
      id: 'bounty_hunter',
      title: 'Bounty Hunter',
      category: 'exchange',
      desc: 'Posted or fulfilled a skill bounty',
      iconEl: <Coins className="w-6 h-6 text-purple-600" />,
      earned: myBountiesCount > 0,
    },
    {
      id: 'college_verified',
      title: '.EDU Verified',
      category: 'trust',
      desc: 'Verified university student profile',
      iconEl: <Award className="w-6 h-6 text-emerald-600" />,
      earned: Boolean(currentUser.collegeVerified),
    },
    {
      id: 'cert_100',
      title: 'Cryptographic Cert',
      category: 'trust',
      desc: 'Earned 1+ verified credential block',
      iconEl: <FileCheck className="w-6 h-6 text-indigo-600" />,
      earned: myCertCount > 0,
    },
  ];

  const earnedBadgesCount = badgesAll.filter(b => b.earned).length;
  const filteredBadges = badgesAll.filter(b => {
    if (badgeFilter === 'earned') return b.earned;
    if (badgeFilter === 'locked') return !b.earned;
    return true;
  });

  // Dynamic Getting Started Roadmap Items
  const roadmapItems = [
    { step: 1, label: 'Create & Verify Account', done: currentUser.id !== 'guest', desc: 'Secure session with encrypted identity' },
    { step: 2, label: 'Publish Skill Offering to Catalog', done: currentUser.skillsToTeach.length > 0, desc: 'List your skills to mentor other students' },
    { step: 3, label: 'Add First Learning Goal', done: currentUser.skillsToLearn.length > 0, desc: 'Define your desired skills and target roadmap' },
    { step: 4, label: 'Earn Initial Barter Credits (5 CR)', done: currentUser.creditsBalance > 0, desc: 'Genesis credit grant credited to your wallet' },
    { step: 5, label: 'Save Notes in Second-Brain Notebook', done: myNotebookCount > 0, desc: 'Capture key takeaways and code snippets' },
    { step: 6, label: 'Complete a Live Study Session', done: currentUser.teachingHours > 0 || currentUser.learningHours > 0, desc: 'Collaborate with audio/video & interactive board' },
    { step: 7, label: 'Mint Cryptographic Credential Block', done: myCertCount > 0, desc: 'Pass micro-quiz to mint immutable verification' },
    { step: 8, label: 'Reach 7-Day Consistency Streak', done: currentUser.streakDays >= 7, desc: 'Engage continuously in peer exchanges' },
  ];

  const completedSteps = roadmapItems.filter(r => r.done).length;

  return (
    <div className="py-6 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8 animate-fade-in font-sans">
      {/* ── 1. HERO BANNER WITH USER LEVEL ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 border border-slate-700/60 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono-ledger font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Level {userLevel} • {currentLevelTitle}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              {currentUser.name}&apos;s Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Track skill milestones, verify real-time knowledge proofs, and manage your learning trajectory across the decentralized peer network.
            </p>

            {/* Level XP Bar in Hero */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono-ledger">
                <span className="text-emerald-300 font-bold">{xp.toLocaleString()} Total XP</span>
                <span className="text-slate-400">{nextLevelXP - xp} XP to Level {userLevel + 1}</span>
              </div>
              <div className="h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('matches')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer font-sans"
            >
              <Compass className="w-4 h-4" /> Find Peer Matches
            </button>
            <button
              onClick={() => onNavigate('wallet')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-400" /> Wallet ({currentUser.creditsBalance?.toFixed(1) || 5.0} CR)
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── 2. TOP METRICS CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* XP Points */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">Total XP</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {xp.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500 border-t border-slate-100 pt-2">
            <span>Global Rank</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">#{myRank}</span>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">Streak</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {currentUser.streakDays} <span className="text-sm font-sans text-slate-500 font-normal">days</span>
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500 border-t border-slate-100 pt-2">
            <span>Status</span>
            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">🔥 On Fire</span>
          </div>
        </div>

        {/* Teaching & Learning Hours */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700 tracking-tight">
            {currentUser.teachingHours} <span className="text-sm font-sans text-slate-500 font-normal">hrs taught</span>
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500 border-t border-slate-100 pt-2">
            <span>Learning</span>
            <span className="font-bold text-emerald-700">{currentUser.learningHours} hrs completed</span>
          </div>
        </div>

        {/* Badges & Verifications */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">Achievements</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-purple-700 tracking-tight">
            {earnedBadgesCount} <span className="text-sm font-sans text-slate-500 font-normal">/ {badgesAll.length}</span>
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500 border-t border-slate-100 pt-2">
            <span>Verified Certs</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{myCertCount} Blocks</span>
          </div>
        </div>
      </div>

      {/* ── 3. TABS NAVIGATION ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 w-fit">
        {(['overview', 'badges', 'roadmap'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === t
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'overview' && <BarChart3 className="w-4 h-4 text-emerald-600" />}
            {t === 'badges' && <Award className="w-4 h-4 text-purple-600" />}
            {t === 'roadmap' && <Target className="w-4 h-4 text-amber-600" />}
            {t === 'overview' ? 'Overview & Goals' : t === 'badges' ? 'Achievements & Badges' : 'Onboarding Roadmap'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & ACTIVE GOALS ───────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Learning Goals with Interactive Updates (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Learning Goals Trajectory
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Click any mastery percentage to record live progress into the Supabase database.
                  </p>
                </div>
                <span className="text-[11px] font-mono-ledger font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {currentUser.skillsToLearn.length} Active Goals
                </span>
              </div>

              {currentUser.skillsToLearn.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 font-display">No learning goals defined yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                    Add skills you want to learn from verified peer mentors to track your personal roadmap here.
                  </p>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Add Learning Goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser.skillsToLearn.map((goal, idx) => {
                    const currentPct = goal.progressPercent || 0;
                    return (
                      <div
                        key={goal.skillId || idx}
                        className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-mono-ledger font-bold text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <h3 className="font-display font-bold text-sm text-slate-900">{goal.skillName}</h3>
                              <p className="text-[11px] text-slate-500 font-sans">
                                Target: <span className="font-semibold text-slate-700">{goal.targetLevel}</span> • Urgency: <span className="capitalize text-emerald-700 font-semibold">{goal.urgency}</span>
                              </p>
                            </div>
                          </div>

                          <span className="font-mono-ledger font-black text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            {currentPct}% Mastered
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="h-2.5 rounded-full bg-slate-200/90 overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, currentPct)}%` }}
                            />
                          </div>

                          {/* Quick Progress Selectors */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono-ledger text-slate-400 uppercase font-bold">Update Level:</span>
                            <div className="flex items-center gap-1.5">
                              {[0, 25, 50, 75, 100].map(pct => (
                                <button
                                  key={pct}
                                  onClick={() => updateLearningGoalProgress(goal.skillId, pct)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-mono-ledger font-bold transition-all cursor-pointer ${
                                    currentPct === pct
                                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teaching vs Learning Balance Ratio */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Teaching vs Learning Balance Ratio
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-sans">
                    <span className="text-amber-800 font-bold">Teaching — {currentUser.skillsToTeach.length} offerings</span>
                    <span className="font-mono-ledger text-slate-500">{currentUser.teachingHours} hrs</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(15, currentUser.teachingHours * 8))}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-sans">
                    <span className="text-emerald-800 font-bold">Learning — {currentUser.skillsToLearn.length} goals</span>
                    <span className="font-mono-ledger text-slate-500">{currentUser.learningHours} hrs</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(15, currentUser.learningHours * 8))}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Community Leaderboard (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Community Standings
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Live Supabase database ranking.
                  </p>
                </div>
                <span className="text-[10px] font-mono-ledger text-emerald-800 uppercase font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Global Net
                </span>
              </div>

              <div className="space-y-2.5">
                {sortedLeaderboard.slice(0, 7).map((u, index) => {
                  const rank = index + 1;
                  const isMe = u.id === currentUser.id;
                  return (
                    <div
                      key={u.id || index}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all ${
                        isMe
                          ? 'bg-emerald-50/90 border-2 border-emerald-500/90 shadow-xs'
                          : 'bg-slate-50/70 border border-slate-200/70 hover:bg-white'
                      }`}
                    >
                      {/* Podium Badges */}
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : rank === 3
                            ? 'bg-orange-100 text-orange-900 border border-orange-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rank === 1 ? '👑' : `#${rank}`}
                      </span>

                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {u.name}
                          </p>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono-ledger font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono-ledger text-slate-500">
                          {u.teachingHours || 0} hrs taught • {u.streakDays || 1}d streak
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono-ledger font-black text-emerald-700">
                          {(u.xpPoints || 100).toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACHIEVEMENTS & BADGES ─────────────────────────────────── */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Badges Filter & Summary */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Your Achievement Collection</h2>
              <p className="text-xs text-slate-500 font-sans">
                Milestones and badges unlocked through verified session attendance and peer exchanges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'earned', 'locked'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setBadgeFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    badgeFilter === f
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f} {f === 'earned' ? `(${earnedBadgesCount})` : f === 'locked' ? `(${badgesAll.length - earnedBadgesCount})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBadges.map(badge => (
              <div
                key={badge.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  badge.earned
                    ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                      badge.earned
                        ? 'bg-emerald-50/80 border-emerald-200 shadow-xs scale-105'
                        : 'bg-slate-100 border-slate-200 grayscale opacity-40'
                    }`}
                  >
                    {badge.earned ? badge.iconEl : <Lock className="w-6 h-6 text-slate-400" />}
                  </div>

                  {badge.earned ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono-ledger font-bold border border-emerald-200">
                      <Check className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-mono-ledger font-bold border border-slate-200">
                      Locked
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="font-display font-bold text-base text-slate-900">{badge.title}</p>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{badge.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] font-mono-ledger text-slate-400 uppercase">
                  Category: {badge.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: ONBOARDING ROADMAP ─────────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 flex-wrap gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Platform Mastery Roadmap</h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Complete these 8 milestones to earn the verified Master Mentor credential.
              </p>
            </div>
            <span className="text-xs font-mono-ledger text-emerald-700 font-bold bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
              {completedSteps} / {roadmapItems.length} Milestones Completed
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="space-y-2 max-w-xl">
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedSteps / roadmapItems.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-500">
              <span>Overall Roadmap Completion</span>
              <span className="font-black text-emerald-700">
                {Math.round((completedSteps / roadmapItems.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Roadmap Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roadmapItems.map((item, i) => (
              <div
                key={item.step}
                className={`flex items-start gap-4 p-5 rounded-2xl text-xs transition-all border ${
                  item.done
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-800 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/70 text-slate-500'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                    item.done ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : item.step}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-display font-bold text-sm ${item.done ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.label}
                    </p>
                    {item.done ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono-ledger font-bold">
                        Done
                      </span>
                    ) : i === completedSteps ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold animate-pulse">
                        Next
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
