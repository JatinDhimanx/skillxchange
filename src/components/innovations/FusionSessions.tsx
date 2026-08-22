'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Zap } from 'lucide-react';

export const FusionSessions: React.FC = () => {
  const { fusionOptions, requestFusionSession } = useApp();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Section 60.6 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Hybrid Skill Synthesis
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Cross-Skill <span className="text-amber-600">Fusion Sessions</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Why teach only one skill in isolation? The AI matcher analyzes complementary cognitive pairs (Language + Culinary, Shader Math + Music Synthesis, Rhetoric + Vocal Projection) to match dual-skill sessions in one exchange.
            </p>
          </div>
        </div>
      </div>

      {/* Fusion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fusionOptions.map(fusion => (
          <div
            key={fusion.id}
            className="paper-card rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-sm group border-t-4 border-t-amber-500 bg-white border border-slate-200"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {fusion.categoryCombo}
                </span>
                <span className="text-xs font-mono-ledger font-bold text-emerald-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {fusion.compatibilityScore}% Synergy
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                  {fusion.title}
                </h3>
              </div>

              {/* Dual Skill Badges */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono-ledger">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 font-bold">Skill 1:</span>
                  <span className="text-slate-900 font-semibold">{fusion.primarySkill}</span>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-bold">Skill 2:</span>
                  <span className="text-slate-900 font-semibold">{fusion.secondarySkill}</span>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1.5 text-xs font-sans">
                <span className="text-[10.5px] uppercase font-bold font-mono-ledger text-slate-400">
                  Cognitive Synergy Rationale:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11.5px] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  "{fusion.rationale}"
                </p>
              </div>

              <div className="text-[11px] font-mono-ledger text-slate-500">
                <span>Curriculum Split:</span> <strong className="text-slate-800">{fusion.suggestedSplitMins}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => requestFusionSession(fusion.id)}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 font-sans shadow-xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Request Fusion Match</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
