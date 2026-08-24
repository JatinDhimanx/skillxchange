'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Zap,
  Plus,
  ArrowRight,
  Layers,
  CheckCircle2,
  Video,
  Search,
  BookOpen,
  X,
  TrendingUp,
  Brain,
  Clock,
  Compass,
} from 'lucide-react';
import { FusionSessionOption } from '../../types';

const CATEGORY_FILTERS = [
  'All Fusions',
  'Code & AI',
  'Design & 3D',
  'Music & Audio',
  'Language & Culture',
  'Business & Tech',
];

export const FusionSessions: React.FC = () => {
  const {
    fusionOptions,
    requestFusionSession,
    createFusionSession,
    startLiveSession,
    currentUser,
    setActiveTab,
    showToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Fusions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFusionForModal, setSelectedFusionForModal] = useState<FusionSessionOption | null>(null);
  const [customGoalNote, setCustomGoalNote] = useState('');
  const [requestedFusions, setRequestedFusions] = useState<Record<string, boolean>>({});

  // Propose Fusion Form State
  const [fusionTitle, setFusionTitle] = useState('');
  const [primarySkill, setPrimarySkill] = useState('');
  const [secondarySkill, setSecondarySkill] = useState('');
  const [categoryCombo, setCategoryCombo] = useState('Tech + Design');
  const [suggestedSplit, setSuggestedSplit] = useState('30m Tech + 30m Design');
  const [rationale, setRationale] = useState('');
  const [compatibilityScore, setCompatibilityScore] = useState(94);
  const [isCalculatingAI, setIsCalculatingAI] = useState(false);

  // Filter Fusions
  const filteredFusions = fusionOptions.filter(fusion => {
    const matchesCategory =
      selectedCategory === 'All Fusions' ||
      fusion.categoryCombo.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]);

    const matchesSearch =
      !searchQuery.trim() ||
      fusion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fusion.primarySkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fusion.secondarySkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fusion.rationale.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle Request Fusion
  const handleRequest = (fusion: FusionSessionOption) => {
    setSelectedFusionForModal(fusion);
    setCustomGoalNote(`Looking to accelerate my workflow by synthesizing ${fusion.primarySkill} and ${fusion.secondarySkill}!`);
  };

  const handleConfirmMatchRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFusionForModal) return;
    requestFusionSession(selectedFusionForModal.id);
    setRequestedFusions(prev => ({ ...prev, [selectedFusionForModal.id]: true }));
    showToast(`Cross-Skill Match requested for "${selectedFusionForModal.title}"! 🚀`, 'success');
    setSelectedFusionForModal(null);
  };

  // Launch Directly into Live Study Room
  const handleLaunchLiveRoom = (fusion: FusionSessionOption) => {
    startLiveSession(
      `Fusion: ${fusion.title}`,
      currentUser.name,
      'Peer Scholar',
      `${fusion.primarySkill} + ${fusion.secondarySkill}`
    );
    setActiveTab('session');
    showToast(`Launching Hybrid Live Room for "${fusion.title}"! 🚀`, 'success');
  };

  // AI Auto-Calculate Synergy
  const handleCalculateAISynergy = () => {
    if (!primarySkill.trim() || !secondarySkill.trim()) {
      showToast('Please enter both Primary and Secondary skills.', 'warning');
      return;
    }

    setIsCalculatingAI(true);
    setTimeout(() => {
      setIsCalculatingAI(false);
      const seed = (primarySkill.trim().length * 7 + secondarySkill.trim().length * 13) % 8;
      const calculated = 91 + seed;
      setCompatibilityScore(calculated);
      if (!fusionTitle) {
        setFusionTitle(`${primarySkill} & ${secondarySkill} Hybrid Studio`);
      }
      if (!rationale) {
        setRationale(
          `Mastering ${primarySkill} alongside ${secondarySkill} builds bidirectional cross-domain intuition, unlocking rapid prototyping and unique problem-solving heuristics.`
        );
      }
      showToast(`AI calculated ${calculated}% Cognitive Synergy! ✨`, 'success');
    }, 400);
  };

  // Submit New Fusion Form
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fusionTitle.trim() || !primarySkill.trim() || !secondarySkill.trim()) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    createFusionSession({
      title: fusionTitle.trim(),
      primarySkill: primarySkill.trim(),
      secondarySkill: secondarySkill.trim(),
      categoryCombo: categoryCombo.trim(),
      compatibilityScore,
      suggestedSplitMins: suggestedSplit.trim() || '30m + 30m',
      rationale:
        rationale.trim() ||
        `Synergistic combination of ${primarySkill} and ${secondarySkill} for accelerated hands-on learning.`,
      idealFor: 'Full-stack learners seeking cross-disciplinary mastery.',
    });

    // Reset
    setFusionTitle('');
    setPrimarySkill('');
    setSecondarySkill('');
    setRationale('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Cross-Skill Fusion Sessions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Hybrid Cognitive Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Pair two complementary skills in a single exchange session to accelerate learning retention and cross-domain intuition.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Hybrid Fusion</span>
        </button>
      </div>

      {/* ── Top Metric Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Available Fusions</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">{fusionOptions.length}</p>
          <span className="text-[10.5px] font-mono-ledger text-emerald-700 font-bold">Dual Tracks Active</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Average Synergy</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-amber-600">95%</p>
          <span className="text-[10.5px] font-mono-ledger text-slate-500">Cognitive Compatibility</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Session Structure</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700">50 / 50</p>
          <span className="text-[10.5px] font-mono-ledger text-emerald-700 font-bold">Reciprocal Time Split</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono-ledger font-bold uppercase text-slate-400">Credit Rate</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-purple-700">1 : 1</p>
          <span className="text-[10.5px] font-mono-ledger text-purple-600 font-bold">Zero-Fiat Barter Swap</span>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hybrid skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* ── Fusion Hybrid Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFusions.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-base text-slate-900">No Matching Fusion Sessions</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Propose a new hybrid dual-skill combination or choose another category filter.
            </p>
          </div>
        ) : (
          filteredFusions.map(fusion => {
            const isRequested = !!requestedFusions[fusion.id];
            return (
              <div
                key={fusion.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Category & Synergy Score */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {fusion.categoryCombo}
                    </span>
                    <span className="text-xs font-mono-ledger font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {fusion.compatibilityScore}% Synergy
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                    {fusion.title}
                  </h3>

                  {/* Dual Skill Interlock Bar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono-ledger space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 font-bold">Track A:</span>
                      <span className="text-slate-900 font-bold">{fusion.primarySkill}</span>
                    </div>
                    <div className="h-px bg-slate-200/80" />
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-bold">Track B:</span>
                      <span className="text-slate-900 font-bold">{fusion.secondarySkill}</span>
                    </div>
                  </div>

                  {/* Synergy Rationale */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-mono-ledger uppercase font-bold text-slate-400">
                      Cognitive Synergy:
                    </span>
                    <p className="text-slate-600 font-sans leading-relaxed text-[11.5px] bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70">
                      &ldquo;{fusion.rationale}&rdquo;
                    </p>
                  </div>

                  {/* Time Split */}
                  <div className="flex items-center justify-between text-[11px] font-mono-ledger text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Split:
                    </span>
                    <strong className="text-slate-800">{fusion.suggestedSplitMins}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleRequest(fusion)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
                      isRequested
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    {isRequested ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Match Requested</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Request Match</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleLaunchLiveRoom(fusion)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                    title="Launch Live Study Room"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── PROPOSE FUSION MODAL ─────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Propose Cross-Skill Fusion
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                      Primary Skill (Track A) *
                    </label>
                    <input
                      type="text"
                      value={primarySkill}
                      onChange={e => setPrimarySkill(e.target.value)}
                      placeholder="e.g. Python Backend"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                      Secondary Skill (Track B) *
                    </label>
                    <input
                      type="text"
                      value={secondarySkill}
                      onChange={e => setSecondarySkill(e.target.value)}
                      placeholder="e.g. UI/UX Figma"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* AI Auto-Calculate Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCalculateAISynergy}
                    disabled={isCalculatingAI || (!primarySkill && !secondarySkill)}
                    className="text-xs font-mono-ledger font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>{isCalculatingAI ? 'Calculating Synergy...' : '⚡ AI Calculate Synergy'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Fusion Workshop Title *
                  </label>
                  <input
                    type="text"
                    value={fusionTitle}
                    onChange={e => setFusionTitle(e.target.value)}
                    placeholder="e.g. Full-Stack AI Engineer & Design Synthesis"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                      Category Combination
                    </label>
                    <input
                      type="text"
                      value={categoryCombo}
                      onChange={e => setCategoryCombo(e.target.value)}
                      placeholder="e.g. Code + Design"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                      Curriculum Time Split
                    </label>
                    <input
                      type="text"
                      value={suggestedSplit}
                      onChange={e => setSuggestedSplit(e.target.value)}
                      placeholder="e.g. 30m Code + 30m Design"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Cognitive Synergy Rationale
                  </label>
                  <textarea
                    rows={2}
                    value={rationale}
                    onChange={e => setRationale(e.target.value)}
                    placeholder="Why does learning these two skills together accelerate mastery?"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Publish Fusion Concept 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CROSS-SKILL WORKSHOP MATCH REQUEST MODAL ──────────────────────── */}
      {selectedFusionForModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setSelectedFusionForModal(null)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Request Cross-Skill Match
                </h3>
              </div>
              <button
                onClick={() => setSelectedFusionForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMatchRequest} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Header overview */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-ledger uppercase font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                      {selectedFusionForModal.categoryCombo}
                    </span>
                    <span className="font-mono-ledger font-black text-xs text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" /> {selectedFusionForModal.compatibilityScore}% Synergy
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    {selectedFusionForModal.title}
                  </h4>
                </div>

                {/* Track A & Track B */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono-ledger text-amber-700 uppercase font-bold block">
                      Track A (First 30m)
                    </span>
                    <strong className="text-xs text-slate-900 block font-mono-ledger">
                      {selectedFusionForModal.primarySkill}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono-ledger text-emerald-700 uppercase font-bold block">
                      Track B (Next 30m)
                    </span>
                    <strong className="text-xs text-slate-900 block font-mono-ledger">
                      {selectedFusionForModal.secondarySkill}
                    </strong>
                  </div>
                </div>

                {/* Rationale */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono-ledger text-slate-500 uppercase font-bold">
                    Cognitive Synergy Rationale:
                  </span>
                  <p className="text-slate-700 font-sans leading-relaxed p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    &ldquo;{selectedFusionForModal.rationale}&rdquo;
                  </p>
                </div>

                {/* Custom Goal Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Your Learning Goal & Focus Note:
                  </label>
                  <textarea
                    rows={2}
                    value={customGoalNote}
                    onChange={e => setCustomGoalNote(e.target.value)}
                    placeholder="Tell your matched peer what project or drill you want to build during this session..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedFusionForModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLaunchLiveRoom(selectedFusionForModal);
                    setSelectedFusionForModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Launch Live Room</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Confirm Match Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
