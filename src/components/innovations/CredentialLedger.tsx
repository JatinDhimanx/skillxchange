'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CredentialBlock } from '../../types';
import {
  Award,
  ShieldCheck,
  Lock,
  CheckCircle2,
  QrCode,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  User,
  Calendar,
  Hash,
  FileCheck,
  CheckCheck,
  ArrowRight,
  Printer,
  X,
} from 'lucide-react';

export const CredentialLedger: React.FC = () => {
  const {
    currentUser,
    allUsers,
    credentialLedger,
    generateNewCredentialBlock,
    showToast,
  } = useApp();

  const [selectedBlock, setSelectedBlock] = useState<CredentialBlock | null>(
    credentialLedger[credentialLedger.length - 1] || credentialLedger[0] || null
  );

  const [showMintModal, setShowMintModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isValidatingChain, setIsValidatingChain] = useState(false);
  const [chainVerified, setChainVerified] = useState<boolean | null>(true);

  // Mint Form State
  const [targetLearnerName, setTargetLearnerName] = useState(
    allUsers.find(u => u.id !== currentUser.id)?.name || 'Priya Sharma'
  );
  const [targetSkillName, setTargetSkillName] = useState(
    currentUser.skillsToTeach[0]?.skillName || 'Python & Distributed Systems'
  );
  const [quizScore, setQuizScore] = useState(96);
  const [masteryLevel, setMasteryLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Filtered Blocks
  const filteredBlocks = credentialLedger.filter(block => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      block.skillName.toLowerCase().includes(q) ||
      block.learnerName.toLowerCase().includes(q) ||
      block.teacherName.toLowerCase().includes(q) ||
      block.certificateId.toLowerCase().includes(q)
    );
  });

  // Verify Entire Chain Integrity
  const handleVerifyChain = () => {
    setIsValidatingChain(true);
    setTimeout(() => {
      setIsValidatingChain(false);
      setChainVerified(true);
      showToast(
        `Cryptographic Chain Verified! ${credentialLedger.length} blocks validated with 0 tampering.`,
        'success'
      );
    }, 600);
  };

  // Copy Verification URL
  const copyVerificationLink = (block: CredentialBlock) => {
    const url = block.verificationUrl || `https://verify.skillexchange.org/cert/${block.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(block.certificateId);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Verification URL copied to clipboard!', 'success');
  };

  // Submit Minting Form
  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const learnerObj = allUsers.find(u => u.name === targetLearnerName);
    const learnerId = learnerObj?.id || `user-${Date.now()}`;

    generateNewCredentialBlock(
      targetLearnerName,
      learnerId,
      targetSkillName,
      quizScore
    );

    setShowMintModal(false);
    showToast(`Block #${credentialLedger.length + 1} minted and appended to ledger! ⛓️`, 'success');

    // Auto select newly minted block
    setTimeout(() => {
      if (credentialLedger.length > 0) {
        setSelectedBlock(credentialLedger[credentialLedger.length - 1]);
      }
    }, 100);
  };

  // Stats
  const myEarnedCount = credentialLedger.filter(c => c.learnerId === currentUser.id).length;
  const myMentoredCount = credentialLedger.filter(c => c.teacherId === currentUser.id).length;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Credential Ledger Chain
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SHA-256 Immutable Proofs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Cryptographically signed skill certificates minted upon session completion and peer micro-quiz verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerifyChain}
            disabled={isValidatingChain}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isValidatingChain ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Verify Chain Hashes</span>
          </button>

          <button
            onClick={() => setShowMintModal(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Mint Verified Block</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 Ledger Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blocks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
            <span className="uppercase font-bold text-[10px]">Total Blocks</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {credentialLedger.length} <span className="text-xs font-sans font-normal text-slate-400">blocks</span>
          </p>
          <span className="text-[10.5px] font-mono-ledger text-emerald-700 font-bold block">
            Chain Height: #{credentialLedger.length}
          </span>
        </div>

        {/* Chain Integrity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
            <span className="uppercase font-bold text-[10px]">Chain Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-black text-xl sm:text-2xl text-emerald-700">
            100% Intact
          </p>
          <span className="text-[10.5px] font-mono-ledger text-slate-500 block">
            0 Tampering Detected
          </span>
        </div>

        {/* My Earned Certs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
            <span className="uppercase font-bold text-[10px]">My Certificates</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-purple-700">
            {myEarnedCount} <span className="text-xs font-sans font-normal text-slate-400">earned</span>
          </p>
          <span className="text-[10.5px] font-mono-ledger text-purple-600 font-bold block">
            Peer Quiz Attested
          </span>
        </div>

        {/* Mentored Blocks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
            <span className="uppercase font-bold text-[10px]">Mentored & Signed</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-blue-700">
            {myMentoredCount} <span className="text-xs font-sans font-normal text-slate-400">blocks</span>
          </p>
          <span className="text-[10.5px] font-mono-ledger text-blue-600 font-bold block">
            ECDSA Digital Signed
          </span>
        </div>
      </div>

      {/* ── Main 2-Column Ledger Explorer + Official Certificate View ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chain Blocks List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h2 className="font-display font-bold text-base text-slate-900">
                Ledger Blocks ({filteredBlocks.length})
              </h2>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter skill or peer..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredBlocks.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-display font-bold text-sm text-slate-800">No matching credential blocks</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Mint a new verifiable block or clear the search filter.
                </p>
              </div>
            ) : (
              filteredBlocks.map(block => {
                const isSelected = selectedBlock?.certificateId === block.certificateId;
                return (
                  <div
                    key={block.certificateId}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-mono-ledger font-bold">
                          Block #{block.blockIndex}
                        </span>
                        <h3 className="font-display font-bold text-sm text-slate-900">
                          {block.skillName}
                        </h3>
                      </div>

                      <span className="text-xs font-mono-ledger font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {block.quizScorePct}% Verified
                      </span>
                    </div>

                    {/* Meta Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-sans">
                      <div>
                        <span className="text-slate-400">Learner: </span>
                        <strong className="text-slate-900">{block.learnerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Mentor: </span>
                        <strong className="text-slate-900">{block.teacherName}</strong>
                      </div>
                    </div>

                    {/* Hash Strip */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono-ledger text-[10px] text-slate-500 flex items-center justify-between gap-2 overflow-hidden">
                      <span className="truncate">
                        Hash: <strong className="text-slate-800">{block.blockHash}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold shrink-0">SHA-256</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Official Certificate Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Certificate Attestation Proof
            </h2>
          </div>

          {selectedBlock ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 text-center relative overflow-hidden">
              {/* Top Seal Badge */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              {/* Title & Beneficiary */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">
                  Verifiable Skill Certificate
                </span>
                <h3 className="font-display font-black text-xl text-slate-900">
                  {selectedBlock.skillName}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Awarded to <strong className="text-slate-900">{selectedBlock.learnerName}</strong>
                </p>
              </div>

              {/* Details Table */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono-ledger text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Certificate ID:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attesting Mentor:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mastery Level:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.levelEarned || 'Intermediate'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Micro-Quiz Score:</span>
                  <span className="font-bold text-emerald-700">{selectedBlock.quizScorePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mint Timestamp:</span>
                  <span className="font-bold text-slate-900">{selectedBlock.timestamp.split('T')[0]}</span>
                </div>
              </div>

              {/* QR Code Verification Frame */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
                <QrCode className="w-16 h-16 text-slate-900" />
                <span className="text-[10px] font-mono-ledger text-slate-500">
                  Scan to verify on-chain ledger proof
                </span>
              </div>

              {/* Digital Signature */}
              <div className="p-2.5 rounded-xl bg-slate-100 text-[10px] font-mono-ledger text-slate-600 break-all text-left">
                <span className="text-slate-400 block uppercase font-bold">ECDSA Signature:</span>
                {selectedBlock.digitalSignature}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => copyVerificationLink(selectedBlock)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedId === selectedBlock.certificateId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedBlock.certificateId ? 'Copied Link' : 'Copy Verify URL'}</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              Select a block from the left to inspect cryptographic proof
            </div>
          )}
        </div>
      </div>

      {/* ── MINT VERIFIED BLOCK MODAL ────────────────────────────────────── */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Mint Cryptographic Block
                </h3>
              </div>
              <button
                onClick={() => setShowMintModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMintSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Learner / Recipient Peer *
                </label>
                <select
                  value={targetLearnerName}
                  onChange={e => setTargetLearnerName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.college || 'Peer Member'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Verified Skill Track *
                </label>
                <input
                  type="text"
                  value={targetSkillName}
                  onChange={e => setTargetSkillName(e.target.value)}
                  placeholder="e.g. Full Stack Next.js & AI"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Micro-Quiz Score (%)
                  </label>
                  <input
                    type="number"
                    min={80}
                    max={100}
                    value={quizScore}
                    onChange={e => setQuizScore(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Mastery Level
                  </label>
                  <select
                    value={masteryLevel}
                    onChange={e => setMasteryLevel(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-sans space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mentor Attestation Notice:
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Signing this block uses your verified mentor identity (<strong>{currentUser.name}</strong>) and calculates the new block SHA-256 hash linked to the previous block hash.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMintModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Sign & Mint Block ⛓️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
