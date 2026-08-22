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
import { AISkillDiscoveryView } from '../components/innovations/AISkillDiscoveryView';
import { AISkillDiscoveryModal } from '../components/innovations/AISkillDiscoveryModal';
import { CollegeHub } from '../components/community/CollegeHub';
import { PeerChatDrawer } from '../components/chat/PeerChatDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { PhoneOff, Video, Sparkles, Bot } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toastMessage,
    dismissToast,
    authModalOpen,
    authModalTab,
    closeAuthModal,
    isAuthenticated,
    openAuthModal,
    incomingCallInvite,
    acceptIncomingCall,
    declineIncomingCall,
  } = useApp();
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGlobalDiscoveryOpen, setIsGlobalDiscoveryOpen] = useState(false);

  // Sync activeTab from AppContext
  React.useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab as ScreenTab);
    }
  }, [activeTab]);

  // Auto-detect room link on page load / second device
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        setCurrentTab('session');
      }
    }
  }, []);

  const handleSelectTab = (tab: ScreenTab) => {
    // Allow guest to access home, session, and discovery
    if (tab !== 'home' && tab !== 'session' && tab !== 'discovery' && !isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    setCurrentTab(tab);
    setActiveTab(tab as any);
  };

  const renderScreen = () => {
    if (currentTab !== 'home' && currentTab !== 'session' && currentTab !== 'discovery' && !isAuthenticated) {
      return <HomeScreen onNavigate={handleSelectTab} />;
    }

    switch (currentTab) {
      case 'home':
        return <HomeScreen onNavigate={handleSelectTab} />;
      case 'discovery':
        return <AISkillDiscoveryView onNavigate={handleSelectTab} />;
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

      {/* ── REALTIME INCOMING STUDY ROOM CALL MODAL ───────────────── */}
      {incomingCallInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/40 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Animated Ringing Ripple & Avatar */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
              <span className="absolute -inset-2 rounded-full bg-emerald-500 opacity-20 animate-pulse"></span>
              <img
                src={incomingCallInvite.fromUserAvatar}
                alt={incomingCallInvite.fromUserName}
                className="w-20 h-20 rounded-2xl object-cover border-3 border-emerald-500 shadow-md relative z-10"
              />
              <span className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Video className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-[10.5px] font-mono-ledger font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Incoming Live Study Room Call
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900">
                {incomingCallInvite.fromUserName}
              </h3>
              <p className="text-xs text-slate-600 font-sans">
                Inviting you to join: <strong className="text-slate-900">{incomingCallInvite.title}</strong>
              </p>
              <p className="text-[11px] font-mono-ledger text-emerald-700 font-bold">
                Room Code: {incomingCallInvite.roomCode} • Video & Whiteboard Ready
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={declineIncomingCall}
                className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200"
              >
                <PhoneOff className="w-4 h-4 text-rose-500" />
                <span>Decline</span>
              </button>
              <button
                onClick={acceptIncomingCall}
                className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
              >
                <Video className="w-4 h-4" />
                <span>Accept & Join</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Live Study Rooms</span>
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

      {/* Global AI Skill Discovery FAB */}
      <button
        onClick={() => setIsGlobalDiscoveryOpen(!isGlobalDiscoveryOpen)}
        aria-label="Open SkillXchange AI Assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-900/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all group cursor-pointer border border-emerald-400/40"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </span>
        </div>
      </button>

      {/* Global AI Skill Discovery Modal */}
      <AISkillDiscoveryModal
        isOpen={isGlobalDiscoveryOpen}
        onClose={() => setIsGlobalDiscoveryOpen(false)}
        onNavigateToMatches={() => handleSelectTab('matches')}
      />
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
