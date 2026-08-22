'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Flame,
  Send,
  Shield,
} from 'lucide-react';

export const DynamicEconomyTicker: React.FC = () => {
  const { currentUser, allUsers, dynamicRates, transferCredits } = useApp();
  const [targetUserId, setTargetUserId] = useState(allUsers[1]?.id || '');
  const [creditAmount, setCreditAmount] = useState(2);
  const [transferReason, setTransferReason] = useState('1 hr Advanced GLSL Shader Instruction');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transferCredits(targetUserId, creditAmount, transferReason);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-10 border border-[#F2EFE6]/15 bg-[#111e19] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-[#E7A33E]/20 text-[#E7A33E] border border-[#E7A33E]/40 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#E7A33E]" /> SECTION 60.3 INNOVATION
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono-ledger text-[#2E8C74] bg-[#2E8C74]/20 border border-[#2E8C74]/40">
                FLOATING SUPPLY & DEMAND INDEX
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F2EFE6] tracking-tight">
              Dynamic Credit Value & <span className="text-[#E7A33E]">Skill Economy Ledger</span>
            </h1>
            <p className="text-[#D9D0B8] text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Skill exchange is an internal economy, not a flat barter. High-demand rare skills (e.g. GLSL Shaders: <strong className="text-[#E7A33E]">2.8x</strong>) dynamically yield more credits than oversupplied baseline skills.
            </p>
          </div>

          {/* Current User Credit Ledger Balance */}
          <div className="p-5 rounded-2xl bg-[#16261F] border border-[#E7A33E]/40 text-right min-w-[220px] font-mono-ledger space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#D9D0B8]">Account Balance:</span>
            <div className="text-2xl sm:text-3xl font-black text-[#E7A33E] flex items-center justify-end gap-2">
              <Coins className="w-6 h-6 text-[#E7A33E]" />
              <span>{currentUser.creditsBalance.toFixed(1)} CR</span>
            </div>
            <p className="text-[10.5px] text-[#D9D0B8]">
              Earned: <span className="text-[#2E8C74]">+{currentUser.totalCreditsEarned}</span> • Spent: <span className="text-[#B5482D]">-{currentUser.totalCreditsSpent}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Full Account Ledger Table on Paper Background */}
      <div className="ledger-paper rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-[#1A2620] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1A2620]" />
              Official Skill Value Index (SVI) Ledger Table
            </h2>
            <p className="text-xs text-[#53635A]">
              Daily supply vs demand multiplier table logged transparently across network nodes.
            </p>
          </div>
          <span className="text-xs font-mono-ledger font-bold text-[#2E8C74] bg-[#2E8C74]/15 px-3 py-1 rounded-full border border-[#2E8C74]">
            MARKET OPEN • LIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-ledger">
            <thead>
              <tr className="border-b border-[#D9D0B8] text-[#53635A] text-[10.5px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Skill Specialization</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Supply / Demand</th>
                <th className="pb-3 text-center">Multiplier</th>
                <th className="pb-3 text-center">Credits / Hr</th>
                <th className="pb-3 text-center">Fiat Rate (₹)</th>
                <th className="pb-3 pr-2 text-right">24h Float</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D0B8]/60">
              {dynamicRates.map((rate, idx) => (
                <tr
                  key={rate.skillId}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-[#F6F1E4]'}`}
                >
                  <td className="py-3.5 pl-2 font-bold text-[#1A2620] flex items-center gap-2">
                    {rate.tier === 'High Demand & Rare' && <Flame className="w-3.5 h-3.5 text-[#E7A33E]" />}
                    <span>{rate.skillName}</span>
                  </td>
                  <td className="py-3.5 text-[#53635A] font-sans">{rate.category}</td>
                  <td className="py-3.5 text-[#1A2620]">
                    <span className="text-[#E7A33E] font-bold">{rate.supplyCount} Teachers</span> / <span className="text-[#2E8C74] font-bold">{rate.demandCount} Learners</span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10.5px] border ${
                        rate.multiplier >= 2.0
                          ? 'bg-[#E7A33E]/20 text-[#1A2620] border-[#E7A33E]'
                          : rate.multiplier >= 1.3
                          ? 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]'
                          : 'bg-[#D9D0B8]/40 text-[#53635A] border-[#D9D0B8]'
                      }`}
                    >
                      {rate.multiplier}x
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-[#1A2620]">
                    {rate.creditPerHour} CR / hr
                  </td>
                  <td className="py-3.5 text-center text-[#53635A]">
                    ₹{rate.inrPerHour}/hr
                  </td>
                  <td className="py-3.5 pr-2 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        rate.change24h > 0
                          ? 'text-[#2E8C74]'
                          : rate.change24h < 0
                          ? 'text-[#B5482D]'
                          : 'text-[#53635A]'
                      }`}
                    >
                      {rate.change24h > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : rate.change24h < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : null}
                      {rate.change24h > 0 ? `+${rate.change24h}%` : `${rate.change24h}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Settlement Form */}
      <div className="ledger-paper rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
        <div>
          <h2 className="font-display font-bold text-base text-[#1A2620] flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#E7A33E]" />
            Direct Peer Credit Transfer
          </h2>
          <p className="text-xs text-[#53635A]">
            Transfer credits for 1-on-1 sessions or chain balance adjustments with escrow safety.
          </p>
        </div>

        <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="text-[#1A2620] font-bold">Recipient Peer / Instructor:</label>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E]"
            >
              {allUsers
                .filter(u => u.id !== currentUser.id && u.role !== 'admin')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.handle}) - {u.skillsToTeach[0]?.skillName || 'Instructor'}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#1A2620] font-bold font-mono-ledger">Amount (Credits):</label>
            <input
              type="number"
              min={0.5}
              max={currentUser.creditsBalance}
              step={0.1}
              value={creditAmount}
              onChange={e => setCreditAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E] font-mono-ledger font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#1A2620] font-bold">Purpose / Session ID:</label>
            <input
              type="text"
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FDFBF7] border border-[#D9D0B8] text-[#1A2620] focus:outline-none focus:border-[#E7A33E]"
              required
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-[#D9D0B8]">
            <div className="flex items-center gap-2 text-[#53635A] text-[11px] font-mono-ledger">
              <Shield className="w-4 h-4 text-[#2E8C74]" />
              <span>Escrow protection logs transfer symmetrically upon completion.</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E7A33E] hover:bg-[#D49029] text-[#16261F] font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transfer {creditAmount} Skill Credits</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
