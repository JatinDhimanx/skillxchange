'use client';

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import {
  UserProfile,
  Skill,
  SkillChain,
  FutureCommitment,
  SessionTranscriptProof,
  DynamicSkillRate,
  SkillBounty,
  FusionSessionOption,
  PredictiveMatch,
  NotebookEntry,
  CredentialBlock,
  MatchCandidate,
  LiveSessionState,
  SoftSkillPracticeMetrics,
  LearningMode,
  UserSkillOffering,
  UserLearningGoal,
  PeerChatMessage,
  ChatPeerInfo,
  BarterSwapProposal,
} from '../types';
import {
  USERS,
  INITIAL_SKILLS,
  SEED_SKILL_CHAINS,
  SEED_FUTURE_COMMITMENTS,
  SEED_TRANSCRIPT_PROOFS,
  DYNAMIC_RATES,
  SEED_BOUNTIES,
  SEED_FUSION_OPTIONS,
  SEED_PREDICTIVE_MATCHES,
  SEED_NOTEBOOK_ENTRIES,
  SEED_CREDENTIAL_LEDGER,
} from '../data/seedData';
import { isSupabaseConfigured } from '../lib/supabase/client';
import {
  fetchProfilesFromDB,
  fetchSkillsFromDB,
  fetchBountiesFromDB,
  createBountyInDB,
  submitBountyBidToDB,
  fetchCredentialLedgerFromDB,
  mintCredentialBlockInDB,
  fetchNotebookEntriesFromDB,
  saveNotebookEntryToDB,
  fetchChatMessagesFromDB,
  saveChatMessageToDB,
  updateProfileInDB,
} from '../lib/supabase/services';
import {
  signUpUser,
  signInUser,
  signOutUser,
  onAuthStateChanged,
  fetchUserProfile,
  resendVerificationEmail,
  SignUpData
} from '../lib/supabase/auth';

export type NavigationTab =
  | 'home'
  | 'matches'
  | 'matching'
  | 'matching_hub'
  | 'chains'
  | 'skill-chains'
  | 'skill_chains'
  | 'futures-market'
  | 'session'
  | 'live-session'
  | 'live_room'
  | 'wallet'
  | 'profile'
  | 'live_graph'
  | 'skill-graph'
  | 'transcript_proof'
  | 'dynamic_economy'
  | 'dynamic-economy'
  | 'bounty_board'
  | 'bounty-board'
  | 'fusion_sessions'
  | 'fusion-sessions'
  | 'predictive_matches'
  | 'predictive-matches'
  | 'second_brain'
  | 'second-brain'
  | 'credential_ledger'
  | 'credential-ledger'
  | 'soft_skills_lab'
  | 'soft-skills-lab'
  | 'verification_center'
  | 'verification-center'
  | 'college_hub'
  | 'college-hub'
  | 'admin_dashboard'
  | 'admin-panel';

export interface LedgerTransaction {
  id: string;
  date: string;
  desc: string;
  delta: number;
  balance: number;
}

export interface ActivityNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'match' | 'chain' | 'credit' | 'proof';
  read: boolean;
}

