'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  SlidersHorizontal,
  Users,
  Activity,
  Coins,
  ShieldCheck,
  GitFork,
  FileCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { allUsers, credentialLedger } = useApp();

  return (
    <div className="space-y-8">
      {/* Header Banner on Paper */}
      <div className="ledger-paper rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-[#16261F] text-[#F2EFE6] flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-[#E7A33E]" /> PLATFORM GOVERNANCE
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono-ledger text-[#2E8C74] bg-[#2E8C74]/15 border border-[#2E8C74]">
                WORKING AUDIT SURFACE
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1A2620] tracking-tight">
              Platform Governance & <span className="text-[#E7A33E]">Ledger Oversight</span>
            </h1>
            <p className="text-[#53635A] text-xs sm:text-sm max-w-2xl font-sans">
              Data-forward console for DAU/MAU monitoring, non-manipulable trust score verification, and multi-party chain audits.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Tally Cards in IBM Plex Mono */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-ledger">
        <div className="ledger-paper p-5 rounded-3xl space-y-1 shadow-md">
          <span className="text-[#53635A] text-[10.5px] uppercase font-bold">Active User Tally</span>
          <p className="font-display text-2xl sm:text-3xl font-black text-[#1A2620]">
            4,820 <span className="text-xs text-[#2E8C74] font-mono-ledger">+12%</span>
          </p>
          <p className="text-[10px] text-[#53635A]">68% Dual Teacher/Learner</p>
        </div>

        <div className="ledger-paper p-5 rounded-3xl space-y-1 shadow-md">
          <span className="text-[#53635A] text-[10.5px] uppercase font-bold">Closed Skill Chains</span>
          <p className="font-display text-2xl sm:text-3xl font-black text-[#E7A33E]">
            1,240 <span className="text-xs text-[#53635A] font-mono-ledger">Cycles</span>
          </p>
          <p className="text-[10px] text-[#53635A]">Zero-fiat triangular swaps</p>
        </div>

        <div className="ledger-paper p-5 rounded-3xl space-y-1 shadow-md">
          <span className="text-[#53635A] text-[10.5px] uppercase font-bold">Escrow Volume Protected</span>
          <p className="font-display text-2xl sm:text-3xl font-black text-[#2E8C74]">
            ₹4.82L <span className="text-xs text-[#53635A] font-mono-ledger">Held</span>
          </p>
          <p className="text-[10px] text-[#53635A]">99.8% Dispute-Free Release</p>
        </div>

        <div className="ledger-paper p-5 rounded-3xl space-y-1 shadow-md">
          <span className="text-[#53635A] text-[10.5px] uppercase font-bold">Verifiable Blocks</span>
          <p className="font-display text-2xl sm:text-3xl font-black text-[#1A2620]">
            {credentialLedger.length + 384}
          </p>
          <p className="text-[10px] text-[#53635A]">SHA-256 Tamper-Proof</p>
        </div>
      </div>

      {/* User Ledger Table */}
      <div className="ledger-paper rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D9D0B8] pb-3">
          <h2 className="font-display font-bold text-base text-[#1A2620] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1A2620]" />
            Peer Network Trust Audit Ledger
          </h2>
          <span className="text-xs font-mono-ledger text-[#53635A]">Auto-moderation active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-ledger">
            <thead>
              <tr className="border-b border-[#D9D0B8] text-[#53635A] text-[10.5px] uppercase tracking-wider">
                <th className="pb-3 pl-2">User / Identity</th>
                <th className="pb-3">Campus Affiliation</th>
                <th className="pb-3 text-center">Trust Score</th>
                <th className="pb-3 text-center">Sessions (T/L)</th>
                <th className="pb-3 text-center">Credit Balance</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D0B8]/60">
              {allUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-[#F6F1E4]'}`}
                >
                  <td className="py-3 pl-2 font-bold text-[#1A2620] flex items-center gap-2.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#D9D0B8]"
                    />
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3 text-[#53635A] font-sans">{user.college || 'Independent'}</td>
                  <td className="py-3 text-center font-bold text-[#2E8C74]">
                    {user.trustScore.overallScore}/100
                  </td>
                  <td className="py-3 text-center text-[#53635A]">
                    {user.teachingHours}h / {user.learningHours}h
                  </td>
                  <td className="py-3 text-center font-bold text-[#E7A33E]">
                    {user.creditsBalance.toFixed(1)} CR
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#2E8C74]/15 text-[#2E8C74] border border-[#2E8C74]">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
