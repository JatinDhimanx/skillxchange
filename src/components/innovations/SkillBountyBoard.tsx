'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillBounty } from '../../types';
import {
  Target,
  PlusCircle,
  Coins,
  Calendar,
  Send,
  Sparkles,
  Star,
  Clock,
} from 'lucide-react';

export const SkillBountyBoard: React.FC = () => {
  const { currentUser, bounties, postBounty, submitBountyBid } = useApp();
  const [showNewBountyModal, setShowNewBountyModal] = useState(false);
  const [selectedBountyForBid, setSelectedBountyForBid] = useState<SkillBounty | null>(null);

  // Form states
  const [bountyTitle, setBountyTitle] = useState('');
  const [bountySkill, setBountySkill] = useState('Conversational Japanese (N4/N3)');
  const [bountyCategory, setBountyCategory] = useState('Languages');
  const [bountyDesc, setBountyDesc] = useState('');
  const [bountyCredits, setBountyCredits] = useState(15);
  const [bountyInr, setBountyInr] = useState(4500);
  const [bountyWeeks, setBountyWeeks] = useState(6);

  // Bid states
  const [proposedCurriculum, setProposedCurriculum] = useState('');
  const [estimatedSessions, setEstimatedSessions] = useState(8);
  const [bidCredits, setBidCredits] = useState(14);

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    postBounty(bountyTitle, bountySkill, bountyCategory, bountyDesc, bountyCredits, bountyInr, bountyWeeks);
    setShowNewBountyModal(false);
    setBountyTitle('');
    setBountyDesc('');
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBountyForBid) {
      submitBountyBid(selectedBountyForBid.id, proposedCurriculum, estimatedSessions, bidCredits);
      setSelectedBountyForBid(null);
      setProposedCurriculum('');
    }
  };

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewBountyModal(false);
        setSelectedBountyForBid(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-10 border border-slate-200 bg-white shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Target className="w-3 h-3 text-rose-600" /> SECTION 60.5 INNOVATION
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono-ledger text-amber-800 bg-amber-50 border border-amber-200">
                REVERSE DEMAND MARKETPLACE
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Skill Bounty Board & <span className="text-amber-600">Teacher Bidding</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              When standard searches don't match, post a demand bounty with your timeline and credit/cash budget. Verified instructors bid with structured curricula.
            </p>
          </div>

          <button
            onClick={() => setShowNewBountyModal(true)}
            className="btn-primary-marigold px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post learning bounty</span>
          </button>
        </div>
      </div>

      {/* Bounties List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bounties.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">No Bounties Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Looking for specialized coaching or rare skills? Post a demand bounty with your timeline and barter credit budget.
              </p>
            </div>
            <button
              onClick={() => setShowNewBountyModal(true)}
              className="btn-primary-marigold px-5 py-2.5 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post First Learning Bounty</span>
            </button>
          </div>
        ) : (
          bounties.map(bounty => (
            <div
              key={bounty.id}
              className="paper-card rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 border-l-4 border-l-rose-500 bg-white border border-slate-200"
            >
            <div className="space-y-4">
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={bounty.learnerAvatar}
                    alt={bounty.learnerName}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">{bounty.learnerName}</h3>
                    <span className="text-[11px] font-mono-ledger text-emerald-700 font-bold">{bounty.skillName}</span>
                  </div>
                </div>

                <div className="text-right font-mono-ledger">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-xs">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{bounty.budgetCredits} CR (₹{bounty.budgetInr})</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Timeline: {bounty.deadlineWeeks} Weeks</p>
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-sm text-slate-900">{bounty.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed p-3 rounded-2xl bg-slate-50 border border-slate-200 font-sans">
                  "{bounty.description}"
                </p>
              </div>

              {/* Bids received */}
              {bounty.bids && bounty.bids.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono-ledger uppercase font-bold text-slate-400">
                    Instructor Proposals ({bounty.bids.length}):
                  </span>
                  {bounty.bids.map(bid => (
                    <div
                      key={bid.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={bid.teacherAvatar}
                            alt={bid.teacherName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900">{bid.teacherName}</span>
                          <span className="text-[10px] font-mono-ledger text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {bid.teacherRating}
                          </span>
                        </div>
                        <span className="font-mono-ledger font-bold text-emerald-700">
                          {bid.bidPriceCredits} Credits ({bid.estimatedSessions} Sessions)
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-sans">"{bid.proposedCurriculum}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-mono-ledger">
              <span className="text-slate-400 text-[10.5px]">Posted on: {bounty.createdAt}</span>

              {bounty.learnerId !== currentUser.id && (
                <button
                  onClick={() => setSelectedBountyForBid(bounty)}
                  className="btn-primary-marigold px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit curriculum bid</span>
                </button>
              )}
            </div>
          </div>
        )))}
      </div>

      {/* Modal: Post New Bounty */}
      {showNewBountyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowNewBountyModal(false)}
        >
          <div
            className="paper-card rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" /> Post Reverse Learning Bounty
              </h3>
              <button
                onClick={() => setShowNewBountyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateBounty} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold">Bounty Title / Goal:</label>
                <input
                  type="text"
                  placeholder="e.g. Master GLSL Raymarching shaders for creative portfolio"
                  value={bountyTitle}
                  onChange={e => setBountyTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Category:</label>
                  <select
                    value={bountyCategory}
                    onChange={e => setBountyCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design & Creative</option>
                    <option value="Music">Arts & Music</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Target Skill:</label>
                  <input
                    type="text"
                    value={bountySkill}
                    onChange={e => setBountySkill(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold">Detailed Requirements & Context:</label>
                <textarea
                  rows={3}
                  placeholder="Describe your current level, weekly availability, and target deadline..."
                  value={bountyDesc}
                  onChange={e => setBountyDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold font-mono-ledger">Credits:</label>
                  <input
                    type="number"
                    min={1}
                    value={bountyCredits}
                    onChange={e => setBountyCredits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-mono-ledger font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold font-mono-ledger">Fiat (₹):</label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={bountyInr}
                    onChange={e => setBountyInr(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-mono-ledger font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold font-mono-ledger">Weeks:</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={bountyWeeks}
                    onChange={e => setBountyWeeks(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-mono-ledger font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBountyModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-marigold px-6 py-2 text-xs shadow-xs font-bold"
                >
                  Post Bounty to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Bid */}
      {selectedBountyForBid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBountyForBid(null)}
        >
          <div
            className="paper-card rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" /> Submit Teacher Proposal
              </h3>
              <button
                onClick={() => setSelectedBountyForBid(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4 text-xs font-sans">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-[11px] font-mono-ledger">Bounty for {selectedBountyForBid.learnerName}:</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedBountyForBid.title}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold">Proposed Custom Curriculum & Milestones:</label>
                <textarea
                  rows={3}
                  placeholder="Outline key milestones, session breakdown, and target outcomes..."
                  value={proposedCurriculum}
                  onChange={e => setProposedCurriculum(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold font-mono-ledger">Total Sessions:</label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedSessions}
                    onChange={e => setEstimatedSessions(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono-ledger font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold font-mono-ledger">Bid Price (Credits):</label>
                  <input
                    type="number"
                    min={1}
                    value={bidCredits}
                    onChange={e => setBidCredits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono-ledger font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBountyForBid(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-marigold px-6 py-2 text-xs shadow-xs font-bold"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
