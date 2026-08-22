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
  Repeat,
  Coins,
  FileCheck,
  Medal,
  Video,
} from 'lucide-react';
import { ScreenTab } from '../layout/HeaderNav';

interface ProgressDashboardProps {
  onNavigate: (tab: ScreenTab) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'roadmap'>('overview');

  const xp = currentUser.xpPoints;
  const nextLevelXP = Math.ceil(xp / 500) * 500;
  const xpProgress = ((xp % 500) / 500) * 100;

  const allUsers = [
    { rank: 1, name: 'Priya Sharma', hours: 48, xp: 4800, streak: 45, avatar: 'https://i.pravatar.cc/150?img=5' },
    { rank: 2, name: 'Alex Rivera', hours: 32, xp: currentUser.xpPoints, streak: currentUser.streakDays, avatar: currentUser.avatar },
    { rank: 3, name: 'Maya Chen', hours: 28, xp: 2800, streak: 21, avatar: 'https://i.pravatar.cc/150?img=2' },
    { rank: 4, name: 'David Kim', hours: 22, xp: 2200, streak: 14, avatar: 'https://i.pravatar.cc/150?img=3' },
    { rank: 5, name: 'Liam OBrien', hours: 18, xp: 1800, streak: 10, avatar: 'https://i.pravatar.cc/150?img=4' },
  ];

  const badgesAll = [
    { id: 'first_teach', title: 'First Session', desc: 'Completed first teaching session', iconEl: <GraduationCap className="w-6 h-6 text-amber-600" />, earned: true },
    { id: 'streak_7', title: '7-Day Streak', desc: 'Taught 7 days in a row', iconEl: <Flame className="w-6 h-6 text-orange-500" />, earned: true },
    { id: 'verified', title: 'ID Verified', desc: 'Identity verification passed', iconEl: <ShieldCheck className="w-6 h-6 text-emerald-600" />, earned: currentUser.trustScore.identityVerified },
    { id: 'chain_master', title: 'Study Room Master', desc: 'Completed a live peer exchange session', iconEl: <Video className="w-6 h-6 text-blue-600" />, earned: true },
    { id: 'top_teacher', title: 'Top Teacher', desc: 'Rated 5 stars in 3+ sessions', iconEl: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />, earned: currentUser.trustScore.averageRating >= 4.5 },
    { id: 'streak_30', title: '30-Day Streak', desc: '30 consecutive days of teaching', iconEl: <Trophy className="w-6 h-6 text-amber-600" />, earned: currentUser.streakDays >= 30 },
    { id: 'bounty_hunter', title: 'Bounty Hunter', desc: 'Won 1+ skill bounty bids', iconEl: <Coins className="w-6 h-6 text-purple-600" />, earned: false },
    { id: 'college_verified', title: '.EDU Verified', desc: 'Verified university student', iconEl: <Award className="w-6 h-6 text-emerald-600" />, earned: currentUser.collegeVerified },
    { id: 'cert_100', title: 'Cert Master', desc: 'Earned 5+ credential blocks', iconEl: <FileCheck className="w-6 h-6 text-indigo-600" />, earned: false },
  ];

  const roadmapItems = [
    { step: 1, label: 'Set up profile', done: true },
    { step: 2, label: 'Add first skill to teach', done: currentUser.skillsToTeach.length > 0 },
    { step: 3, label: 'Add first learning goal', done: currentUser.skillsToLearn.length > 0 },
    { step: 4, label: 'Send your first match request', done: currentUser.teachingHours > 0 },
    { step: 5, label: 'Complete a live study session', done: currentUser.teachingHours > 0 },
    { step: 6, label: 'Earn your first Skill Credit', done: currentUser.totalCreditsEarned > 0 },
    { step: 7, label: 'Earn a verified credential block', done: currentUser.trustScore.skillVerifiedCount > 0 },
    { step: 8, label: 'Host a live peer study room', done: false },
    { step: 9, label: 'Reach 100 XP', done: xp >= 100 },
    { step: 10, label: 'Maintain a 7-day streak', done: currentUser.streakDays >= 7 },
  ];

