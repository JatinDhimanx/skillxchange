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

  const xp = currentUser.xpPoints || 100;
  const nextLevelXP = Math.ceil((xp + 1) / 500) * 500;
  const xpProgress = Math.min(100, Math.max(10, ((xp % 500) / 500) * 100));

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
      desc: 'Completed first teaching session',
      iconEl: <GraduationCap className="w-6 h-6 text-amber-600" />,
      earned: currentUser.teachingHours > 0 || currentUser.trustScore.completedSessions > 0,
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      desc: 'Active teaching streak of 7+ days',
      iconEl: <Flame className="w-6 h-6 text-orange-500" />,
      earned: currentUser.streakDays >= 7,
    },
    {
      id: 'verified',
      title: 'ID Verified',
      desc: 'Identity verification passed on Supabase',
      iconEl: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      earned: Boolean(currentUser.trustScore.identityVerified),
    },
    {
      id: 'chain_master',
      title: 'Study Room Master',
      desc: 'Completed a live peer exchange session',
      iconEl: <Video className="w-6 h-6 text-blue-600" />,
      earned: currentUser.teachingHours > 0 || currentUser.learningHours > 0,
    },
    {
      id: 'top_teacher',
      title: 'Top Mentor',
      desc: 'Rated 4.8+ stars by peers',
      iconEl: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />,
      earned: currentUser.trustScore.averageRating >= 4.8,
    },
    {
      id: 'second_brain',
      title: 'Second Brain Scholar',
      desc: 'Saved 1+ notebook entries in database',
      iconEl: <BookMarked className="w-6 h-6 text-teal-600" />,
      earned: myNotebookCount > 0,
    },
    {
      id: 'bounty_hunter',
      title: 'Bounty Hunter',
      desc: 'Posted or fulfilled a skill bounty',
      iconEl: <Coins className="w-6 h-6 text-purple-600" />,
      earned: myBountiesCount > 0,
    },
    {
      id: 'college_verified',
      title: '.EDU Verified',
      desc: 'Verified university student profile',
      iconEl: <Award className="w-6 h-6 text-emerald-600" />,
      earned: Boolean(currentUser.collegeVerified),
    },
    {
      id: 'cert_100',
      title: 'Cryptographic Cert',
      desc: 'Earned 1+ verified credential block',
      iconEl: <FileCheck className="w-6 h-6 text-indigo-600" />,
      earned: myCertCount > 0,
    },
  ];

  const earnedBadgesCount = badgesAll.filter(b => b.earned).length;

  // Dynamic Getting Started Roadmap Items
  const roadmapItems = [
    { step: 1, label: 'Create & Verify Account', done: currentUser.id !== 'guest' },
    { step: 2, label: 'Publish Skill Offering to Catalog', done: currentUser.skillsToTeach.length > 0 },
    { step: 3, label: 'Add First Learning Goal', done: currentUser.skillsToLearn.length > 0 },
    { step: 4, label: 'Earn Initial Barter Credits (5 CR)', done: currentUser.creditsBalance > 0 },
    { step: 5, label: 'Save Notes in Second-Brain Notebook', done: myNotebookCount > 0 },
    { step: 6, label: 'Complete a Live Study Session', done: currentUser.teachingHours > 0 || currentUser.learningHours > 0 },
    { step: 7, label: 'Mint Cryptographic Credential Block', done: myCertCount > 0 },
    { step: 8, label: 'Reach 7-Day Streak', done: currentUser.streakDays >= 7 },
  ];

  const completedSteps = roadmapItems.filter(r => r.done).length;

  return (
    <div className="py-6 max-w-[1180px] mx-auto px-4 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="paper-card p-6 sm:p-8 bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl relative overflow-hidden shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono-ledger font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Live Supabase Database Metrics
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
              {currentUser.name}&apos;s Learning Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-sans">
              Track your skill progression, learning goals, verified credentials, and community standing in real time.
            </p>
          </div>

          <button
            onClick={() => onNavigate('matches')}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Find Skill Matches <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top 4 Real Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* XP */}
        <div className="paper-card p-5 bg-white space-y-3 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">XP Points</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">{xp.toLocaleString()}</p>
          <div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono-ledger">
              Rank #{myRank} in Community
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="paper-card p-5 bg-white space-y-3 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {currentUser.streakDays} <span className="text-base font-sans text-slate-500 font-normal">days</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">Active learning streak</p>
        </div>

        {/* Teaching vs Learning */}
        <div className="paper-card p-5 bg-white space-y-3 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Teaching Hours</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700">
            {currentUser.teachingHours} <span className="text-base font-sans text-slate-500 font-normal">hrs</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">{currentUser.learningHours} hrs learning completed</p>
        </div>

        {/* Certificates & Badges */}
        <div className="paper-card p-5 bg-white space-y-3 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Badges & Certs</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-purple-700">
            {earnedBadgesCount} <span className="text-xs font-sans text-purple-500 font-normal">({myCertCount} certs)</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">of {badgesAll.length} total achievements</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
        {(['overview', 'badges', 'roadmap'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap ${
              activeTab === t
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'overview' ? '📊 Overview & Goals' : t === 'badges' ? '🏅 Achievements & Badges' : '🗺️ Getting Started Roadmap'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & LEARNING GOALS ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dynamic Learning Goals Progress Trackers */}
          <div className="paper-card p-6 bg-white space-y-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Your Active Learning Goals Progress
                </h2>
                <p className="text-xs text-slate-500">
                  Update your mastery percentage below to save progress directly to the Supabase database.
                </p>
              </div>
              <span className="text-[11px] font-mono-ledger font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {currentUser.skillsToLearn.length} Active Goals
              </span>
            </div>

            {currentUser.skillsToLearn.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No learning goals added yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add target skills you wish to learn from your peer mentors to track your roadmap here.
                </p>
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
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
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-mono-ledger font-bold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <h3 className="font-display font-bold text-sm text-slate-900">{goal.skillName}</h3>
                            <p className="text-[11px] text-slate-500">
                              Target Level: <span className="font-semibold text-slate-700">{goal.targetLevel}</span> • Urgency: <span className="capitalize text-emerald-700 font-semibold">{goal.urgency}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono-ledger font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                            {currentPct}% Mastered
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, currentPct)}%` }}
                          />
                        </div>

                        {/* Interactive Progress Percent Selector Buttons */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono-ledger text-slate-400 uppercase font-bold">Update Progress:</span>
                          <div className="flex items-center gap-1.5">
                            {[0, 25, 50, 75, 100].map(pct => (
                              <button
                                key={pct}
                                onClick={() => updateLearningGoalProgress(goal.skillId, pct)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-ledger font-bold transition-all cursor-pointer ${
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

          {/* Real Supabase Community Leaderboard */}
          <div className="paper-card p-6 bg-white space-y-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Live Community Leaderboard
                </h2>
                <p className="text-xs text-slate-500">
                  Real registered members ranked dynamically from Supabase database by teaching hours & activity.
                </p>
              </div>
              <span className="text-[10px] font-mono-ledger text-slate-400 uppercase font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                Global Network
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedLeaderboard.map((u, index) => {
                const rank = index + 1;
                const isMe = u.id === currentUser.id;
                return (
                  <div
                    key={u.id || index}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                      isMe
                        ? 'bg-emerald-50/90 border-2 border-emerald-500/80 shadow-xs'
                        : 'bg-slate-50/70 border border-slate-200/60 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0 ${
                        rank === 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : rank === 3
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{rank}
                    </span>

                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {u.name} {isMe && <span className="text-emerald-700 font-black">(You)</span>}
                        </p>
                        {u.collegeVerified && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono-ledger font-bold">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono-ledger text-slate-500">
                        {u.teachingHours} hrs taught • {u.streakDays} day streak • {u.creditsBalance?.toFixed(1) || 5.0} CR
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
      )}

      {/* ── TAB 2: ACHIEVEMENTS & BADGES ─────────────────────────────────── */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Your Achievement Badges</h2>
              <p className="text-xs text-slate-500">Unlocked automatically as you engage in skill exchanges on the platform.</p>
            </div>
            <span className="text-xs font-mono-ledger font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {earnedBadgesCount} / {badgesAll.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {badgesAll.map(badge => (
              <div
                key={badge.id}
                className={`paper-card p-5 space-y-3 flex flex-col items-center text-center justify-between border transition-all ${
                  badge.earned
                    ? 'bg-white border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500/50'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                    badge.earned
                      ? 'bg-emerald-50/80 border-emerald-200 shadow-xs scale-105'
                      : 'bg-slate-100 border-slate-200 grayscale opacity-40'
                  }`}
                >
                  {badge.earned ? badge.iconEl : <Lock className="w-6 h-6 text-slate-400" />}
                </div>

                <div className="space-y-1">
                  <p className="font-display font-bold text-sm text-slate-900">{badge.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{badge.desc}</p>
                </div>

                <div>
                  {badge.earned ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono-ledger font-bold border border-emerald-200">
                      <Check className="w-3 h-3" /> Earned
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-mono-ledger font-bold border border-slate-200">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: GETTING STARTED ROADMAP ──────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="paper-card p-6 sm:p-8 bg-white space-y-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">Your Onboarding Roadmap</h2>
              <p className="text-xs text-slate-500">Complete these key milestones to become a top-tier peer mentor.</p>
            </div>
            <span className="text-xs font-mono-ledger text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {completedSteps} / {roadmapItems.length} Milestones Completed
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedSteps / roadmapItems.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500">
              <span>Overall Roadmap Progress</span>
              <span className="font-bold text-emerald-700">
                {Math.round((completedSteps / roadmapItems.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Roadmap Steps */}
          <div className="space-y-3">
            {roadmapItems.map((item, i) => (
              <div
                key={item.step}
                className={`flex items-center gap-3.5 p-4 rounded-2xl text-xs transition-all ${
                  item.done
                    ? 'bg-emerald-50/80 border border-emerald-200 text-slate-800'
                    : 'bg-slate-50/70 border border-slate-200/60 text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.done ? <CheckCircle2 className="w-4 h-4 text-white" /> : item.step}
                </div>

                <span className={`font-semibold text-xs flex-1 ${item.done ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                  {item.label}
                </span>

                {item.done ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono-ledger font-bold border border-emerald-200">
                    Completed
                  </span>
                ) : i === completedSteps ? (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-xs animate-pulse">
                    Next Goal
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-mono-ledger font-bold">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
