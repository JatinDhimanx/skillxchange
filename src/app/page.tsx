'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { HeaderNav, ScreenTab } from '../components/layout/HeaderNav';
import { SVIMarketTicker } from '../components/layout/SVIMarketTicker';
import { CommunityActivityFeed } from '../components/layout/CommunityActivityFeed';
import { OnboardingModal } from '../components/ui/OnboardingModal';
import { HomeScreen } from '../components/screens/HomeScreen';
import { MatchesScreen } from '../components/screens/MatchesScreen';
import { ChainsScreen } from '../components/screens/ChainsScreen';
import { SessionScreen } from '../components/screens/SessionScreen';
import { WalletScreen } from '../components/screens/WalletScreen';
import { ProfileScreen } from '../components/screens/ProfileScreen';
import { ProgressDashboard } from '../components/screens/ProgressDashboard';
import { LiveSkillGraph } from '../components/innovations/LiveSkillGraph';
import { SkillBountyBoard } from '../components/innovations/SkillBountyBoard';
import { FusionSessions } from '../components/innovations/FusionSessions';
import { SecondBrainNotebook } from '../components/innovations/SecondBrainNotebook';
import { CredentialLedger } from '../components/innovations/CredentialLedger';
import { SoftSkillsLab } from '../components/innovations/SoftSkillsLab';
import { CollegeHub } from '../components/community/CollegeHub';
import { PeerChatDrawer } from '../components/chat/PeerChatDrawer';
import { AuthModal } from '../components/auth/AuthModal';

const MainAppContent: React.FC = () => {
  const {
    toastMessage,
    dismissToast,
    authModalOpen,
    authModalTab,
    closeAuthModal,
    isAuthenticated,
    openAuthModal,
  } = useApp();
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSelectTab = (tab: ScreenTab) => {
    if (tab !== 'home' && !isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    setCurrentTab(tab);
  };

  const renderScreen = () => {
    if (currentTab !== 'home' && !isAuthenticated) {
      return <HomeScreen onNavigate={handleSelectTab} />;
    }

    switch (currentTab) {
      case 'home':
        return <HomeScreen onNavigate={handleSelectTab} />;
      case 'matches':
        return <MatchesScreen />;
      case 'chains':
        return <ChainsScreen />;
      case 'graph':
        return <LiveSkillGraph />;
      case 'session':
        return <SessionScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'bounties':
        return <SkillBountyBoard />;
      case 'fusion':
        return <FusionSessions />;
      case 'second_brain':
        return <SecondBrainNotebook />;
      case 'credentials':
        return <CredentialLedger />;
      case 'soft_skills':
        return <SoftSkillsLab />;
      case 'college':
        return <CollegeHub />;
      case 'profile':
        return <ProfileScreen />;
      case 'progress' as ScreenTab:
        return <ProgressDashboard onNavigate={handleSelectTab} />;
      default:
        return <HomeScreen onNavigate={handleSelectTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Sticky Header Nav */}
      <HeaderNav currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* SVI Skill Market Ticker */}
      <div className="sticky top-14 sm:top-16 z-40">
        <SVIMarketTicker />
        <CommunityActivityFeed />
      </div>

      {/* Main Screen Content */}
      <main
        key={currentTab}
        className="flex-1 w-full max-w-[1280px] mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in-up"
      >
        {renderScreen()}
      </main>

      {/* Global Peer-to-Peer Chat Drawer */}
      <PeerChatDrawer onNavigate={setCurrentTab} />

      {/* Global Supabase Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />

      {/* Global Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-[calc(100vw-2rem)] sm:max-w-md">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between gap-3 bg-white ${
              toastMessage.type === 'success'
                ? 'border-emerald-300 text-emerald-900 shadow-emerald-500/10'
                : toastMessage.type === 'warning'
                ? 'border-rose-300 text-rose-900 shadow-rose-500/10'
                : 'border-slate-300 text-slate-900 shadow-slate-500/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                toastMessage.type === 'success' ? 'bg-emerald-500 animate-pulse' :
                toastMessage.type === 'warning' ? 'bg-rose-500 animate-pulse' :
                'bg-blue-500'
              }`}></span>
              <span className="truncate">{toastMessage.text}</span>
            </div>
            <button
              onClick={dismissToast}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-slate-900">SkillXchange</span>
            <span>•</span>
            <span className="text-slate-500">Peer-to-Peer Learning Network</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono-ledger text-[11px] text-slate-500">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Zero-Fiat Chains</span>
            <span>•</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Dynamic SVI Float</span>
            <span>•</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Transcript Proofs</span>
            <span>•</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">AI Voice Lab</span>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal for new users */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
