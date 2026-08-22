'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Award, CheckCircle2, Star, AlertCircle, HelpCircle, Sparkles, BookOpen } from 'lucide-react';

export const SkillVerificationCenter: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();
  const [activeTestSkill, setActiveTestSkill] = useState<string | null>(null);

  const trust = currentUser.trustScore;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Trust & Verification
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Non-Manipulable Score
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Verification & <span className="text-gradient-primary">Trust Score Center</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Skills are rigorously verified via AI assessments, portfolio reviews, and continuous session micro-quizzes. Trust Score combines attendance, ratings, and account integrity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-right min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Overall Trust Score</span>
            <div className="text-3xl font-black text-cyan-400">{trust.overallScore}/100</div>
            <span className="text-[10.5px] text-emerald-400 font-semibold">Tier 1 Verified Mentor</span>
          </div>
        </div>
      </div>

      {/* Trust Score Breakdown Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px]">Attendance Rate</span>
          <p className="text-xl font-bold text-emerald-400">{trust.attendanceRate}%</p>
          <p className="text-[10px] text-slate-500">Zero unexcused no-shows</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px]">Average Peer Rating</span>
          <p className="text-xl font-bold text-amber-400 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" /> {trust.averageRating}
          </p>
          <p className="text-[10px] text-slate-500">Across {trust.completedSessions} completed sessions</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px]">Cancellation Rate</span>
          <p className="text-xl font-bold text-cyan-400">{trust.cancellationRate}%</p>
          <p className="text-[10px] text-slate-500">&lt;5% platform threshold</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px]">Verified Skills</span>
          <p className="text-xl font-bold text-indigo-400">{trust.skillVerifiedCount} Verified</p>
          <p className="text-[10px] text-slate-500">AI tests + Transcript proofs</p>
        </div>
      </div>

      {/* Your Skills Verification Status */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Skills Offered & Verification Levels
          </h2>
          <p className="text-xs text-slate-400">
            Take AI assessments to advance from Beginner → Intermediate → Expert. Expert status requires 10+ transcript-verified sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentUser.skillsToTeach.map(offering => (
            <div
              key={offering.skillId}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{offering.skillName}</h3>
                  <span className="text-[11px] text-indigo-300 font-semibold">{offering.category}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {offering.verificationBadge || 'Verified'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                <div>
                  <span>Level: </span>
                  <strong className="text-white">{offering.level}</strong>
                </div>
                <div>
                  <span>Experience: </span>
                  <strong className="text-white">{offering.yearsExperience} yrs</strong>
                </div>
                <div>
                  <span>Proofs: </span>
                  <strong className="text-cyan-400">{offering.proofCount || 12}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('credential-ledger')}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  View Cryptographic Proof Ledger ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
