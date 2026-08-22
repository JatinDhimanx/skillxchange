'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Activity,
  Award,
} from 'lucide-react';

export const SoftSkillsLab: React.FC = () => {
  const {
    softSkillMetrics,
    isPracticingSoftSkills,
    startSoftSkillPractice,
    stopSoftSkillPractice,
    recordSpeechSnippet,
  } = useApp();

  const [speechInput, setSpeechInput] = useState('');
  const [drillScenario, setDrillScenario] = useState('Executive Board Pitch (3-Min Pitch)');

  const handleTestSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speechInput.trim()) return;
    recordSpeechSnippet(speechInput);
    setSpeechInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Mic className="w-3 h-3 text-amber-600" /> Section 60.10 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                AI Voice Practice Partner
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              AI Practice Partner & <span className="text-amber-600">Speech Metrics Lab</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              For public speaking, debate, and executive interviews where learning is structured practice. AI scores clarity, filler words, speech pace (WPM), and tonal confidence in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isPracticingSoftSkills ? (
              <button
                onClick={startSoftSkillPractice}
                className="btn-primary-marigold px-6 py-3 text-xs shadow-md flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Voice Practice</span>
              </button>
            ) : (
              <button
                onClick={stopSoftSkillPractice}
                className="px-6 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-2"
              >
                <MicOff className="w-4 h-4 text-rose-600" />
                <span>End Practice Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Audio Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clarity Score */}
        <div className="paper-card p-5 rounded-2xl space-y-2 shadow-sm bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
            <span className="uppercase font-bold text-[10px]">Clarity Index:</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-700">
            {softSkillMetrics.clarityScore}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${softSkillMetrics.clarityScore}%` }}
            ></div>
          </div>
        </div>

        {/* Pace WPM */}
        <div className="paper-card p-5 rounded-2xl space-y-2 shadow-sm bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
            <span className="uppercase font-bold text-[10px]">Speech Pace:</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            {softSkillMetrics.wordsPerMinute} <span className="text-xs font-mono-ledger text-slate-400">WPM</span>
          </div>
          <span className="text-[10.5px] font-mono-ledger text-amber-700 font-bold block">
            {softSkillMetrics.wordsPerMinute >= 120 && softSkillMetrics.wordsPerMinute <= 160 ? 'Optimal Cadence' : 'Adjust Speed'}
          </span>
        </div>

        {/* Filler Words */}
        <div className="paper-card p-5 rounded-2xl space-y-2 shadow-sm bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
            <span className="uppercase font-bold text-[10px]">Filler Words:</span>
            <span className="text-xs font-mono-ledger text-rose-600 font-bold">"um", "like"</span>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-rose-600">
            {softSkillMetrics.fillerWordCount} <span className="text-xs font-mono-ledger text-slate-400">/ min</span>
          </div>
          <span className="text-[10.5px] font-mono-ledger text-slate-500 block">
            Target: &lt; 2 per minute
          </span>
        </div>

        {/* Confidence */}
        <div className="paper-card p-5 rounded-2xl space-y-2 shadow-sm bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
            <span className="uppercase font-bold text-[10px]">Vocal Energy:</span>
            <Award className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-blue-700">
            {softSkillMetrics.confidenceScore}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${softSkillMetrics.confidenceScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interactive Speech Tester */}
      <div className="paper-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Interactive Speech Excerpt Simulator
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Type or transcribe a spoken paragraph to test NLP filler word counting and clarity scoring.
            </p>
          </div>
          <select
            value={drillScenario}
            onChange={e => setDrillScenario(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
          >
            <option value="Executive Board Pitch (3-Min Pitch)">Executive Board Pitch</option>
            <option value="Technical System Architecture Defense">System Architecture Defense</option>
            <option value="Introductory English Conversational Fluency">Conversational Fluency</option>
          </select>
        </div>

        <form onSubmit={handleTestSpeech} className="space-y-4">
          <textarea
            rows={3}
            placeholder="e.g. 'So basically, um, our distributed key-value store achieves, like, sub-millisecond p99 latency by utilizing memory-mapped files and asynchronous WAL commits...'"
            value={speechInput}
            onChange={e => setSpeechInput(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed font-sans"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-jade px-6 py-2.5 text-xs font-bold shadow-xs active:scale-95"
            >
              Analyze Speech Excerpt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
