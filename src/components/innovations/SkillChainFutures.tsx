'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitFork,
  Hourglass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Clock,
  Zap,
} from 'lucide-react';

export const SkillChainFutures: React.FC = () => {
  const {
    currentUser,
    skillChains,
    futureCommitments,
    createFutureCommitment,
    acceptSkillChain,
    startLiveSession,
  } = useApp();

  const [skillLearning, setSkillLearning] = useState('Acoustic Guitar & Fingerstyle');
  const [skillToTeach, setSkillToTeach] = useState('Python for Data Science');
  const [maturityDays, setMaturityDays] = useState(45);
  const [showNewCommitmentModal, setShowNewCommitmentModal] = useState(false);

  const handleSubmitCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    createFutureCommitment(skillLearning, skillToTeach, maturityDays);
    setShowNewCommitmentModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-10 border border-[#F2EFE6]/15 bg-[#111e19] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-[#E7A33E]/20 text-[#E7A33E] border border-[#E7A33E]/40 flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-[#E7A33E]" /> SECTION 60.1 INNOVATION
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono-ledger text-[#2E8C74] bg-[#2E8C74]/20 border border-[#2E8C74]/40">
                TIME-DEFERRED GRAPH MATCHING
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F2EFE6] tracking-tight">
              3-Person Skill Chains & <span className="text-[#E7A33E]">Futures Market</span>
            </h1>
            <p className="text-[#D9D0B8] text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              When two people can't trade directly, the system detects multi-party loops: <strong className="text-[#F2EFE6]">A → B → C → A</strong>. Nobody pays money; everyone gives what they know and receives what they seek.
            </p>
          </div>

          <button
            onClick={() => setShowNewCommitmentModal(true)}
            className="px-5 py-3 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] text-xs font-bold transition-all flex items-center gap-2 shadow-sm font-sans shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post forward skill commitment</span>
          </button>
        </div>
      </div>

      {/* Part 1: Active 3-Person Skill Chains */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-[#F2EFE6] flex items-center gap-2">
              <GitFork className="w-5 h-5 text-[#E7A33E]" />
              Active 3-Person Zero-Fiat Skill Chains
            </h2>
            <p className="text-xs text-[#D9D0B8]">
              Closed reciprocal loops resolved by the graph optimizer without fiat currency.
            </p>
          </div>
          <span className="text-xs font-mono-ledger font-bold text-[#2E8C74] bg-[#2E8C74]/15 px-3 py-1 rounded-full border border-[#2E8C74]">
            98% Cycle Efficiency
          </span>
        </div>

        <div className="space-y-6">
          {skillChains.map(chain => (
            <div
              key={chain.id}
              className="rounded-3xl p-6 sm:p-8 bg-[#111e19] border border-[#F2EFE6]/20 relative space-y-6"
            >
              {/* Chain Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2EFE6]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[#F2EFE6]">{chain.name}</span>
                    <span
                      className={`text-[10px] font-mono-ledger font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        chain.status === 'active'
                          ? 'bg-[#2E8C74]/20 text-[#2E8C74] border border-[#2E8C74]'
                          : 'bg-[#E7A33E]/20 text-[#E7A33E] border border-[#E7A33E]'
                      }`}
                    >
                      {chain.status === 'active' ? '● Active Triad Loop' : 'Proposed Triad Loop'}
                    </span>
                  </div>
                  <p className="text-xs text-[#D9D0B8] mt-0.5 font-sans">
                    Estimated duration: {chain.estimatedCompletionWeeks} weeks • 3 confirmed participants
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {chain.status !== 'active' ? (
                    <button
                      onClick={() => acceptSkillChain(chain.id)}
                      className="px-5 py-2.5 rounded-xl bg-[#2E8C74] hover:bg-[#247561] text-[#F2EFE6] text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lock triad exchange</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        startLiveSession('Triad Session: Python to Guitar', 'Alex Rivera', 'Maya Chen', 'Python for Data Science')
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Enter session room</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3-Column Ledger Pairing Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {chain.nodes.map((node, nIdx) => {
                  const nextNode = chain.nodes[(nIdx + 1) % chain.nodes.length];
                  return (
                    <div
                      key={node.userId}
                      className="ledger-paper rounded-2xl p-5 relative flex flex-col justify-between space-y-4 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={node.userAvatar}
                            alt={node.userName}
                            className="w-10 h-10 rounded-full object-cover border border-[#1A2620]/20"
                          />
                          <div>
                            <p className="font-display font-bold text-xs text-[#1A2620]">
                              Node {nIdx + 1}: {node.userName}
                            </p>
                            <p className="text-[10px] font-mono-ledger text-[#53635A]">Timezone Matched</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620]">
                          {node.sessionDurationMins}m / wk
                        </span>
                      </div>

                      {/* Teach (Marigold) vs Learn (Jade) Split */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E7A33E]/50">
                          <span className="text-[9.5px] font-mono-ledger uppercase font-bold text-[#E7A33E] block">
                            Teaches (Giving):
                          </span>
                          <p className="font-bold text-[#1A2620] mt-0.5">{node.teachesSkill}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#2E8C74]/50">
                          <span className="text-[9.5px] font-mono-ledger uppercase font-bold text-[#2E8C74] block">
                            Learns (Receiving):
                          </span>
                          <p className="font-bold text-[#1A2620] mt-0.5">{node.learnsSkill}</p>
                        </div>
                      </div>

                      {/* Direction to Next Node */}
                      <div className="pt-2 flex items-center justify-between text-[10.5px] font-mono-ledger text-[#53635A] border-t border-[#D9D0B8]">
                        <span>Hands off to:</span>
                        <span className="text-[#2E8C74] font-bold flex items-center gap-1">
                          {nextNode.userName} <ArrowRight className="w-3 h-3 text-[#2E8C74]" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Loop Explanation */}
              <div className="p-3.5 rounded-2xl bg-[#16261F] border border-[#F2EFE6]/15 flex flex-wrap items-center justify-between gap-3 text-xs text-[#D9D0B8]">
                <div className="flex items-center gap-2 font-mono-ledger">
                  <ShieldCheck className="w-4 h-4 text-[#2E8C74]" />
                  <span>Escrow Rule: A teaches B ➔ B teaches C ➔ C teaches A</span>
                </div>
                <span className="text-[11px] font-mono-ledger text-[#E7A33E]">
                  Zero currency deducted. Credits logged symmetrically.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Section 60.1 Skill Futures Market */}
      <div className="space-y-4 pt-6 border-t border-[#F2EFE6]/15">
        <div>
          <h2 className="font-display font-bold text-lg text-[#F2EFE6] flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-[#E7A33E]" />
            Skill Chain Futures Market (Forward Commitments)
          </h2>
          <p className="text-xs text-[#D9D0B8]">
            Commit to teach in 30–60 days once you achieve prerequisite mastery. AI re-runs cycle matching nightly to connect future chains in advance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {futureCommitments.map(fut => (
            <div
              key={fut.id}
              className="ledger-paper rounded-3xl p-6 relative flex flex-col justify-between space-y-4 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-[#D9D0B8] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={fut.userAvatar}
                      alt={fut.userName}
                      className="w-11 h-11 rounded-full object-cover border border-[#1A2620]/20"
                    />
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#1A2620]">{fut.userName}</h3>
                      <p className="text-[10.5px] font-mono-ledger text-[#53635A]">Forward Skill Node</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#16261F] text-[#F2EFE6] text-[10.5px] font-mono-ledger font-bold">
                    {fut.maturityDays} Days to Maturity
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#D9D0B8]">
                    <span className="text-[9.5px] font-mono-ledger uppercase font-bold text-[#53635A]">
                      Currently Learning:
                    </span>
                    <p className="font-bold text-[#1A2620] mt-0.5">{fut.skillCurrentlyLearning}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E7A33E]">
                    <span className="text-[9.5px] font-mono-ledger uppercase font-bold text-[#E7A33E]">
                      Committed to Teach Upon Completion:
                    </span>
                    <p className="font-bold text-[#1A2620] mt-0.5">{fut.skillCommittedToTeach}</p>
                    <p className="text-[10px] text-[#53635A] mt-1 font-mono-ledger">
                      Target Level: {fut.targetPrerequisiteLevel} Grade
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9D0B8] flex items-center justify-between text-xs font-mono-ledger">
                <span className="text-[#53635A] text-[10.5px]">Locked on: {fut.commitmentDate}</span>
                <span className="text-[#2E8C74] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E8C74]" /> Graph Engine: 2 Cycles Forming
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Future Commitment */}
      {showNewCommitmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16261F]/80 backdrop-blur-md">
          <div className="ledger-paper rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
              <h3 className="font-display font-bold text-lg text-[#1A2620] flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-[#E7A33E]" /> Post Forward Skill Commitment
              </h3>
              <button
                onClick={() => setShowNewCommitmentModal(false)}
                className="text-[#53635A] hover:text-[#1A2620] text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitCommitment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#1A2620] font-bold">Skill You Are Currently Learning:</label>
                <input
                  type="text"
                  value={skillLearning}
                  onChange={e => setSkillLearning(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1A2620] font-bold">Skill You Commit to Teach Upon Completion:</label>
                <input
                  type="text"
                  value={skillToTeach}
                  onChange={e => setSkillToTeach(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1A2620] font-bold">Maturity Horizon (Days):</label>
                <select
                  value={maturityDays}
                  onChange={e => setMaturityDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E]"
                >
                  <option value={30}>30 Days (~1 Month)</option>
                  <option value={45}>45 Days (~1.5 Months)</option>
                  <option value={60}>60 Days (~2 Months)</option>
                  <option value={90}>90 Days (~3 Months)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#53635A] text-[11px] font-mono-ledger">
                [NOTE] The graph optimizer holds this pending node to automatically complete multi-party loops as maturity approaches.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCommitmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#16261F]/10 text-[#1A2620] font-semibold hover:bg-[#16261F]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] font-bold shadow-sm"
                >
                  Lock Forward Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
