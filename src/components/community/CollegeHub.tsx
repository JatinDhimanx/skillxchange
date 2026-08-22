'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Trophy, CheckCircle2 } from 'lucide-react';

export const CollegeHub: React.FC = () => {
  const { currentUser, allUsers } = useApp();
  const collegeUsers = allUsers.filter(u => u.collegeVerified);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-amber-600" /> College Mode (.EDU Network)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Campus Network
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Campus <span className="text-amber-600">Skill Communities & Leaderboard</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Connect with verified peers in your university. Exchange technical, academic, and creative skills with zero friction and build your verified campus reputation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left sm:text-right min-w-[180px] font-mono-ledger shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Your Campus:</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{currentUser.college || 'IIT Delhi'}</div>
            <span className="text-[10.5px] text-emerald-700 font-bold flex items-center justify-start sm:justify-end gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Institutional .EDU Verified
            </span>
          </div>
        </div>
      </div>

      {/* Campus Leaderboard */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm bg-white border border-slate-200">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Campus Skill Leaderboard (Top Verified Mentors)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Ranked by verified teaching hours, peer ratings, and multi-party chain completions.
          </p>
        </div>

        <div className="space-y-3">
          {collegeUsers.map((user, idx) => (
            <div
              key={user.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-100/70"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-6 text-center font-display font-bold text-slate-400 text-sm">
                  #{idx + 1}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-slate-900">{user.name}</h3>
                    <span className="text-xs font-mono-ledger text-slate-500">({user.college})</span>
                  </div>
                  <p className="text-xs font-sans text-slate-600">
                    Teaches: <strong className="text-amber-700">{user.skillsToTeach[0]?.skillName || 'General Skills'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono-ledger text-left sm:text-right flex-wrap">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Teaching</span>
                  <span className="font-bold text-slate-900">{user.teachingHours} hrs</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trust Score</span>
                  <span className="font-bold text-emerald-700">{user.trustScore.overallScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">XP Level</span>
                  <span className="font-bold text-amber-700">{user.xpPoints} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
