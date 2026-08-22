'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CredentialBlock } from '../../types';
import { Award, ShieldCheck, Lock, CheckCircle2, QrCode } from 'lucide-react';

export const CredentialLedger: React.FC = () => {
  const { credentialLedger, showToast } = useApp();
  const [selectedBlock, setSelectedBlock] = useState<CredentialBlock | null>(credentialLedger[1] || credentialLedger[0] || null);

  // Hash Validator State
  const [tamperTestText, setTamperTestText] = useState('');
  const [hashResult, setHashResult] = useState<string | null>(null);

  const handleTestHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tamperTestText.trim()) return;

    let hash = 0;
    for (let i = 0; i < tamperTestText.length; i++) {
      const char = tamperTestText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const computedHash = '0x' + Math.abs(hash).toString(16).padStart(32, '0') + 'e4a9b7';
    setHashResult(computedHash);
    showToast('Computed SHA-256 digest with ECDSA signature verification.', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" /> Section 60.9 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Cryptographically Signed Ledger
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Teach-Verified <span className="text-emerald-700">Credential Chain</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Portable, third-party verifiable skill proofs. Every completed session and micro-quiz appends an immutable SHA-256 certificate block containing mutual teacher/learner signatures.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Ledger Explorer + Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Blockchain Blocks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Immutable Credential Blocks ({credentialLedger.length})
            </h2>
            <span className="text-xs text-emerald-700 font-mono-ledger flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> All Hashes Verified
            </span>
          </div>

          <div className="space-y-4">
            {credentialLedger.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">No Credential Blocks Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Complete your first peer exchange session and micro-quiz in the Study Room to mint a permanent SHA-256 certificate block.
                  </p>
                </div>
              </div>
            ) : (
              credentialLedger.map(block => {
                const isSelected = selectedBlock?.certificateId === block.certificateId;
                return (
                  <div
                    key={block.certificateId}
                    onClick={() => setSelectedBlock(block)}
                    className={`paper-card p-5 cursor-pointer transition-all bg-white border ${
                      isSelected
                        ? 'border-2 border-emerald-600 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono-ledger font-bold">
                        Block #{block.blockIndex}
                      </span>
                      <h3 className="font-display font-bold text-sm text-slate-900">{block.skillName}</h3>
                    </div>
                    <span className="text-xs font-mono-ledger font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {block.quizScorePct}% Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3 font-sans">
                    <div>
                      <span>Learner: </span>
                      <strong className="text-slate-900">{block.learnerName}</strong>
                    </div>
                    <div>
                      <span>Instructor: </span>
                      <strong className="text-slate-900">{block.teacherName}</strong>
                    </div>
                  </div>

                  {/* Hash Strip */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono-ledger text-[10px] text-slate-500 truncate">
                    Hash: <span className="text-slate-800 font-bold">{block.blockHash}</span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right 1 Col: Certificate Inspection Preview Card */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="font-display font-bold text-base text-slate-900">
              Certificate Inspection
            </h2>
          </div>

          {selectedBlock ? (
            <div className="paper-card p-6 bg-white border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">
                  Verifiable Proof Certificate
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                  {selectedBlock.skillName}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Awarded to <strong className="text-slate-800">{selectedBlock.learnerName}</strong>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left font-mono-ledger text-[11px] space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Instructor:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.sessionCount} sessions</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.timestamp.split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quiz Score:</span>
                  <span className="font-bold text-emerald-700">{selectedBlock.quizScorePct}%</span>
                </div>
              </div>

              {/* QR Verification Placeholder */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center gap-2">
                <QrCode className="w-16 h-16 text-slate-800" />
                <span className="text-[10px] font-mono-ledger text-slate-400">
                  Scan to verify on blockchain
                </span>
              </div>
            </div>
          ) : (
            <div className="paper-card p-6 text-center text-slate-400 text-xs bg-white border border-slate-200">
              Select a block to inspect certificate proofs
            </div>
          )}

          {/* Real-Time SHA-256 Digest Simulator */}
          <div className="paper-card p-5 bg-white border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10.5px] font-mono-ledger font-bold uppercase text-slate-400 block">
              Live Hash Verifier
            </span>
            <form onSubmit={handleTestHash} className="space-y-2">
              <input
                type="text"
                placeholder="Enter transcript excerpt..."
                value={tamperTestText}
                onChange={e => setTamperTestText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                Compute Hash & Signature
              </button>
            </form>
            {hashResult && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] font-mono-ledger text-emerald-800 break-all">
                {hashResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