  const completedSteps = roadmapItems.filter(r => r.done).length;

  return (
    <div className="py-6 max-w-[1180px] mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            My Learning Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Your personal progress across all skill exchanges and sessions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('matches')}
          className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 whitespace-nowrap"
        >
          Find Matches <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* XP */}
        <div className="paper-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">XP Points</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{xp.toLocaleString()}</p>
          <div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono-ledger">
              {nextLevelXP - xp} XP to next level
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="paper-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{currentUser.streakDays} <span className="text-base font-sans text-slate-500">days</span></p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">Keep teaching to maintain streak!</p>
        </div>

        {/* Teaching Hours */}
        <div className="paper-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Teaching Hours</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-black text-2xl text-emerald-700">{currentUser.teachingHours} <span className="text-base font-sans text-slate-500">hrs</span></p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">{currentUser.learningHours} hrs learning</p>
        </div>

        {/* Badges */}
        <div className="paper-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Badges Earned</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-display font-black text-2xl text-purple-700">{badgesAll.filter(b => b.earned).length}</p>
          <p className="text-[10px] text-slate-400 font-mono-ledger">of {badgesAll.length} total badges</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 w-fit">
        {(['overview', 'badges', 'roadmap'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap ${
              activeTab === t ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600'
            }`}
          >
            {t === 'overview' ? '📊 Overview' : t === 'badges' ? '🏅 Badges' : '🗺️ Roadmap'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Skill breakdown */}
          <div className="paper-card p-6 bg-white space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900">Teaching vs Learning Balance</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-700 font-bold">Teaching — {currentUser.skillsToTeach.length} skills</span>
                  <span className="font-mono-ledger text-slate-500">{currentUser.teachingHours} hrs</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-700 font-bold">Learning — {currentUser.skillsToLearn.length} goals</span>
                  <span className="font-mono-ledger text-slate-500">{currentUser.learningHours} hrs</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Community Leaderboard */}
          <div className="paper-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900">Community Leaderboard</h2>
              <span className="text-[10px] font-mono-ledger text-slate-400 uppercase">This Week</span>
            </div>
            <div className="space-y-3">
              {allUsers.map(u => (
                <div
                  key={u.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    u.name === currentUser.name
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-xs shrink-0 ${
                    u.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    u.rank === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                    u.rank === 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    #{u.rank}
                  </span>
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name} {u.name === currentUser.name ? '(You)' : ''}</p>
                    <p className="text-[10px] font-mono-ledger text-slate-500">{u.hours} hrs taught • {u.streak} day streak</p>
                  </div>
                  <span className="text-xs font-mono-ledger font-bold text-amber-700 whitespace-nowrap">{u.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badgesAll.map(badge => (
            <div
              key={badge.id}
              className={`paper-card p-5 text-center space-y-2 flex flex-col items-center justify-between ${
                badge.earned ? 'bg-white' : 'bg-slate-50 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                badge.earned ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-slate-100 border-slate-200 grayscale opacity-40'
              }`}>
                {badge.earned ? badge.iconEl : <Lock className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-xs text-slate-900">{badge.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{badge.desc}</p>
              </div>
              <div>
                {badge.earned ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-mono-ledger font-bold border border-emerald-200">
                    Earned
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-mono-ledger font-bold">
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="paper-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-900">Your Getting-Started Roadmap</h2>
            <span className="text-xs font-mono-ledger text-slate-500 font-bold">{completedSteps}/{roadmapItems.length} done</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedSteps / roadmapItems.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {roadmapItems.map((item, i) => (
              <div
                key={item.step}
                className={`flex items-center gap-3 p-3 rounded-xl text-xs transition-all ${
                  item.done
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-slate-50 border border-slate-200/60'
                }`}
              >
                {item.done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
                <span className={`font-medium ${item.done ? 'text-slate-700' : 'text-slate-500'}`}>
                  {item.label}
                </span>
                {!item.done && i === completedSteps && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 whitespace-nowrap">
                    Next step
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
