'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  ShieldCheck,
  Award,
  Flame,
  Clock,
  Coins,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl p-6 sm:p-10 border border-[#F2EFE6]/15 bg-[#111e19] relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#E7A33E] shadow-2xl"
              />
              <span className="absolute -bottom-1.5 -right-1.5 p-1 bg-[#16261F] rounded-full">
                <ShieldCheck className="w-5 h-5 text-[#2E8C74]" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-xl sm:text-2xl text-[#F2EFE6]">{currentUser.name}</h1>
                <span className="text-xs font-mono-ledger text-[#D9D0B8]">{currentUser.handle}</span>
                {currentUser.collegeVerified && (
                  <span title="Verified Campus Member">
                    <GraduationCap className="w-4 h-4 text-[#2E8C74]" />
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#D9D0B8] max-w-xl font-sans">{currentUser.headline}</p>
              <p className="text-xs text-[#9ca3af]">{currentUser.bio}</p>
              <div className="flex items-center gap-3 pt-1 text-xs font-mono-ledger text-[#D9D0B8]">
                <span>{currentUser.location}</span>
                <span>•</span>
                <span>{currentUser.timezone}</span>
              </div>
            </div>
          </div>

          {/* Ledger Stamped Trust Badge & Stats */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Signature Stamped Badge */}
            <div className="ledger-stamp text-[#2E8C74] bg-[#2E8C74]/10 border-[#2E8C74] text-xs font-bold py-1 px-3">
              ★ {currentUser.trustScore.overallScore}/100 TRUST VERIFIED
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16261F] border border-[#F2EFE6]/15 text-xs font-mono-ledger space-y-1.5 text-right min-w-[200px]">
              <div className="flex items-center justify-end gap-1.5 text-[#E7A33E]">
                <Flame className="w-3.5 h-3.5 fill-[#E7A33E]" />
                <span>{currentUser.streakDays}-Day Learning Streak</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[#F2EFE6]">
                <Coins className="w-3.5 h-3.5 text-[#E7A33E]" />
                <span>{currentUser.creditsBalance.toFixed(1)} Credits Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Ledger: Teach (Marigold) | Learn (Jade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teach Column (Marigold) */}
        <div className="ledger-paper rounded-3xl p-6 space-y-4 shadow-lg border-t-4 border-t-[#E7A33E]">
          <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
            <h2 className="font-display font-bold text-sm text-[#E7A33E] uppercase tracking-wider">
              Skills Offered (You Teach)
            </h2>
            <span className="text-xs font-mono-ledger text-[#53635A] font-bold">
              {currentUser.teachingHours} hrs logged
            </span>
          </div>

          <div className="space-y-3">
            {currentUser.skillsToTeach.map(s => (
              <div
                key={s.skillId}
                className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#D9D0B8] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A2620] text-sm">{s.skillName}</span>
                  <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded bg-[#E7A33E]/15 text-[#1A2620] border border-[#E7A33E]">
                    {s.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#53635A] text-[11px] font-mono-ledger">
                  <span>{s.yearsExperience} Years Experience</span>
                  <span className="text-[#2E8C74] font-bold">{s.proofCount || 12} Verified Proofs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learn Column (Jade) */}
        <div className="ledger-paper rounded-3xl p-6 space-y-4 shadow-lg border-t-4 border-t-[#2E8C74]">
          <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
            <h2 className="font-display font-bold text-sm text-[#2E8C74] uppercase tracking-wider">
              Learning Goals (You Learn)
            </h2>
            <span className="text-xs font-mono-ledger text-[#53635A] font-bold">
              {currentUser.learningHours} hrs logged
            </span>
          </div>

          <div className="space-y-3">
            {currentUser.skillsToLearn.map(l => (
              <div
                key={l.skillId}
                className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#D9D0B8] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A2620] text-sm">{l.skillName}</span>
                  <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded bg-[#2E8C74]/15 text-[#2E8C74] border border-[#2E8C74]">
                    Target: {l.targetLevel}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono-ledger text-[#53635A]">
                    <span>Roadmap Progress:</span>
                    <span className="text-[#2E8C74] font-bold">{l.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#D9D0B8] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2E8C74] h-full rounded-full"
                      style={{ width: `${l.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="ledger-paper rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
        <h2 className="font-display font-bold text-sm text-[#1A2620] uppercase tracking-wider">
          Earned Skill Ledger Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.badges.map(badge => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#D9D0B8] flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E7A33E]/15 border border-[#E7A33E]/30 flex items-center justify-center text-lg shrink-0">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#1A2620] truncate">{badge.title}</h3>
                <p className="text-[10.5px] text-[#53635A] line-clamp-1">{badge.description}</p>
                <span className="text-[9.5px] text-[#53635A] font-mono-ledger">{badge.unlockedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
