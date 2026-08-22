'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Star,
  Plus,
  Trash2,
  Edit2,
  Lock,
  ExternalLink,
  QrCode,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    addSkillToTeach,
    removeSkillToTeach,
    addSkillToLearn,
    removeSkillToLearn,
    credentialLedger,
    showToast,
  } = useApp();

  // Edit Bio Modal
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);

  // Add Skill Modals
  const [showAddTeachModal, setShowAddTeachModal] = useState(false);
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newTeachCategory, setNewTeachCategory] = useState('Programming');
  const [newTeachLevel, setNewTeachLevel] = useState('Intermediate');
  const [newTeachYears, setNewTeachYears] = useState(3);

  const [showAddLearnModal, setShowAddLearnModal] = useState(false);
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newLearnLevel, setNewLearnLevel] = useState('Intermediate');

  // Credential Block QR Modal
  const [selectedCertBlock, setSelectedCertBlock] = useState<any | null>(null);

  const handleUpdateBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile(bio, headline);
    setShowEditBioModal(false);
  };

  const handleAddTeach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachSkill.trim()) return;
    addSkillToTeach(newTeachSkill, newTeachCategory, newTeachLevel, newTeachYears);
    setNewTeachSkill('');
    setShowAddTeachModal(false);
  };

  const handleAddLearn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) return;
    addSkillToLearn(newLearnSkill, newLearnLevel, 'high');
    setNewLearnSkill('');
    setShowAddLearnModal(false);
  };

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEditBioModal(false);
        setShowAddTeachModal(false);
        setShowAddLearnModal(false);
        setSelectedCertBlock(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="py-6 max-w-5xl w-full mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Header Card on Clean White */}
      <div className="paper-card p-5 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden space-y-4 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-amber-400 via-slate-100 to-emerald-400 p-1 flex items-center justify-center shadow-md">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-2xl object-cover border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 truncate">
                  {currentUser.name}
                </h1>
                <span className="font-mono-ledger text-xs text-slate-500 truncate">
                  {currentUser.handle}
                </span>
                {currentUser.collegeVerified && (
                  <span title="Verified Campus Member">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                )}
                <button
                  onClick={() => setShowEditBioModal(true)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Edit Headline and Bio"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-sans line-clamp-2 break-words">
                {currentUser.headline}
              </p>
              {currentUser.bio && (
                <p className="text-xs text-slate-500 font-sans line-clamp-2 break-words">
                  {currentUser.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono-ledger text-slate-500">
                <span>{currentUser.location}</span>
                <span>•</span>
                <span className="truncate">{currentUser.languages.join(', ')}</span>
                <span>•</span>
                <span className="font-bold text-slate-800">{currentUser.trustScore.completedSessions} sessions</span>
              </div>
            </div>
          </div>

          {/* Trust Score Stamp */}
          <div className="shrink-0 self-start sm:self-center">
            <div className="trust-score-stamp text-[11px] sm:text-xs shadow-xs font-mono-ledger font-bold">
              ★ {currentUser.trustScore.overallScore}/100 TRUST VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Skill Lists: You Teach (Left) | You Want to Learn (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: You Teach (Amber) */}
        <div className="paper-card p-6 space-y-4 shadow-sm border-t-4 border-t-amber-500 bg-white border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-amber-700 uppercase tracking-wider">
              You teach (Giving)
            </h2>
            <button
              onClick={() => setShowAddTeachModal(true)}
              className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-amber-600 transition-all"
            >
              <Plus className="w-3 h-3" /> Add skill
            </button>
          </div>

          <div className="space-y-3">
            {currentUser.skillsToTeach.map(s => (
              <div
                key={s.skillId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="font-bold text-slate-900 text-sm truncate min-w-0" title={s.skillName}>{s.skillName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      {s.level}
                    </span>
                    {currentUser.skillsToTeach.length > 1 && (
                      <button
                        onClick={() => removeSkillToTeach(s.skillId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono-ledger text-[11px] text-slate-500">
                  <span>{s.yearsExperience} Years Experience</span>
                  <span className="text-emerald-700 font-bold">{s.proofCount || 14} Verified Proofs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: You Want to Learn (Emerald) */}
        <div className="paper-card p-6 space-y-4 shadow-sm border-t-4 border-t-emerald-600 bg-white border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-emerald-700 uppercase tracking-wider">
              You want to learn (Receiving)
            </h2>
            <button
              onClick={() => setShowAddLearnModal(true)}
              className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add goal
            </button>
          </div>

          <div className="space-y-3">
            {currentUser.skillsToLearn.map(l => (
              <div
                key={l.skillId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="font-bold text-slate-900 text-sm truncate min-w-0" title={l.skillName}>{l.skillName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Target: {l.targetLevel}
                    </span>
                    {currentUser.skillsToLearn.length > 1 && (
                      <button
                        onClick={() => removeSkillToLearn(l.skillId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Remove goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono-ledger text-[11px] text-slate-500">
                    <span>Roadmap Progress:</span>
                    <span className="text-emerald-700 font-bold">{l.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${l.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cryptographic Credential Ledger Blocks */}
      <div className="paper-card p-6 sm:p-8 space-y-4 shadow-sm bg-white border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              Cryptographic Credential Ledger Blocks (SHA-256 Verifiable)
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Immutable certificate blocks signed upon micro-quiz completion. Click any block to view cryptographic proof.
            </p>
          </div>
          <span className="text-xs font-mono-ledger font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 hidden sm:inline-block">
            TAMPER-EVIDENT CHAIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-ledger text-xs">
          {credentialLedger.map(block => (
            <div
              key={block.blockIndex}
              onClick={() => setSelectedCertBlock(block)}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 cursor-pointer hover:border-emerald-500 transition-all shadow-xs overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-bold text-slate-900 truncate min-w-0" title={`Block #${block.blockIndex} • ${block.skillName}`}>
                  Block #{block.blockIndex} • {block.skillName}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                  {block.quizScorePct}% Mastery
                </span>
              </div>
              <p className="text-[10.5px] text-slate-600 truncate">Learner: {block.learnerName}</p>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-[9.5px] text-slate-500 break-all">
                Hash: {block.blockHash.slice(0, 32)}...
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Edit Bio */}
      {showEditBioModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowEditBioModal(false)}
        >
          <div
            className="paper-card p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-display font-bold text-lg text-slate-900">Edit Profile Bio</h3>
              <button
                onClick={() => setShowEditBioModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateBio} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-800 font-bold">Headline:</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 font-bold">Bio Description:</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditBioModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-marigold px-6 py-2 text-xs shadow-xs font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Teaching Skill */}
      {showAddTeachModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAddTeachModal(false)}
        >
          <div
            className="paper-card p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-display font-bold text-lg text-slate-900">Add Skill You Can Teach</h3>
              <button
                onClick={() => setShowAddTeachModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddTeach} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-800 font-bold">Skill Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router, Japanese..."
                  value={newTeachSkill}
                  onChange={e => setNewTeachSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Category:</label>
                  <select
                    value={newTeachCategory}
                    onChange={e => setNewTeachCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Languages">Languages</option>
                    <option value="Design">Design</option>
                    <option value="Arts & Music">Music</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Level:</label>
                  <select
                    value={newTeachLevel}
                    onChange={e => setNewTeachLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeachModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-marigold px-6 py-2 text-xs shadow-xs font-bold">
                  Add Teaching Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Learning Goal */}
      {showAddLearnModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAddLearnModal(false)}
        >
          <div
            className="paper-card p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-display font-bold text-lg text-slate-900">Add Learning Goal</h3>
              <button
                onClick={() => setShowAddLearnModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddLearn} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-800 font-bold">Skill You Want to Learn:</label>
                <input
                  type="text"
                  placeholder="e.g. Acoustic Fingerstyle, GLSL Shaders..."
                  value={newLearnSkill}
                  onChange={e => setNewLearnSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 font-bold">Target Proficiency:</label>
                <select
                  value={newLearnLevel}
                  onChange={e => setNewLearnLevel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Conversational">Conversational</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLearnModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-jade px-6 py-2 text-xs shadow-xs font-bold">
                  Add Learning Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Credential Block Details & QR */}
      {selectedCertBlock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCertBlock(null)}
        >
          <div
            className="paper-card p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl bg-white border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Certificate Block #{selectedCertBlock.blockIndex}
              </h3>
              <button
                onClick={() => setSelectedCertBlock(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 font-mono-ledger text-xs">
              <p><strong>Skill:</strong> {selectedCertBlock.skillName}</p>
              <p><strong>Learner:</strong> {selectedCertBlock.learnerName}</p>
              <p><strong>Instructor:</strong> {selectedCertBlock.teacherName}</p>
              <p><strong>Mastery Score:</strong> <span className="text-emerald-700 font-bold">{selectedCertBlock.quizScorePct}%</span></p>
              <p><strong>Timestamp:</strong> {selectedCertBlock.timestamp}</p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] break-all text-slate-600">
                <p className="font-bold text-slate-900 mb-1">SHA-256 Block Hash:</p>
                <p>{selectedCertBlock.blockHash}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCertBlock(null)}
                className="btn-primary-marigold px-6 py-2 text-xs shadow-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
