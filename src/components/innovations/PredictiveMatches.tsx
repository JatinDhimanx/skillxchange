'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PredictiveMatch } from '../../types';
import { Compass, Sparkles, Zap, ArrowRight } from 'lucide-react';

export const PredictiveMatches: React.FC = () => {
  const { predictiveMatches, setActiveTab } = useApp();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="ink-soft-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-[var(--marigold)]/15 text-[var(--marigold)] border border-[var(--marigold)]/40 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[var(--marigold)]" /> Section 60.7 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-[var(--jade)]/15 text-[var(--jade)] border border-[var(--jade)]/40">
                Roadmap Trajectory Forecasting
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--chalk)] tracking-tight">
              Predictive <span className="text-[var(--marigold)]">Future Matches</span>
            </h1>
            <p className="text-[var(--chalk)]/70 text-xs sm:text-sm max-w-2xl font-sans">
              Matching shouldn't only look at where you are today. Based on your current roadmap velocity, AI forecasts peer matches waiting for you 2–4 weeks ahead to keep your momentum soaring.
            </p>
          </div>
        </div>
      </div>

      {/* Predictive Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictiveMatches.map((pred: PredictiveMatch) => {
          const teacher = pred.targetTeacher;
          return (
            <div
              key={pred.id}
              className="paper-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[var(--ink)]/20"
                    />
                    <div>
                      <h3 className="font-display font-bold text-base text-[var(--ink)]">{teacher.name}</h3>
                      <p className="text-xs text-[var(--ink)]/60">{teacher.headline}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono-ledger">
                    <span className="px-3 py-1 rounded-full bg-[var(--jade)]/15 border border-[var(--jade)]/40 text-[var(--jade-dark)] text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-[var(--jade-dark)]" />
                      <span>{pred.projectedMatchScore}% Projected</span>
                    </span>
                    <p className="text-[10px] text-[var(--jade-dark)] mt-1 font-semibold">
                      Unlocks in ~{pred.estimatedTimeToUnlockWeeks} Weeks
                    </p>
                  </div>
                </div>

                {/* Track Target */}
                <div className="p-3.5 rounded-2xl bg-[var(--paper-soft)] border border-[var(--line)] space-y-1.5 text-xs font-mono-ledger">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--marigold-dark)] font-bold">Target Track:</span>
                    <span className="text-[var(--ink)] font-semibold">{pred.skillTrack}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--ink)]/60 text-[11px]">
                    <span>Prerequisite Milestone:</span>
                    <span className="text-[var(--jade-dark)] font-bold">Week {pred.prerequisiteRoadmapWeek} Complete</span>
                  </div>
                </div>

                {/* AI Trajectory Reason */}
                <div className="space-y-1.5 text-xs font-sans">
                  <span className="text-[10.5px] uppercase font-bold text-[var(--ink)]/60 flex items-center gap-1 font-mono-ledger">
                    <Sparkles className="w-3 h-3 text-[var(--marigold-dark)]" /> AI Trajectory Forecast:
                  </span>
                  <p className="text-[var(--ink)] leading-relaxed bg-[var(--paper-soft)] p-3 rounded-2xl border border-[var(--line)]">
                    "{pred.aiPredictionReason}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] font-mono-ledger text-[var(--ink)]/60">Current Velocity: 1.8 hrs/day</span>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="px-4 py-2 rounded-full bg-[var(--ink)] text-[var(--chalk)] text-xs font-bold hover:bg-[var(--ink-green-soft)] transition-all flex items-center gap-1.5 font-sans"
                >
                  <span>View Current Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
