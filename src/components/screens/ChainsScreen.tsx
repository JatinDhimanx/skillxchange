'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GitFork, Check, Sparkles, Plus, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChainsScreen: React.FC = () => {
  const {
    futureCommitments,
    createFutureCommitment,
    showToast,
  } = useApp();

  const [selectedChainIdx, setSelectedChainIdx] = useState(0);
  const [isClosedMap, setIsClosedMap] = useState<{ [key: number]: boolean }>({});
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');

  // Future Commitment Modal Form
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [learningSkill, setLearningSkill] = useState('Conversational Japanese');
  const [teachingSkill, setTeachingSkill] = useState('Python for Data Science');
  const [maturityDays, setMaturityDays] = useState(45);

  const chainsData = [
    {
      id: 'chain-1',
      title: 'Python → Guitar → English Triad Loop',
      cycleEfficiency: '98%',
      caption: 'Alex teaches Maya (Python) • Maya teaches David (Guitar) • David teaches Alex (English)',
      nodes: [
        { name: 'Alex', skill: 'Python', role: 'Teacher', cx: 200, cy: 60, textY: 55, skillY: 70 },
        { name: 'Maya', skill: 'Guitar', role: 'Teacher', cx: 310, cy: 220, textY: 215, skillY: 230 },
        { name: 'David', skill: 'English', role: 'Teacher', cx: 90, cy: 220, textY: 215, skillY: 230 },
      ],
    },
    {
      id: 'chain-2',
      title: 'GLSL Shaders → Figma Systems → Japanese Triad Loop',
      cycleEfficiency: '95%',
      caption: 'David teaches Priya (English) • Priya teaches Liam (GLSL) • Liam teaches David (Music)',
      nodes: [
        { name: 'David', skill: 'English', role: 'Teacher', cx: 200, cy: 60, textY: 55, skillY: 70 },
        { name: 'Priya', skill: 'GLSL', role: 'Teacher', cx: 310, cy: 220, textY: 215, skillY: 230 },
        { name: 'Liam', skill: 'Audio', role: 'Teacher', cx: 90, cy: 220, textY: 215, skillY: 230 },
      ],
    },
  ];

  const currentChain = chainsData[selectedChainIdx] || chainsData[0];
  const isCurrentClosed = !!isClosedMap[selectedChainIdx];

  const handleCloseChain = () => {
    setIsClosedMap(prev => ({ ...prev, [selectedChainIdx]: true }));
    const msg = `Skill Chain "${currentChain.title}" closed successfully! All three participants notified with zero currency required.`;
    setAriaAnnouncement(msg);
    showToast(msg, 'success');

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D97706', '#059669', '#2563EB'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    createFutureCommitment(learningSkill, teachingSkill, maturityDays);
    setShowCommitModal(false);
  };

  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCommitModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="py-6 max-w-[1180px] mx-auto px-4 space-y-10">
      {/* Header & Triad Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            3-Person Skill Chains (Zero-Fiat Loops)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            When direct barter doesn't align, the platform completes triangular trade without fiat money.
          </p>
        </div>

        {/* Switch Triad Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold">
          {chainsData.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedChainIdx(idx)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                selectedChainIdx === idx
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Triad #{idx + 1} ({c.cycleEfficiency})
            </button>
          ))}
        </div>
      </div>

      {/* Centered Panel on Clean White Card */}
      <div className="paper-card p-6 sm:p-12 text-center space-y-8 max-w-3xl mx-auto shadow-xl border border-slate-200 relative overflow-hidden bg-white">
        {/* Title */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-amber-600" /> TRIAD LOOP DETECTED • {currentChain.cycleEfficiency} EFFICIENCY
          </span>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 pt-2">
            {currentChain.title}
          </h2>
        </div>

        {/* SVG Triangle Diagram */}
        <div className="relative w-full max-w-[420px] h-[300px] mx-auto bg-slate-50/60 rounded-3xl p-4 border border-slate-100">
          <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
            {/* Triangle Loop Edges */}
            <path
              d="M 200 65 L 310 215"
              fill="none"
              stroke={isCurrentClosed ? '#059669' : '#94A3B8'}
              strokeWidth={isCurrentClosed ? '3.5' : '2'}
              strokeDasharray={isCurrentClosed ? 'none' : '6 4'}
              className="transition-all duration-700"
            />
            <path
              d="M 310 220 L 90 220"
              fill="none"
              stroke={isCurrentClosed ? '#059669' : '#94A3B8'}
              strokeWidth={isCurrentClosed ? '3.5' : '2'}
              strokeDasharray={isCurrentClosed ? 'none' : '6 4'}
              className="transition-all duration-700"
            />
            <path
              d="M 90 215 L 200 65"
              fill="none"
              stroke={isCurrentClosed ? '#059669' : '#94A3B8'}
              strokeWidth={isCurrentClosed ? '3.5' : '2'}
              strokeDasharray={isCurrentClosed ? 'none' : '6 4'}
              className="transition-all duration-700"
            />

            {/* Nodes */}
            {currentChain.nodes.map((node, nIdx) => (
              <g key={nIdx}>
                <circle cx={node.cx} cy={node.cy} r="34" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
                <text
                  x={node.cx}
                  y={node.textY}
                  textAnchor="middle"
                  fill="#0F172A"
                  fontFamily="var(--font-fraunces)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {node.name}
                </text>
                <text
                  x={node.cx}
                  y={node.skillY}
                  textAnchor="middle"
                  fill="#D97706"
                  fontFamily="var(--font-mono-ledger)"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  Teaches {node.skill}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* One-Line Mono Caption */}
        <p className="font-mono-ledger text-xs sm:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {currentChain.caption}
        </p>

        {/* Action Button */}
        <div>
          <button
            onClick={handleCloseChain}
            disabled={isCurrentClosed}
            className={`btn-jade px-8 py-3.5 text-xs font-bold shadow-lg transition-all inline-flex items-center gap-2 ${
              isCurrentClosed ? 'opacity-90 cursor-default !bg-emerald-800' : 'hover:scale-[1.02]'
            }`}
          >
            {isCurrentClosed ? (
              <>
                <Check className="w-4 h-4" />
                <span>Chain closed ✓</span>
              </>
            ) : (
              <span>Close this chain</span>
            )}
          </button>
        </div>

        {/* Aria-Live Status Announcement */}
        <div aria-live="polite" className="sr-only">
          {ariaAnnouncement}
        </div>
      </div>

      {/* Section 60.1 Skill Futures Market */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Skill Futures Market (Forward Commitments)
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              "Learn Python today in exchange for teaching it in 60 days." Lock future teaching commitments to learn right now.
            </p>
          </div>

          <button
            onClick={() => setShowCommitModal(true)}
            className="btn-primary-marigold px-4 py-2 text-xs font-bold shadow-sm inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post forward commitment</span>
          </button>
        </div>

        {/* Futures Commitment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {futureCommitments.map(item => (
            <div key={item.id} className="paper-card p-6 flex flex-col justify-between space-y-4 bg-white border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.userAvatar}
                      alt={item.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-display font-bold text-xs text-slate-900">{item.userName}</h4>
                      <span className="text-[10px] font-mono-ledger text-slate-500">
                        Committed: {item.commitmentDate}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {item.maturityDays} Days to Maturity
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-mono-ledger text-[10px] font-bold text-emerald-700 uppercase">
                      Currently Learning:
                    </span>
                    <span className="font-bold text-slate-900">{item.skillCurrentlyLearning}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-mono-ledger text-[10px] font-bold text-amber-700 uppercase">
                      Committed to Teach:
                    </span>
                    <span className="font-bold text-slate-900">{item.skillCommittedToTeach}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono-ledger">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Escrow Backed
                </span>
                <span className="text-slate-500">Automated match trigger</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Forward Commitment */}
      {showCommitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCommitModal(false)}
        >
          <div
            className="paper-card p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Create Skill Future Commitment
              </h3>
              <button
                onClick={() => setShowCommitModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateCommitment} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold">Skill You Want to Learn Right Now:</label>
                <input
                  type="text"
                  value={learningSkill}
                  onChange={e => setLearningSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold">Skill You Promise to Teach Once Intermediate:</label>
                <input
                  type="text"
                  value={teachingSkill}
                  onChange={e => setTeachingSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold font-mono-ledger">Maturity Window (Days):</label>
                <input
                  type="number"
                  min={14}
                  max={120}
                  value={maturityDays}
                  onChange={e => setMaturityDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono-ledger font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-marigold px-6 py-2 text-xs shadow-xs">
                  Lock forward contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
