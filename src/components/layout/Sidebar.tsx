'use client';

import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  Users,
  Network,
  GitFork,
  Hourglass,
  TrendingUp,
  Target,
  Sparkles,
  Compass,
  BookOpen,
  Award,
  Mic,
  Video,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  isSection60?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, futureCommitments, bounties, credentialLedger } = useApp();

  const primaryNavItems: NavItem[] = [
    {
      id: 'matching',
      label: 'Peer Matching Engine',
      badge: '95%+ Swap',
      badgeColor: 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]',
      icon: Users,
    },
    {
      id: 'skill-graph',
      label: 'Public Skill Graph',
      badge: 'Live Network',
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: Network,
      isSection60: true,
    },
    {
      id: 'futures-market',
      label: 'Skill Futures Market',
      badge: `60.1 (${futureCommitments.length})`,
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: Hourglass,
      isSection60: true,
    },
  ];

  const innovationNavItems: NavItem[] = [
    {
      id: 'dynamic-economy',
      label: 'Dynamic Credit Index',
      badge: '60.3 Float',
      badgeColor: 'bg-[#E7A33E]/20 text-[#E7A33E] border-[#E7A33E]',
      icon: TrendingUp,
      isSection60: true,
    },
    {
      id: 'bounty-board',
      label: 'Skill Bounty Board',
      badge: `60.5 (${bounties.length})`,
      badgeColor: 'bg-[#B5482D]/20 text-[#B5482D] border-[#B5482D]',
      icon: Target,
      isSection60: true,
    },
    {
      id: 'fusion-sessions',
      label: 'Cross-Skill Fusion',
      badge: '60.6 Dual',
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: Sparkles,
      isSection60: true,
    },
    {
      id: 'predictive-matches',
      label: 'Predictive Future Matches',
      badge: '60.7 Roadmap',
      badgeColor: 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]',
      icon: Compass,
      isSection60: true,
    },
    {
      id: 'second-brain',
      label: 'Second-Brain Notebook',
      badge: '60.8 Wiki',
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: BookOpen,
      isSection60: true,
    },
    {
      id: 'credential-ledger',
      label: 'Verifiable Ledger',
      badge: `60.9 (${credentialLedger.length})`,
      badgeColor: 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]',
      icon: Award,
      isSection60: true,
    },
    {
      id: 'soft-skills-lab',
      label: 'AI Soft-Skills Lab',
      badge: '60.10 Voice',
      badgeColor: 'bg-[#E7A33E]/20 text-[#E7A33E] border-[#E7A33E]',
      icon: Mic,
      isSection60: true,
    },
  ];

  const utilityNavItems: NavItem[] = [
    {
      id: 'live-session',
      label: 'Live Session & Board',
      badge: 'Study Room',
      badgeColor: 'bg-[#2E8C74]/20 text-[#2E8C74] border-[#2E8C74]',
      icon: Video,
    },
    {
      id: 'verification-center',
      label: 'Skill Verification',
      badge: 'Trust 0-100',
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: ShieldCheck,
    },
    {
      id: 'college-hub',
      label: 'Campus Community',
      badge: '.EDU',
      badgeColor: 'bg-[#E7A33E]/20 text-[#E7A33E] border-[#E7A33E]',
      icon: Building2,
    },
    {
      id: 'profile',
      label: 'Smart Profile',
      icon: UserCheck,
    },
    {
      id: 'admin-panel',
      label: 'Platform Governance',
      badge: currentUser.role === 'admin' ? 'Master' : 'View',
      badgeColor: 'bg-[#F2EFE6]/10 text-[#F2EFE6] border-[#F2EFE6]/20',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 p-2 space-y-6">
      {/* Group 1: Exchange & Matching */}
      <div className="space-y-1">
        <p className="px-3 text-[10.5px] font-mono-ledger font-bold uppercase tracking-wider text-[#D9D0B8] mb-2">
          Exchange & Matching
        </p>
        {primaryNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#111e19] border border-[#E7A33E] text-[#F2EFE6] shadow-sm'
                  : 'text-[#D9D0B8] hover:text-[#F2EFE6] hover:bg-[#111e19]/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E7A33E]' : 'text-[#D9D0B8] group-hover:text-[#F2EFE6]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9.5px] font-mono-ledger font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Group 2: Section 60 Differentiators */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[10.5px] font-mono-ledger font-bold uppercase tracking-wider text-[#E7A33E] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E7A33E]" /> Section 60 Innovations
          </p>
          <span className="text-[9px] font-mono-ledger font-bold px-1.5 py-0.5 rounded bg-[#E7A33E]/15 text-[#E7A33E] border border-[#E7A33E]/30">
            NEW
          </span>
        </div>
        {innovationNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#111e19] border border-[#2E8C74] text-[#F2EFE6] shadow-sm'
                  : 'text-[#D9D0B8] hover:text-[#F2EFE6] hover:bg-[#111e19]/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2E8C74]' : 'text-[#D9D0B8] group-hover:text-[#F2EFE6]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9.5px] font-mono-ledger font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Group 3: Governance & Tools */}
      <div className="space-y-1">
        <p className="px-3 text-[10.5px] font-mono-ledger font-bold uppercase tracking-wider text-[#D9D0B8] mb-2">
          Sessions & Governance
        </p>
        {utilityNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#111e19] border border-[#F2EFE6]/30 text-[#F2EFE6]'
                  : 'text-[#D9D0B8] hover:text-[#F2EFE6] hover:bg-[#111e19]/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F2EFE6]' : 'text-[#D9D0B8] group-hover:text-[#F2EFE6]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9.5px] font-mono-ledger font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
