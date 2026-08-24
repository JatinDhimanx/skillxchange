'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionTranscriptProof } from '../../types';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const VerifiedTranscriptProof: React.FC = () => {
  const { transcriptProofs, activeQuizProof, setActiveQuizProof, submitMicroQuiz } = useApp();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([0, 0, 0]);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    const updated = [...selectedAnswers];
    updated[qIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeQuizProof) {
      submitMicroQuiz(activeQuizProof.id, selectedAnswers);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                <Award className="w-3 h-3 text-teal-400" /> Section 60.2 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Continuous Proof of Learning
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified-by-Transcript <span className="text-gradient-emerald">Skill Proof & Micro-Quizzes</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Static tests are outdated. After every live session, AI extracts taught concepts from real speech/whiteboard transcripts and generates session-linked follow-up micro-quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transcriptProofs.map(proof => (
          <div
            key={proof.id}
            className="glass-panel-emerald rounded-3xl p-6 sm:p-7 border border-emerald-500/30 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{proof.skillName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {proof.masteryPercentage}% Mastery
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Learner: <strong className="text-slate-200">{proof.learnerName}</strong> • Teacher: <strong className="text-slate-200">{proof.teacherName}</strong>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{proof.date}</span>
              </div>

              {/* Summary of What Was Taught */}
              <div className="space-y-2 text-xs">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> AI-Distilled Session Transcript Summary:
                </span>
                <p className="text-slate-300 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 leading-relaxed">
                  "{proof.sessionSummaryNotes}"
                </p>
              </div>

              {/* Concepts Verified */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] uppercase font-bold text-slate-400">Tested Key Concepts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {proof.conceptsTaught.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2.5 py-1 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Micro-Quiz Trigger & Verification Badge */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified: Session #{proof.sessionId}</span>
              </div>

              <button
                onClick={() => {
                  setSelectedAnswers(new Array(proof.quizQuestions.length).fill(0));
                  setActiveQuizProof(proof);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Retake / Test Micro-Quiz</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Micro-Quiz Modal */}
      {activeQuizProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setActiveQuizProof(null)}>
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-emerald-500/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900">
              <div>
                <span className="text-[10.5px] uppercase font-bold text-emerald-400 tracking-wider">
                  Session #{activeQuizProof.sessionId} • AI-Generated Micro-Quiz
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Verify Mastery: {activeQuizProof.skillName}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuizProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuizSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {activeQuizProof.quizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white text-xs">
                        {qIdx + 1}. {q.question}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        Concept: {q.conceptTested}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAnswers[qIdx] === optIdx
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={selectedAnswers[qIdx] === optIdx}
                            onChange={() => handleSelectOption(qIdx, optIdx)}
                            className="accent-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Passing this quiz appends a tamper-evident credential block to the Cryptographic Ledger!
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveQuizProof(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Submit & Mint Verifiable Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