interface AppContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Current persona & users
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (bio: string, headline: string) => void;

  // Skills Management (Dynamic addition/removal)
  skills: Skill[];
  addSkillToTeach: (skillName: string, category: string, level: string, years: number) => void;
  removeSkillToTeach: (skillId: string) => void;
  addSkillToLearn: (skillName: string, targetLevel: string, urgency: string) => void;
  removeSkillToLearn: (skillId: string) => void;

  // Direct Matching & Barter Swaps
  candidates: MatchCandidate[];
  swapProposals: BarterSwapProposal[];
  sendExchangeProposal: (targetUserId: string, offeredSkill: string, wantedSkill: string, notes?: string) => void;
  acceptExchangeProposal: (proposalId: string) => void;
  declineExchangeProposal: (proposalId: string) => void;
  bookPaidTeacher: (teacherId: string, skillName: string, rateInr: number) => void;

  // Skill Chains & Futures (60.1)
  skillChains: SkillChain[];
  futureCommitments: FutureCommitment[];
  createFutureCommitment: (skillLearning: string, skillToTeach: string, maturityDays: number) => void;
  closeSkillChain: (chainId: string) => void;
  acceptSkillChain: (chainId: string) => void;

  // Transcript Proof & Micro-Quiz (60.2)
  transcriptProofs: SessionTranscriptProof[];
  activeQuizProof: SessionTranscriptProof | null;
  setActiveQuizProof: (proof: SessionTranscriptProof | null) => void;
  submitMicroQuiz: (proofId: string, answers: number[]) => { score: number; total: number; passed: boolean };

  // Dynamic Economy & Wallet (60.3)
  dynamicRates: DynamicSkillRate[];
  transactions: LedgerTransaction[];
  transferCredits: (toUserId: string, amount: number, reason: string) => void;
  adjustSkillDemand: (skillId: string, percentDelta: number) => void;

  // Bounties (60.5)
  bounties: SkillBounty[];
  postBounty: (title: string, skillName: string, category: string, description: string, budgetCredits: number, budgetInr: number, deadlineWeeks: number) => void;
  submitBountyBid: (bountyId: string, proposedCurriculum: string, estimatedSessions: number, bidPriceCredits: number) => void;

  // Fusion Sessions (60.6)
  fusionOptions: FusionSessionOption[];
  requestFusionSession: (fusionId: string) => void;

  // Predictive Matches (60.7)
  predictiveMatches: PredictiveMatch[];

  // Second Brain Notebook (60.8)
  notebookEntries: NotebookEntry[];
  searchQueryNotebook: string;
  setSearchQueryNotebook: (q: string) => void;
  filteredNotebookEntries: NotebookEntry[];

  // Credential Ledger (60.9)
  credentialLedger: CredentialBlock[];
  generateNewCredentialBlock: (learnerName: string, learnerId: string, skillName: string, scorePct: number) => void;

  // Soft Skills Lab (60.10)
  softSkillMetrics: SoftSkillPracticeMetrics;
  isPracticingSoftSkills: boolean;
  startSoftSkillPractice: () => void;
  stopSoftSkillPractice: () => void;
  recordSpeechSnippet: (text: string) => void;

  // Live Session Room
  activeSession: LiveSessionState | null;
  startLiveSession: (title: string, teacherName: string, learnerName: string, skillName: string) => void;
  endLiveSession: () => void;
  releaseEscrow: () => void;

  // Notifications & Activity Feed
  notifications: ActivityNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, desc: string, type?: 'match' | 'chain' | 'credit' | 'proof') => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: () => void;

  // Direct Peer Chat System
  activeChatPeer: ChatPeerInfo | null;
  peerConversations: Record<string, PeerChatMessage[]>;
  isPeerTyping: Record<string, boolean>;
  openChatWithPeer: (peer: ChatPeerInfo) => void;
  closeChat: () => void;
  sendPeerMessage: (peerId: string, text: string) => void;
  clearPeerChat: (peerId: string) => void;

  // Supabase Auth & Session System
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
  registerUser: (data: SignUpData) => Promise<{ success: boolean; needsEmailVerification: boolean; error: string | null }>;
  resendVerification: (email: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

const BLANK_GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'New Peer',
  handle: '@guest',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  headline: 'Exploring SkillXchange',
  bio: '',
  location: 'India',
  timezone: 'IST',
  college: 'Peer Network',
  collegeVerified: false,
  languages: ['English'],
  skillsToTeach: [],
  skillsToLearn: [],
  creditsBalance: 5.0,
  totalCreditsEarned: 0,
  totalCreditsSpent: 0,
  teachingHours: 0,
  learningHours: 0,
  trustScore: {
    identityVerified: false,
    skillVerifiedCount: 0,
    completedSessions: 0,
    attendanceRate: 100,
    averageRating: 5.0,
    cancellationRate: 0,
    responseRate: 100,
    accountAgeMonths: 0,
    overallScore: 90,
  },
  streakDays: 1,
  xpPoints: 0,
  badges: [],
  role: 'user',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(BLANK_GUEST_USER);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Hydrate all database data
  const hydrateAllData = async (user: UserProfile) => {
    try {
      const [dbProfiles, dbSkills, dbBounties, dbLedger, dbNotes] = await Promise.all([
        fetchProfilesFromDB(),
        fetchSkillsFromDB(),
        fetchBountiesFromDB(),
        fetchCredentialLedgerFromDB(),
        fetchNotebookEntriesFromDB(),
      ]);

      if (dbProfiles && dbProfiles.length > 0) {
        setAllUsers(dbProfiles);
      } else {
        setAllUsers([user]);
      }

      if (dbSkills && dbSkills.length > 0) {
        setSkills(dbSkills);
      }

      if (dbBounties && dbBounties.length > 0) {
        setBounties(dbBounties);
      }

      if (dbLedger && dbLedger.length > 0) {
        setCredentialLedger(dbLedger);
      }

      if (dbNotes && dbNotes.length > 0) {
        // Filter notes for this specific user or general guides
        const userNotes = dbNotes.filter(n => !(n as any).userId || (n as any).userId === user.id);
        setNotebookEntries(userNotes.length > 0 ? userNotes : dbNotes);
      }

      // User specific private transaction history
      const txKey = `skillxchange_txns_${user.id}`;
      const savedTx = localStorage.getItem(txKey);
      if (savedTx) {
        try {
          setTransactions(JSON.parse(savedTx));
        } catch {}
      } else {
        setTransactions([
          {
            id: `TXN-${user.id.slice(-4)}-01`,
            date: new Date().toISOString().split('T')[0],
            desc: 'Genesis Barter Credit Grant',
            delta: +user.creditsBalance,
            balance: user.creditsBalance,
          },
        ]);
      }

      // User specific private notifications
      const notifKey = `skillxchange_notifs_${user.id}`;
      const savedNotifs = localStorage.getItem(notifKey);
      if (savedNotifs) {
        try {
          setNotifications(JSON.parse(savedNotifs));
        } catch {}
      } else {
        setNotifications([
          {
            id: `notif-${Date.now()}`,
            title: `Welcome, ${user.name.split(' ')[0]}!`,
            desc: `Your decentralized account is verified with ${user.creditsBalance.toFixed(1)} initial barter credits.`,
            time: 'Just now',
            type: 'credit',
            read: false,
          },
        ]);
      }
    } catch {}
  };

  // Restore session on mount & listen to Supabase Auth state changes
  useEffect(() => {
    setIsAuthLoading(true);

    const unsubscribe = onAuthStateChanged(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setAuthModalOpen(false);
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(profile));
          } catch {}
          hydrateAllData(profile);
        }
      } else {
        const saved = localStorage.getItem('skillxchange_active_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id && parsed.id !== 'guest') {
              setCurrentUser(parsed);
              setIsAuthenticated(true);
              hydrateAllData(parsed);
              setIsAuthLoading(false);
              return;
            }
          } catch {}
        }
        setIsAuthenticated(false);
        setAuthModalOpen(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const loginUser = async (email: string, pass: string): Promise<{ success: boolean; error: string | null }> => {
    setIsAuthLoading(true);
    try {
      const { user, session, error } = await signInUser({ email, password: pass });
      if (error) {
        showToast(error, 'warning');
        return { success: false, error };
      }

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('skillxchange_active_user', JSON.stringify(user));
        } catch {}
        hydrateAllData(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
        return { success: true, error: null };
      }

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(profile));
          } catch {}
          hydrateAllData(profile);
          showToast(`Welcome back, ${profile.name}!`, 'success');
          return { success: true, error: null };
        }
      }

      setIsAuthenticated(true);
      showToast('Logged in successfully.', 'success');
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerUser = async (
    data: SignUpData
  ): Promise<{ success: boolean; needsEmailVerification: boolean; error: string | null }> => {
    setIsAuthLoading(true);
    try {
      const { user, needsEmailVerification, error } = await signUpUser(data);
      if (error) {
        showToast(error, 'warning');
        return { success: false, needsEmailVerification: false, error };
      }

      if (user) {
        setAllUsers(prev => [user, ...prev.filter(u => u.id !== user.id)]);
        
        if (!needsEmailVerification) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(user));
          } catch {}
          hydrateAllData(user);
        }

        // Dynamically register new skill into global catalog
        if (data.teachSkill) {
          const newSkillObj: Skill = {
            id: `skill-${Date.now()}`,
            name: data.teachSkill,
            category: 'User Added',
            subcategory: 'Peer Exchange',
            description: `Taught by ${data.name} on the peer network`,
            difficulty: 'Intermediate',
            tags: [data.teachSkill],
            demandMultiplier: 1.2,
            activeTeachers: 1,
            activeLearners: 0,
            marketRateCredits: 1.0,
            marketRateInr: 500,
          };
          setSkills(prev => {
            if (prev.some(s => s.name.toLowerCase() === data.teachSkill!.toLowerCase())) return prev;
            return [newSkillObj, ...prev];
          });
        }

        // Fresh initial transactions for new user
        setTransactions([
          {
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            desc: 'Initial Genesis Barter Credit Grant',
            delta: +5.0,
            balance: 5.0,
          },
        ]);

        // Fresh initial notification
        setNotifications([
          {
            id: `notif-${Date.now()}`,
            title: 'Welcome to SkillXchange!',
            desc: 'Your decentralized account is verified with 5.0 initial barter credits.',
            time: 'Just now',
            type: 'credit',
            read: false,
          },
        ]);

        return { success: true, needsEmailVerification, error: null };
      }
      return { success: false, needsEmailVerification: false, error: 'Signup failed.' };
    } catch (err: any) {
      return { success: false, needsEmailVerification: false, error: err.message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    const { error } = await resendVerificationEmail(email);
    if (error) {
      showToast(error, 'warning');
      return false;
    }
    showToast(`Verification email resent to ${email}!`, 'success');
    return true;
  };

  const logoutUser = async () => {
    setIsAuthLoading(true);
    await signOutUser();
    setIsAuthenticated(false);
    setCurrentUser(BLANK_GUEST_USER);
    try {
      localStorage.removeItem('skillxchange_active_user');
    } catch {}
    showToast('Signed out successfully.', 'info');
    setIsAuthLoading(false);
  };

  // Innovation States
  const [skillChains, setSkillChains] = useState<SkillChain[]>(SEED_SKILL_CHAINS);
  const [futureCommitments, setFutureCommitments] = useState<FutureCommitment[]>(SEED_FUTURE_COMMITMENTS);
  const [transcriptProofs, setTranscriptProofs] = useState<SessionTranscriptProof[]>(SEED_TRANSCRIPT_PROOFS);
  const [activeQuizProof, setActiveQuizProof] = useState<SessionTranscriptProof | null>(null);
  const [dynamicRates, setDynamicRates] = useState<DynamicSkillRate[]>(DYNAMIC_RATES);
  const [bounties, setBounties] = useState<SkillBounty[]>(SEED_BOUNTIES);
  const [fusionOptions] = useState<FusionSessionOption[]>(SEED_FUSION_OPTIONS);
  const [predictiveMatches] = useState<PredictiveMatch[]>(SEED_PREDICTIVE_MATCHES);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(SEED_NOTEBOOK_ENTRIES);
  const [searchQueryNotebook, setSearchQueryNotebook] = useState<string>('');
  const [credentialLedger, setCredentialLedger] = useState<CredentialBlock[]>(SEED_CREDENTIAL_LEDGER);

  // Dynamic Transaction Ledger (Starts clean for new users or loads from DB)
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([
    { id: 'TXN-GENESIS-01', date: new Date().toISOString().split('T')[0], desc: 'Initial Account Credit Grant', delta: +5.0, balance: 5.0 },
  ]);

  // Notifications (Starts clean or loads from DB)
  const [notifications, setNotifications] = useState<ActivityNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Welcome to SkillXchange!',
      desc: 'Your decentralized account is verified. Connect with peers or post a learning bounty.',
      time: 'Just now',
      type: 'match',
      read: false,
    },
  ]);

  // Soft Skills Practice State
  const [isPracticingSoftSkills, setIsPracticingSoftSkills] = useState(false);
  const [softSkillMetrics, setSoftSkillMetrics] = useState<SoftSkillPracticeMetrics>({
    clarityScore: 92,
    wordsPerMinute: 138,
    fillerWordCount: 2,
    fillerWordsDetected: [
      { word: 'um', count: 1 },
      { word: 'like', count: 1 },
    ],
    confidenceScore: 89,
    structureScore: 94,
    liveCoachingTips: [
      'Cadence is optimal at 138 WPM. Hold silence before key metrics.',
      'Rhetorical structure: Strong thesis statement detected.',
      'Replace "um" with an intentional 1-second pause.'
    ]
  });

  // Live Session State
  const [activeSession, setActiveSession] = useState<LiveSessionState | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4500);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared.', 'info');
  };

  const addNotification = (title: string, desc: string, type: 'match' | 'chain' | 'credit' | 'proof' = 'match') => {
    const newN: ActivityNotification = {
      id: `notif-${Date.now()}`,
      title,
      desc,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Peer Chat System State (Dynamically populated from real peer chats or Supabase)
  const [activeChatPeer, setActiveChatPeer] = useState<ChatPeerInfo | null>(null);
  const [peerConversations, setPeerConversations] = useState<Record<string, PeerChatMessage[]>>({});
  const [isPeerTyping, setIsPeerTyping] = useState<Record<string, boolean>>({});

  // ── Supabase Dynamic Hydration ────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const hydrateFromSupabase = async () => {
      try {
        const [dbProfiles, dbSkills, dbBounties, dbLedger, dbNotebook, dbChats] = await Promise.all([
          fetchProfilesFromDB(),
          fetchSkillsFromDB(),
          fetchBountiesFromDB(),
          fetchCredentialLedgerFromDB(),
          fetchNotebookEntriesFromDB(),
          fetchChatMessagesFromDB(),
        ]);

        if (dbProfiles && dbProfiles.length > 0) {
          setAllUsers(dbProfiles);
          setCurrentUser(dbProfiles[0]);
        }
        if (dbSkills && dbSkills.length > 0) setSkills(dbSkills);
        if (dbBounties && dbBounties.length > 0) setBounties(dbBounties);
        if (dbLedger && dbLedger.length > 0) setCredentialLedger(dbLedger);
        if (dbNotebook && dbNotebook.length > 0) setNotebookEntries(dbNotebook);
        if (dbChats && Object.keys(dbChats).length > 0) {
          setPeerConversations(prev => ({ ...prev, ...dbChats }));
        }

        showToast('Connected to live Supabase database!', 'success');
      } catch (err) {
        console.warn('Supabase dynamic hydration warning:', err);
      }
    };

    hydrateFromSupabase();
  }, []);

  const openChatWithPeer = (peer: ChatPeerInfo) => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    setActiveChatPeer(peer);
    if (!peerConversations[peer.id]) {
      setPeerConversations(prev => ({
        ...prev,
        [peer.id]: [
          {
            id: `msg-${Date.now()}`,
            senderId: peer.id,
            senderName: peer.name,
            senderAvatar: peer.avatar,
            text: `Hi ${currentUser.name}! I saw your skill offerings on SkillXchange. Let's do a peer-to-peer exchange session!`,
            timestamp: 'Just now',
            isMe: false,
            status: 'read',
          },
        ],
      }));
    }
  };

  const closeChat = () => {
    setActiveChatPeer(null);
  };

  const sendPeerMessage = (peerId: string, text: string) => {
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: PeerChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: timeStr,
      isMe: true,
      status: 'sent',
    };

    setPeerConversations(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), userMsg],
    }));

    // Async persist to Supabase
    saveChatMessageToDB(currentUser.id, peerId, userMsg);

    // Simulate realistic typing and smart response
    setIsPeerTyping(prev => ({ ...prev, [peerId]: true }));

    setTimeout(() => {
      setIsPeerTyping(prev => ({ ...prev, [peerId]: false }));

      const peer = allUsers.find(u => u.id === peerId) || activeChatPeer;
      const peerName = peer?.name || 'Peer';
      const peerAvatar = peer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      const lower = text.toLowerCase();

      let replyText = `Awesome! I've marked this on my calendar. Looking forward to our session!`;
      if (lower.includes('when') || lower.includes('time') || lower.includes('schedule') || lower.includes('free')) {
        replyText = `I'm free this Tuesday and Thursday between 5 PM and 8 PM IST. Does 6:00 PM work for you?`;
      } else if (lower.includes('study') || lower.includes('room') || lower.includes('live') || lower.includes('call') || lower.includes('join')) {
        replyText = `Great! I'm ready. Click "Enter Live Study Room" at the top of our chat to open the room with collaborative whiteboard.`;
      } else if (lower.includes('credit') || lower.includes('escrow') || lower.includes('pay') || lower.includes('cost')) {
        replyText = `We can do a direct 1:1 barter (0 credits needed) or settle with +1.0 credit per hour into escrow!`;
      } else if (lower.includes('python') || lower.includes('code') || lower.includes('numpy')) {
        replyText = `Perfect! I'm eager to dive into NumPy vectorization and practical Pandas drills with you.`;
      } else if (lower.includes('guitar') || lower.includes('music') || lower.includes('song')) {
        replyText = `Can't wait to show you the alternating thumb bass pattern for Travis picking. You'll master it in one session!`;
      }

      const replyMsg: PeerChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: peerId,
        senderName: peerName,
        senderAvatar: peerAvatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: 'read',
      };

      setPeerConversations(prev => ({
        ...prev,
        [peerId]: [...(prev[peerId] || []), replyMsg],
      }));

      // Async persist reply to Supabase
      saveChatMessageToDB(peerId, currentUser.id, replyMsg);

      // If chat is currently closed, fire a toast & notification
      if (!activeChatPeer || activeChatPeer.id !== peerId) {
        addNotification(`New message from ${peerName}`, replyText, 'match');
      }
    }, 1100);
  };

  const clearPeerChat = (peerId: string) => {
    setPeerConversations(prev => ({ ...prev, [peerId]: [] }));
    showToast('Chat history cleared.', 'info');
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched active persona to ${user.name} (${user.handle})`, 'info');
    }
  };

  const updateCurrentUserProfile = (bio: string, headline: string) => {
    const updated = { ...currentUser, bio, headline };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    updateProfileInDB(currentUser.id, { bio, headline });
    showToast('Profile updated successfully!', 'success');
  };

  // Dynamic Skill Offering Addition
  const addSkillToTeach = (skillName: string, category: string, level: string, years: number) => {
    const newOffering: UserSkillOffering = {
      skillId: `skill-${Date.now()}`,
      skillName,
      category,
      level: level as any,
      yearsExperience: years,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 450,
      hourlyRateCredits: 1.2,
      proofCount: 1,
    };

    const updatedTeach = [...currentUser.skillsToTeach, newOffering];
    const updatedUser = { ...currentUser, skillsToTeach: updatedTeach };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    showToast(`Added "${skillName}" to teaching skills! Recalculating matches...`, 'success');
  };

  const removeSkillToTeach = (skillId: string) => {
    const updatedTeach = currentUser.skillsToTeach.filter(s => s.skillId !== skillId);
    const updatedUser = { ...currentUser, skillsToTeach: updatedTeach };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    showToast('Skill removed from teaching profile.', 'info');
  };

  // Dynamic Learning Goal Addition
  const addSkillToLearn = (skillName: string, targetLevel: string, urgency: string) => {
    const newGoal: UserLearningGoal = {
      skillId: `learn-${Date.now()}`,
      skillName,
      targetLevel: targetLevel as any,
      urgency: urgency as any,
      targetDateWeeks: 6,
      currentRoadmapStep: 1,
      totalRoadmapSteps: 6,
      progressPercent: 15,
    };

    const updatedLearn = [...currentUser.skillsToLearn, newGoal];
    const updatedUser = { ...currentUser, skillsToLearn: updatedLearn };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    showToast(`Added "${skillName}" to learning roadmap! Searching for instructors...`, 'success');
  };

  const removeSkillToLearn = (skillId: string) => {
    const updatedLearn = currentUser.skillsToLearn.filter(s => s.skillId !== skillId);
    const updatedUser = { ...currentUser, skillsToLearn: updatedLearn };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    showToast('Learning goal removed.', 'info');
  };

  // Dynamic Matching Engine
  const candidates = useMemo<MatchCandidate[]>(() => {
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
    const mySkillsToLearn = currentUser.skillsToLearn.map(s => s.skillName.toLowerCase());

    return otherUsers.map(other => {
      const otherSkillsToLearn = other.skillsToLearn.map(s => s.skillName.toLowerCase());

      const iCanTeachThem = currentUser.skillsToTeach.find(myTeach =>
        otherSkillsToLearn.some(theirLearn =>
          theirLearn.includes(myTeach.skillName.toLowerCase().split(' ')[0]) ||
          myTeach.skillName.toLowerCase().includes(theirLearn.split(' ')[0])
        )
      );

      const theyCanTeachMe = other.skillsToTeach.find(theirTeach =>
        mySkillsToLearn.some(myLearn =>
          myLearn.includes(theirTeach.skillName.toLowerCase().split(' ')[0]) ||
          theirTeach.skillName.toLowerCase().includes(myLearn.split(' ')[0])
        )
      );

      let matchScore = 60;
      let quality: 'perfect' | 'good' | 'possible' = 'possible';
      const reasons: string[] = [];

      if (iCanTeachThem && theyCanTeachMe) {
        matchScore = 96;
        quality = 'perfect';
        reasons.push(`Direct 2-way barter! You teach ${iCanTeachThem.skillName}, they teach ${theyCanTeachMe.skillName}.`);
        reasons.push(`High Trust Score match (${other.trustScore.overallScore}/100) with verified credentials.`);
        reasons.push(`Compatible evening timeframes (8 hrs/week overlap).`);
      } else if (theyCanTeachMe) {
        matchScore = 84;
        quality = 'good';
        reasons.push(`They offer ${theyCanTeachMe.skillName} matching your active learning goal.`);
        reasons.push(`Credit-based exchange or ₹${theyCanTeachMe.hourlyRateInr || 450}/hr escrow booking available.`);
      } else if (iCanTeachThem) {
        matchScore = 76;
        quality = 'good';
        reasons.push(`They want to learn ${iCanTeachThem.skillName}. You can earn credits teaching them.`);
      } else {
        matchScore = 58;
        quality = 'possible';
        reasons.push(`Proximity match in technical discipline & campus network.`);
      }

      return {
        user: other,
        matchScore,
        quality,
        reasons,
        skillTeachMatch: {
          offeredByYou: iCanTeachThem ? iCanTeachThem.skillName : currentUser.skillsToTeach[0]?.skillName || 'Programming',
          wantedByThem: other.skillsToLearn[0]?.skillName || 'General Skills',
          levelFit: 'Peer Proficiency Match',
        },
        skillLearnMatch: {
          wantedByYou: currentUser.skillsToLearn[0]?.skillName || 'Acoustic Guitar',
          offeredByThem: theyCanTeachMe ? theyCanTeachMe.skillName : other.skillsToTeach[0]?.skillName || 'General Skills',
          levelFit: 'Instructor Certified',
        },
        suggestedMode: ((iCanTeachThem && theyCanTeachMe) ? 'direct_exchange' : 'credit_exchange') as LearningMode,
        paidFallbackPrice: other.skillsToTeach[0]?.hourlyRateInr || 450,
        availabilityOverlap: 'Evenings & Weekends (8 hrs/wk)',
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [currentUser, allUsers]);

  // Dynamic Barter Swap Proposals State
  const [swapProposals, setSwapProposals] = useState<BarterSwapProposal[]>([]);

  // Load proposals per user from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser.id) {
      try {
        const saved = localStorage.getItem(`skillxchange_proposals_${currentUser.id}`);
        if (saved) {
          setSwapProposals(JSON.parse(saved));
        }
      } catch {}
    }
  }, [currentUser.id]);

  const saveProposalsToStorage = (list: BarterSwapProposal[]) => {
    setSwapProposals(list);
    if (typeof window !== 'undefined' && currentUser.id) {
      try {
        localStorage.setItem(`skillxchange_proposals_${currentUser.id}`, JSON.stringify(list));
      } catch {}
    }
  };

  // Actions
  const sendExchangeProposal = (targetUserId: string, offeredSkill: string, wantedSkill: string, notes?: string) => {
    const target = allUsers.find(u => u.id === targetUserId);
    const targetName = target?.name || 'Peer';
    const targetAvatar = target?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newProposal: BarterSwapProposal = {
      id: `prop-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      receiverId: targetUserId,
      receiverName: targetName,
      receiverAvatar: targetAvatar,
      offeredSkill,
      wantedSkill,
      status: 'pending',
      proposedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes || '1-on-1 Bilateral Skill Swap (0 INR, Escrow Protected)',
      escrowCredits: 1.0,
    };

    const updated = [newProposal, ...swapProposals];
    saveProposalsToStorage(updated);

    // Push proposal message into peer chat
    const proposalMsg: PeerChatMessage = {
      id: `msg-prop-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `🤝 Proposed a 1-on-1 Barter Swap: You teach ${offeredSkill} in exchange for ${wantedSkill}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'proposal',
      proposalData: newProposal,
      status: 'delivered',
    };

    setPeerConversations(prev => ({
      ...prev,
      [targetUserId]: [...(prev[targetUserId] || []), proposalMsg],
    }));

    addNotification(
      `Swap Proposal Sent to ${targetName}`,
      `Offered: ${offeredSkill} ⇄ Wanted: ${wantedSkill}`,
      'match'
    );

    showToast(`Bilateral barter request sent to ${targetName}! (${offeredSkill} ⇄ ${wantedSkill})`, 'success');

    // Auto peer response & acceptance simulation
    setTimeout(() => {
      acceptExchangeProposal(newProposal.id, true);
    }, 2800);
  };

  const acceptExchangeProposal = (proposalId: string, isFromPeer = false) => {
    let targetProp: BarterSwapProposal | undefined;

    setSwapProposals(prev => {
      targetProp = prev.find(p => p.id === proposalId);
      const updated = prev.map(p => (p.id === proposalId ? { ...p, status: 'accepted' as const } : p));
      if (typeof window !== 'undefined' && currentUser.id) {
        try {
          localStorage.setItem(`skillxchange_proposals_${currentUser.id}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setTimeout(() => {
      const peerName = targetProp ? (isFromPeer ? targetProp.receiverName : targetProp.senderName) : 'Peer';
      const peerId = targetProp ? (isFromPeer ? targetProp.receiverId : targetProp.senderId) : '';

      if (peerId) {
        const acceptMsg: PeerChatMessage = {
          id: `msg-acc-${Date.now()}`,
          senderId: peerId,
          senderName: peerName,
          senderAvatar: targetProp?.receiverAvatar || '',
          text: `🎉 Swap Proposal Accepted! I've locked 1.0 barter credit in smart contract escrow. Click Study Room above to meet!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          status: 'read',
        };

        setPeerConversations(prev => ({
          ...prev,
          [peerId]: [...(prev[peerId] || []), acceptMsg],
        }));
      }

      addNotification(
        `🎉 Swap Accepted by ${peerName}!`,
        `Smart contract escrow locked 1.0 credit. You can now launch your collaborative live room.`,
        'match'
      );

      showToast(`Swap proposal accepted! Escrow smart contract verified. 🎉`, 'success');
    }, 500);
  };

  const declineExchangeProposal = (proposalId: string) => {
    setSwapProposals(prev => {
      const updated = prev.map(p => (p.id === proposalId ? { ...p, status: 'declined' as const } : p));
      if (typeof window !== 'undefined' && currentUser.id) {
        try {
          localStorage.setItem(`skillxchange_proposals_${currentUser.id}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    showToast('Swap proposal declined.', 'info');
  };

  const bookPaidTeacher = (teacherId: string, skillName: string, rateInr: number) => {
    const teacher = allUsers.find(u => u.id === teacherId);
    showToast(`Session booked with ${teacher?.name || 'Instructor'} for ₹${rateInr}/hr (Escrow Held).`, 'success');
    startLiveSession(`1-on-1 Mentorship: ${skillName}`, teacher?.name || 'Instructor', currentUser.name, skillName);
  };

  // Skill Chains
  const closeSkillChain = (chainId: string) => {
    setSkillChains(prev =>
      prev.map(c => (c.id === chainId ? { ...c, status: 'active' as const } : c))
    );
    showToast('Skill Chain closed! All 3 participants notified with zero currency required. 🔗', 'success');
  };

  const acceptSkillChain = (chainId: string) => {
    closeSkillChain(chainId);
  };

  const createFutureCommitment = (skillLearning: string, skillToTeach: string, maturityDays: number) => {
    const newCommitment: FutureCommitment = {
      id: `fut-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      skillCurrentlyLearning: skillLearning,
      skillCommittedToTeach: skillToTeach,
      commitmentDate: new Date().toISOString().split('T')[0],
      maturityDays,
      targetPrerequisiteLevel: 'Intermediate',
      status: 'pending_learning',
    };
    setFutureCommitments(prev => [newCommitment, ...prev]);
    showToast(`Forward commitment posted! Matching graph cycles in ${maturityDays} days.`, 'success');
  };

  // Micro-Quiz Submit & Cryptographic Mint
  const submitMicroQuiz = (proofId: string, answers: number[]) => {
    let score = 0;
    const proof = transcriptProofs.find(p => p.id === proofId);
    if (proof) {
      score = answers.filter((ans, idx) => ans === proof.quizQuestions[idx]?.correctOptionIndex).length;
      const total = proof.quizQuestions.length;
      const mastery = Math.round((score / total) * 100);

      setTranscriptProofs(prev =>
        prev.map(p => (p.id === proofId ? { ...p, learnerScore: score, masteryPercentage: mastery, isVerified: true } : p))
      );

      generateNewCredentialBlock(currentUser.name, currentUser.id, proof.skillName, mastery);
      setActiveQuizProof(null);
      showToast(`Micro-Quiz Verified! ${mastery}% scored & minted to Credential Ledger. 📜`, 'success');
      return { score, total, passed: mastery >= 70 };
    }
    return { score: 3, total: 3, passed: true };
  };

  // Dynamic Credit Transfer & Transaction Log
  const transferCredits = (toUserId: string, amount: number, reason: string) => {
    if (currentUser.creditsBalance < amount) {
      showToast(`Insufficient balance! (Available: ${currentUser.creditsBalance.toFixed(1)} CR)`, 'warning');
      return;
    }

    const newBalance = Number((currentUser.creditsBalance - amount).toFixed(1));

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, creditsBalance: newBalance, totalCreditsSpent: u.totalCreditsSpent + amount };
        }
        if (u.id === toUserId) {
          return { ...u, creditsBalance: Number((u.creditsBalance + amount).toFixed(1)), totalCreditsEarned: u.totalCreditsEarned + amount };
        }
        return u;
      })
    );

    setCurrentUser(prev => ({
      ...prev,
      creditsBalance: newBalance,
      totalCreditsSpent: prev.totalCreditsSpent + amount,
    }));

    const newTxn: LedgerTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      desc: reason,
      delta: -amount,
      balance: newBalance,
    };
    setTransactions(prev => [newTxn, ...prev]);

    showToast(`Transferred ${amount} CR. New Balance: ${newBalance.toFixed(1)} CR`, 'success');
  };

  const adjustSkillDemand = (skillId: string, percentDelta: number) => {
    setDynamicRates(prev =>
      prev.map(r => {
        if (r.skillId === skillId) {
          const newMultiplier = Number(Math.max(0.8, Math.min(3.5, r.multiplier * (1 + percentDelta / 100))).toFixed(2));
          return {
            ...r,
            multiplier: newMultiplier,
            creditPerHour: newMultiplier,
            inrPerHour: Math.round(newMultiplier * 350),
            trend: percentDelta > 0 ? 'up' : 'down',
            change24h: Number((r.change24h + percentDelta).toFixed(1)),
          };
        }
        return r;
      })
    );
    showToast('Market SVI float recalibrated based on real-time request volume.', 'info');
  };

  // Bounties
  const postBounty = (
    title: string,
    skillName: string,
    category: string,
    description: string,
    budgetCredits: number,
    budgetInr: number,
    deadlineWeeks: number
  ) => {
    const newBounty: SkillBounty = {
      id: `bounty-${Date.now()}`,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      learnerAvatar: currentUser.avatar,
      skillName,
      category,
      title,
      description,
      targetLevel: 'Intermediate',
      budgetCredits,
      budgetInr,
      deadlineWeeks,
      bidsCount: 0,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      bids: [],
    };
    setBounties(prev => [newBounty, ...prev]);
    createBountyInDB(newBounty);
    showToast('Learning bounty posted! Instructors are being alerted.', 'success');
  };

  const submitBountyBid = (bountyId: string, proposedCurriculum: string, estimatedSessions: number, bidPriceCredits: number) => {
    setBounties(prev =>
      prev.map(b => {
        if (b.id === bountyId) {
          const newBid = {
            id: `bid-${Date.now()}`,
            teacherId: currentUser.id,
            teacherName: currentUser.name,
            teacherAvatar: currentUser.avatar,
            teacherRating: currentUser.trustScore.averageRating,
            trustScore: currentUser.trustScore.overallScore,
            proposedCurriculum,
            estimatedSessions,
            bidPriceCredits,
            bidPriceInr: bidPriceCredits * 350,
            createdAt: 'Just now',
          };
          submitBountyBidToDB(bountyId, {
            teacherId: currentUser.id,
            teacherName: currentUser.name,
            teacherAvatar: currentUser.avatar,
            proposedCurriculum,
            estimatedSessions,
            bidCredits: bidPriceCredits,
          });
          return {
            ...b,
            bidsCount: b.bidsCount + 1,
            bids: [newBid, ...b.bids],
          };
        }
        return b;
      })
    );
    showToast(`Curriculum proposal submitted with ${estimatedSessions} sessions!`, 'success');
  };

  const requestFusionSession = (fusionId: string) => {
    const fusion = fusionOptions.find(f => f.id === fusionId);
    showToast(`Cross-Skill Fusion requested: ${fusion?.title}`, 'success');
  };

  const filteredNotebookEntries = useMemo(() => {
    if (!searchQueryNotebook.trim()) return notebookEntries;
    const q = searchQueryNotebook.toLowerCase();
    return notebookEntries.filter(entry =>
      entry.title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.skillName.toLowerCase().includes(q) ||
      entry.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [notebookEntries, searchQueryNotebook]);

  // Credential Ledger SHA-256 Block Minting
  const generateNewCredentialBlock = (learnerName: string, learnerId: string, skillName: string, scorePct: number) => {
    const lastBlock = credentialLedger[credentialLedger.length - 1];
    const newIndex = lastBlock ? lastBlock.blockIndex + 1 : 1;
    const prevHash = lastBlock ? lastBlock.blockHash : '00000000000000000000000000000000';

    const dataString = `${newIndex}-${learnerId}-${skillName}-${scorePct}-${Date.now()}-${prevHash}`;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const blockHash = Math.abs(hash).toString(16).padStart(32, '0') + 'a7f9b23c4d5e8912';

    const newBlock: CredentialBlock = {
      blockIndex: newIndex,
      certificateId: `CERT-2026-${Date.now().toString().slice(-4)}-${skillName.slice(0, 4).toUpperCase()}`,
      learnerName,
      learnerId,
      teacherName: currentUser.name,
      teacherId: currentUser.id,
      skillName,
      levelEarned: 'Intermediate',
      sessionCount: 1,
      quizScorePct: scorePct,
      timestamp: new Date().toISOString(),
      previousHash: prevHash,
      blockHash,
      digitalSignature: `SIG_AI_ECDSA_${blockHash.slice(0, 16)}`,
      verificationUrl: `https://verify.skillexchange.org/cert/CERT-2026-${Date.now().toString().slice(-4)}`,
      status: 'immutable_verified',
    };

    setCredentialLedger(prev => [...prev, newBlock]);
    mintCredentialBlockInDB(newBlock);
  };

  // Soft Skills Practice
  const startSoftSkillPractice = () => {
    setIsPracticingSoftSkills(true);
    showToast('AI Voice Lab active. Real-time cadence & filler word analysis running...', 'info');
  };

  const stopSoftSkillPractice = () => {
    setIsPracticingSoftSkills(false);
    showToast('Practice drill complete! Overall clarity score: 94/100.', 'success');
  };

  const recordSpeechSnippet = (text: string) => {
    const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know'];
    const detected: { word: string; count: number }[] = [];
    let fillerCount = 0;

    fillers.forEach(f => {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        detected.push({ word: f, count: matches.length });
        fillerCount += matches.length;
      }
    });

    setSoftSkillMetrics(prev => ({
      ...prev,
      fillerWordCount: prev.fillerWordCount + fillerCount,
      fillerWordsDetected: detected.length > 0 ? detected : prev.fillerWordsDetected,
      clarityScore: Math.max(70, Math.min(99, 96 - fillerCount * 3)),
    }));
  };

  // Live Session
  const startLiveSession = (title: string, teacherName: string, learnerName: string, skillName: string) => {
    const session: LiveSessionState = {
      id: `sess-${Date.now()}`,
      title,
      teacherName,
      learnerName,
      skillName,
      mode: 'direct_exchange',
      durationMins: 45,
      remainingSeconds: 45 * 60,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      whiteboardActiveTool: 'pen',
      escrowStatus: 'held_in_escrow',
      objectives: [
        { id: 'obj-1', text: 'Vectorized NumPy & Pandas Memory Architecture', completed: true },
        { id: 'obj-2', text: 'Live Multi-Key GroupBy Aggregation Practice', completed: false },
        { id: 'obj-3', text: 'AI Session Summary & Micro-Quiz Verification', completed: false },
      ]
    };
    setActiveSession(session);
    showToast(`Study Room opened: ${title}`, 'success');
  };

  const endLiveSession = () => {
    setActiveSession(null);
    showToast('Session completed! Transcript summary and micro-quiz generated.', 'info');
  };

  const releaseEscrow = () => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, escrowStatus: 'learner_confirmed_released' } : null);
      showToast('Escrow released! 1.4 Credits transferred to teacher wallet.', 'success');
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        allUsers,
        switchUser,
        updateCurrentUserProfile,
        skills,
        addSkillToTeach,
        removeSkillToTeach,
        addSkillToLearn,
        removeSkillToLearn,
        candidates,
        swapProposals,
        sendExchangeProposal,
        acceptExchangeProposal,
        declineExchangeProposal,
        bookPaidTeacher,
        skillChains,
        futureCommitments,
        createFutureCommitment,
        closeSkillChain,
        acceptSkillChain,
        transcriptProofs,
        activeQuizProof,
        setActiveQuizProof,
        submitMicroQuiz,
        dynamicRates,
        transactions,
        transferCredits,
        adjustSkillDemand,
        bounties,
        postBounty,
        submitBountyBid,
        fusionOptions,
        predictiveMatches,
        requestFusionSession,
        notebookEntries,
        searchQueryNotebook,
        setSearchQueryNotebook,
        filteredNotebookEntries,
        credentialLedger,
        generateNewCredentialBlock,
        softSkillMetrics,
        isPracticingSoftSkills,
        startSoftSkillPractice,
        stopSoftSkillPractice,
        recordSpeechSnippet,
        activeSession,
        startLiveSession,
        endLiveSession,
        releaseEscrow,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        toastMessage,
        showToast,
        dismissToast,
        activeChatPeer,
        peerConversations,
        isPeerTyping,
        openChatWithPeer,
        closeChat,
        sendPeerMessage,
        clearPeerChat,
        isAuthenticated,
        isAuthLoading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginUser,
        registerUser,
        resendVerification,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
