'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, Send, TrendingUp, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';

export const WalletScreen: React.FC = () => {
  const {
    currentUser,
    allUsers,
    dynamicRates,
    transactions,
    transferCredits,
    adjustSkillDemand,
  } = useApp();

  // Peer Transfer Form
  const [targetUserId, setTargetUserId] = useState(allUsers[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState(1.5);
  const [transferReason, setTransferReason] = useState('1 hr Advanced Python Vectorization Mentorship');

  const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferCredits(targetUserId, transferAmount, transferReason);
  };

  return (
    <div className="py-6 max-w-[1180px] mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Credit Wallet & Skill Economy Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans">
          Internal ledger recording value given and value received across all peer exchanges.
        </p>
      </div>

      {/* Three Summary Cards in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="paper-card p-6 space-y-1 font-mono-ledger border-t-4 border-t-emerald-600 shadow-sm bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-500">Available Balance</span>
          <p className="font-display font-black text-3xl sm:text-4xl text-emerald-700">
            {currentUser.creditsBalance.toFixed(1)} <span className="text-base font-sans font-bold">CR</span>
          </p>
          <p className="text-[11px] text-slate-400 pt-1">Ready for exchange booking</p>
        </div>

        {/* Total Earned */}
        <div className="paper-card p-6 space-y-1 font-mono-ledger border-t-4 border-t-amber-500 shadow-sm bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Credits Earned</span>
          <p className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            +{currentUser.totalCreditsEarned.toFixed(1)} <span className="text-base font-sans font-bold">CR</span>
          </p>
          <p className="text-[11px] text-slate-400 pt-1">Through verified teaching</p>
        </div>

        {/* Total Spent */}
        <div className="paper-card p-6 space-y-1 font-mono-ledger border-t-4 border-t-rose-500 shadow-sm bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Credits Spent</span>
          <p className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            -{currentUser.totalCreditsSpent.toFixed(1)} <span className="text-base font-sans font-bold">CR</span>
          </p>
          <p className="text-[11px] text-slate-400 pt-1">For peer learning sessions</p>
        </div>
      </div>

      {/* Direct Peer Credit Transfer Form */}
      <div className="paper-card p-6 sm:p-8 space-y-6 shadow-sm bg-white border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              Direct Peer Credit Transfer
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Instant balance settlement with symmetric debit/credit recording.
            </p>
          </div>
          <span className="text-[11px] font-mono-ledger font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ESCROW PROTECTED
          </span>
        </div>

        <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="text-slate-800 font-bold">Recipient Peer:</label>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
            >
              {otherUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.skillsToTeach[0]?.skillName.split(' ')[0] || 'Peer'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-800 font-bold font-mono-ledger">Amount (CR):</label>
            <input
              type="number"
              min={0.1}
              max={currentUser.creditsBalance}
              step={0.1}
              value={transferAmount}
              onChange={e => setTransferAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono-ledger font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-800 font-bold">Purpose / Memo:</label>
            <input
              type="text"
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-ledger text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transfers are cryptographically logged into network memory.</span>
            </div>

            <button
              type="submit"
              className="btn-primary-marigold px-6 py-2.5 text-xs shadow-xs inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send {transferAmount} Credits</span>
            </button>
          </div>
        </form>
      </div>

      {/* Skill Value Index Ticker Strip & Interactive Float Simulator */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-mono-ledger text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Skill Value Index (SVI Float)
            </span>
            <p className="text-[11px] text-slate-500 font-sans">
              Test real-time market demand shifts by clicking + / - buttons on any skill.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dynamicRates.map(rate => (
            <div
              key={rate.skillId}
              className="paper-card py-2.5 px-4 rounded-2xl flex items-center gap-3 font-mono-ledger text-xs shrink-0 shadow-xs bg-white border border-slate-200"
            >
              <div>
                <p className="font-bold text-slate-900 text-xs">{rate.skillName.split(' ')[0]}</p>
                <span
                  className={`font-bold text-[11px] flex items-center gap-0.5 ${
                    rate.trend === 'up' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {rate.trend === 'up' ? '▲' : '▼'} {rate.multiplier}x ({rate.creditPerHour} CR/hr)
                </span>
              </div>

              {/* Demand shift buttons */}
              <div className="flex flex-col gap-1 pl-2 border-l border-slate-200">
                <button
                  onClick={() => adjustSkillDemand(rate.skillId, 10)}
                  className="w-5 h-4 rounded bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-[9px] flex items-center justify-center transition-all"
                  title="Simulate +10% Market Demand"
                >
                  +
                </button>
                <button
                  onClick={() => adjustSkillDemand(rate.skillId, -10)}
                  className="w-5 h-4 rounded bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white font-bold text-[9px] flex items-center justify-center transition-all"
                  title="Simulate -10% Market Demand"
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Transaction Ledger Table */}
      <div className="paper-card p-6 space-y-4 shadow-sm bg-white border border-slate-200">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-display font-bold text-base text-slate-900">
            Official Account Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Cryptographically logged transaction history with symmetric debit/credit records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-ledger">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[10.5px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Description / Memo</th>
                <th className="pb-3 text-right">Credit Change</th>
                <th className="pb-3 pr-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No transactions recorded yet. Completed peer sessions and credit transfers will be logged here.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                  >
                    <td className="py-3.5 pl-2 font-bold text-slate-900">{t.id}</td>
                    <td className="py-3.5 text-slate-500">{t.date}</td>
                    <td className="py-3.5 text-slate-800 font-sans">{t.desc}</td>
                    <td
                      className={`py-3.5 text-right font-bold ${
                        t.delta > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {t.delta > 0 ? `+${t.delta.toFixed(1)}` : t.delta.toFixed(1)} CR
                    </td>
                    <td className="py-3.5 pr-2 text-right font-bold text-slate-900">
                      {t.balance.toFixed(1)} CR
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
