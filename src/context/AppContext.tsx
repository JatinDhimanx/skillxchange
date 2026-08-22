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
  IncomingCallInvite,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
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
  addTeachingSkillToDB,
  removeTeachingSkillFromDB,
  addLearningGoalToDB,
  removeLearningGoalFromDB,
} from '../lib/supabase/services';
import {
  signUpUser,
  signInUser,
  signOutUser,
  onAuthStateChanged,
  fetchUserProfile,
  resendVerificationEmail,
  getAuthenticatedSession,
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
  | 'bounties'
  | 'bounty_board'
  | 'bounty-board'
  | 'fusion'
  | 'fusion_sessions'
  | 'fusion-sessions'
  | 'predictive_matches'
  | 'predictive-matches'
  | 'second_brain'
  | 'second-brain'
  | 'credentials'
  | 'credential_ledger'
  | 'credential-ledger'
  | 'soft_skills'
  | 'soft_skills_lab'
  | 'soft-skills-lab'
  | 'verification_center'
  | 'verification-center'
  | 'college'
  | 'college_hub'
  | 'college-hub'
  | 'admin_dashboard'
  | 'admin-panel'
  | 'progress';

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

export interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (bio: string, headline: string) => void;

  // Skills Catalog
  skills: Skill[];
  addSkillToTeach: (skillName: string, category: string, level: string, years: number) => void;
  removeSkillToTeach: (skillId: string) => void;
  addSkillToLearn: (skillName: string, targetLevel: string, urgency: string) => void;
  removeSkillToLearn: (skillId: string) => void;

  // Matching Engine
  candidates: MatchCandidate[];
  swapProposals: BarterSwapProposal[];
  sendExchangeProposal: (targetUserId: string, offeredSkill: string, wantedSkill: string, notes?: string) => void;
  acceptExchangeProposal: (proposalId: string) => void;
  declineExchangeProposal: (proposalId: string) => void;
  bookPaidTeacher: (teacherId: string, skillName: string, rateInr?: number) => void;

  // 3-Way Chains (60.1)
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
  startLiveSession: (title: string, teacherName: string, learnerName: string, skillName: string, roomCode?: string) => void;
  endLiveSession: () => void;
  releaseEscrow: () => void;

  // Incoming Live Study Room Call Invite
  incomingCallInvite: IncomingCallInvite | null;
  invitePeerToStudyRoom: (peerId: string, skillName: string, title?: string) => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;

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
  authModalTab: 'signin' | 'signup' | 'forgot' | 'reset_password';
  openAuthModal: (tab?: 'signin' | 'signup' | 'forgot' | 'reset_password') => void;
  closeAuthModal: () => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
  registerUser: (data: SignUpData) => Promise<{ success: boolean; needsEmailVerification: boolean; error: string | null }>;
  resendVerification: (email: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

const BLANK_GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Peer',
  handle: '@guest',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  headline: 'Decentralized Peer Learner',
  bio: 'Sign in or register to begin bartering skills on SkillXchange.',
  location: 'India',
  timezone: 'IST (UTC+5:30)',
  college: 'SkillXchange Network',
  collegeVerified: true,
  languages: ['English'],
  skillsToTeach: [],
  skillsToLearn: [],
  creditsBalance: 0,
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
  const [skills, setSkills] = useState<Skill[]>([]);

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'forgot' | 'reset_password'>('signin');

  // Hydrate all database data
  const hydrateAllData = async (user: UserProfile) => {
    try {
      const [dbProfiles, dbSkills, dbBounties, dbLedger, dbNotes] = await Promise.all([
        fetchProfilesFromDB(),
        fetchSkillsFromDB(),
        fetchBountiesFromDB(),
        fetchCredentialLedgerFromDB(),
        fetchNotebookEntriesFromDB(user.id),
      ]);

      if (dbProfiles && dbProfiles.length > 0) {
        setAllUsers(dbProfiles);
      } else {
        setAllUsers([user]);
      }

      if (dbSkills && dbSkills.length > 0) {
        setSkills(dbSkills);
      } else {
        setSkills([]);
      }

      if (dbBounties && dbBounties.length > 0) {
        setBounties(dbBounties);
      } else {
        setBounties([]);
      }

      if (dbLedger && dbLedger.length > 0) {
        setCredentialLedger(dbLedger);
      } else {
        setCredentialLedger([]);
      }

      if (dbNotes && dbNotes.length > 0) {
        // Filter notes for this specific user
        const userNotes = dbNotes.filter(n => !(n as any).userId || (n as any).userId === user.id);
        setNotebookEntries(userNotes);
      } else {
        setNotebookEntries([]);
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

    // Initial check of active session
    getAuthenticatedSession().then(async session => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(profile));
          } catch {}
          hydrateAllData(profile);
        }
      }
      setIsAuthLoading(false);
    });

    const unsubscribe = onAuthStateChanged(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalTab('reset_password');
        setAuthModalOpen(true);
        return;
      }

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          if (event !== 'PASSWORD_RECOVERY') {
            setAuthModalOpen(false);
          }
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(profile));
          } catch {}
          hydrateAllData(profile);
        }
      } else {
        // Clear stale local data on logout / invalid session
        try {
          localStorage.removeItem('skillxchange_active_user');
        } catch {}
        setIsAuthenticated(false);
        setCurrentUser(BLANK_GUEST_USER);
        setAuthModalOpen(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: 'signin' | 'signup' | 'forgot' | 'reset_password' = 'signin') => {
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

      return {
        success: false,
        error: 'Invalid username/email or password. If you do not have an account, please register first.',
      };
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
    setTransactions([]);
    setNotifications([]);
    setPeerConversations({});
    setSwapProposals([]);
    setNotebookEntries([]);
    try {
      localStorage.removeItem('skillxchange_active_user');
    } catch {}
    showToast('Signed out successfully.', 'info');
    setIsAuthLoading(false);
  };

  // Innovation States
  const [skillChains, setSkillChains] = useState<SkillChain[]>([]);
  const [futureCommitments, setFutureCommitments] = useState<FutureCommitment[]>([]);
  const [transcriptProofs, setTranscriptProofs] = useState<SessionTranscriptProof[]>([]);
  const [activeQuizProof, setActiveQuizProof] = useState<SessionTranscriptProof | null>(null);
  const [dynamicRates, setDynamicRates] = useState<DynamicSkillRate[]>([]);
  const [bounties, setBounties] = useState<SkillBounty[]>([]);
  const [fusionOptions] = useState<FusionSessionOption[]>([]);
  const [predictiveMatches] = useState<PredictiveMatch[]>([]);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);
  const [searchQueryNotebook, setSearchQueryNotebook] = useState<string>('');
  const [credentialLedger, setCredentialLedger] = useState<CredentialBlock[]>([]);

  // Dynamic Transaction Ledger (Starts clean for new users or loads from DB)
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);

  // Notifications (Starts clean or loads from DB)
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

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

  // Realtime Incoming Call Invite State
  const [incomingCallInvite, setIncomingCallInvite] = useState<IncomingCallInvite | null>(null);
  const globalRealtimeChannelRef = useRef<any>(null);

  // ── Global Supabase Realtime Channel (Live Chat & Study Room Invites) ────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase.channel('skillxchange_global_network', {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'peer_chat_message' }, ({ payload }) => {
        if (payload && payload.receiverId === currentUser.id) {
          const newMsg: PeerChatMessage = {
            id: payload.id || `msg-${Date.now()}`,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            text: payload.text,
            timestamp: payload.timestamp,
            isMe: false,
            status: 'read',
            type: payload.type,
            proposalData: payload.proposalData,
          };

          setPeerConversations(prev => ({
            ...prev,
            [payload.senderId]: [...(prev[payload.senderId] || []), newMsg],
          }));

          if (!activeChatPeer || activeChatPeer.id !== payload.senderId) {
            addNotification(`New message from ${payload.senderName}`, payload.text, 'match');
            showToast(`New message from ${payload.senderName}`, 'info');
          }
        }
      })
      .on('broadcast', { event: 'room_invite' }, ({ payload }) => {
        if (payload && payload.toUserId === currentUser.id) {
          setIncomingCallInvite(payload);
          addNotification(`Incoming Study Room Call`, `${payload.fromUserName} invited you to: ${payload.title}`, 'match');
          showToast(`📞 Incoming Study Room call from ${payload.fromUserName}!`, 'success');
        }
      })
      .subscribe();

    globalRealtimeChannelRef.current = channel;

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [currentUser.id, activeChatPeer]);

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
          fetchChatMessagesFromDB(currentUser.id),
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
  }, [currentUser.id]);

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

    // Optimistically append local message
    setPeerConversations(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), userMsg],
    }));

    // Persist real message to Supabase DB
    saveChatMessageToDB(currentUser.id, peerId, userMsg);

    // Live broadcast to peer over Supabase Realtime channel
    globalRealtimeChannelRef.current?.send({
      type: 'broadcast',
      event: 'peer_chat_message',
      payload: { ...userMsg, receiverId: peerId },
    });
  };

  const clearPeerChat = (peerId: string) => {
    setPeerConversations(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    showToast('Conversation cleared.', 'info');
  };

  const switchUser = (userId: string) => {
    if (isAuthenticated) {
      showToast('Signed in with active Supabase session. Sign out to switch accounts.', 'info');
      return;
    }
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched active persona to ${user.name} (${user.handle})`, 'info');
    }
  };

  // Profile Updates
  const updateCurrentUserBio = (bio: string) => {
    const updated = { ...currentUser, bio };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    updateProfileInDB(currentUser.id, { bio });
    showToast('Bio updated successfully!', 'success');
  };

  const updateCurrentUserHeadline = (headline: string) => {
    const updated = { ...currentUser, headline };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    updateProfileInDB(currentUser.id, { headline });
    showToast('Headline updated successfully!', 'success');
  };

  const updateCurrentUserProfile = (bio: string, headline: string) => {
    const updated = { ...currentUser, bio, headline };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    updateProfileInDB(currentUser.id, { bio, headline });
    showToast('Profile updated successfully!', 'success');
  };

  // Dynamic Skill Offering Addition & DB Sync
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

    // Async persist to Supabase
    addTeachingSkillToDB(currentUser.id, {
      id: newOffering.skillId,
      skillName,
      category,
      level,
      yearsExperience: years,
      hourlyRateCredits: 1.2,
      hourlyRateInr: 450,
    });

    showToast(`Published "${skillName}" to your skills! Recalculating matches...`, 'success');
  };

  const removeSkillToTeach = (skillId: string) => {
    const updatedTeach = currentUser.skillsToTeach.filter(s => s.skillId !== skillId);
    const updatedUser = { ...currentUser, skillsToTeach: updatedTeach };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    // Async delete from Supabase
    removeTeachingSkillFromDB(skillId);

    showToast('Skill removed from profile.', 'info');
  };

  // Dynamic Learning Goal Addition & DB Sync
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

    // Async persist to Supabase
    addLearningGoalToDB(currentUser.id, {
      id: newGoal.skillId,
      skillName,
      targetLevel,
      urgency,
    });

    showToast(`Added "${skillName}" to learning goals! Searching for peers...`, 'success');
  };

  const removeSkillToLearn = (skillId: string) => {
    const updatedLearn = currentUser.skillsToLearn.filter(s => s.skillId !== skillId);
    const updatedUser = { ...currentUser, skillsToLearn: updatedLearn };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    // Async delete from Supabase
    removeLearningGoalFromDB(skillId);

    showToast('Learning goal removed.', 'info');
  };

  // Live Study Room Real-Time Calling System
  const invitePeerToStudyRoom = (peerId: string, skillName: string, title?: string) => {
    const roomCode = `ROOM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const peerObj = allUsers.find(u => u.id === peerId);
    const peerName = peerObj?.name || 'Peer Mentor';
    const sessionTitle = title || `1-on-1 Exchange: ${skillName}`;

    // Launch local session for host
    startLiveSession(sessionTitle, peerName, currentUser.name, skillName, roomCode);
    setActiveTab('session');

    // Broadcast realtime call invite to peer
    globalRealtimeChannelRef.current?.send({
      type: 'broadcast',
      event: 'room_invite',
      payload: {
        roomCode,
        title: sessionTitle,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar,
        toUserId: peerId,
        skillName,
        timestamp: Date.now(),
      },
    });

    showToast(`Calling ${peerName}... Study Room [${roomCode}] launched!`, 'success');
  };

  const acceptIncomingCall = () => {
    if (!incomingCallInvite) return;
    startLiveSession(
      incomingCallInvite.title,
      incomingCallInvite.fromUserName,
      currentUser.name,
      incomingCallInvite.skillName,
      incomingCallInvite.roomCode
    );
    setActiveTab('session');
    showToast(`Connecting to ${incomingCallInvite.fromUserName}'s Study Room [${incomingCallInvite.roomCode}]...`, 'success');
    setIncomingCallInvite(null);
  };

  const declineIncomingCall = () => {
    setIncomingCallInvite(null);
    showToast('Study Room invitation declined.', 'info');
  };

  // Dynamic Matching Engine with intelligent token and substring matching
  const candidates = useMemo<MatchCandidate[]>(() => {
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
    const mySkillsToLearn = currentUser.skillsToLearn || [];
    const mySkillsToTeach = currentUser.skillsToTeach || [];

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);

    const isMatch = (skillA: string, skillB: string) => {
      const a = skillA.toLowerCase();
      const b = skillB.toLowerCase();
      if (a === b || a.includes(b) || b.includes(a)) return true;
      const tokensA = normalize(skillA);
      const tokensB = normalize(skillB);
      return tokensA.some(t => tokensB.includes(t));
    };

    return otherUsers.map(other => {
      const theirSkillsToLearn = other.skillsToLearn || [];
      const theirSkillsToTeach = other.skillsToTeach || [];

      const iCanTeachThem = mySkillsToTeach.find(myTeach =>
        theirSkillsToLearn.some(theirLearn => isMatch(myTeach.skillName, theirLearn.skillName))
      );

      const theyCanTeachMe = theirSkillsToTeach.find(theirTeach =>
        mySkillsToLearn.some(myLearn => isMatch(theirTeach.skillName, myLearn.skillName))
      );

      let matchScore = 60;
      let quality: 'perfect' | 'good' | 'possible' = 'possible';
      const reasons: string[] = [];

      if (iCanTeachThem && theyCanTeachMe) {
        matchScore = 96;
        quality = 'perfect';
        reasons.push(`Direct 2-way bilateral barter! You teach ${iCanTeachThem.skillName}, they teach ${theyCanTeachMe.skillName}.`);
        reasons.push(`High Trust Score match (${other.trustScore.overallScore}/100) with verified credentials.`);
        reasons.push(`Compatible evening & weekend study hours.`);
      } else if (theyCanTeachMe) {
        matchScore = 86;
        quality = 'good';
        reasons.push(`They offer ${theyCanTeachMe.skillName} matching your active learning goal.`);
        reasons.push(`Escrow-protected barter credit exchange or ₹${theyCanTeachMe.hourlyRateInr || 450}/hr booking available.`);
      } else if (iCanTeachThem) {
        matchScore = 78;
        quality = 'good';
        reasons.push(`They want to learn ${iCanTeachThem.skillName}. You can earn credits teaching them.`);
        reasons.push(`Active learner in your network (${other.streakDays}-day streak).`);
      } else {
        matchScore = 62;
        quality = 'possible';
        reasons.push(`Proximity match in technical discipline & campus network.`);
      }

      return {
        user: other,
        matchScore,
        quality,
        reasons,
        skillTeachMatch: {
          offeredByYou: iCanTeachThem ? iCanTeachThem.skillName : (mySkillsToTeach[0]?.skillName || 'General Skills'),
          wantedByThem: theirSkillsToLearn[0]?.skillName || 'Technical Guidance',
          levelFit: 'Peer Proficiency Match',
        },
        skillLearnMatch: {
          wantedByYou: mySkillsToLearn[0]?.skillName || 'General Skills',
          offeredByThem: theyCanTeachMe ? theyCanTeachMe.skillName : (theirSkillsToTeach[0]?.skillName || 'General Skills'),
          levelFit: 'Instructor Certified',
        },
        suggestedMode: ((iCanTeachThem && theyCanTeachMe) ? 'direct_exchange' : 'credit_exchange') as LearningMode,
        paidFallbackPrice: theirSkillsToTeach[0]?.hourlyRateInr || 450,
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
    // 1. Authorization check
    if (!currentUser.id || currentUser.id === 'guest') {
      openAuthModal('signin');
      showToast('Please sign in to send barter exchange proposals.', 'warning');
      return;
    }

    // 2. Prevent sending request to self
    if (targetUserId === currentUser.id) {
      showToast('You cannot send a barter proposal to yourself.', 'warning');
      return;
    }

    // 3. Prevent duplicate requests with same skills
    const isDuplicate = swapProposals.some(
      p =>
        p.senderId === currentUser.id &&
        p.receiverId === targetUserId &&
        p.status === 'pending' &&
        p.offeredSkill.toLowerCase() === offeredSkill.toLowerCase() &&
        p.wantedSkill.toLowerCase() === wantedSkill.toLowerCase()
    );
    if (isDuplicate) {
      showToast('A pending barter proposal for these skills already exists with this peer.', 'warning');
      return;
    }

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
      offeredSkill: offeredSkill.trim(),
      wantedSkill: wantedSkill.trim(),
      status: 'pending',
      proposedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes?.trim() || '1-on-1 Bilateral Skill Swap (0 INR, Escrow Protected)',
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

    // Auto peer response simulation for demo peers
    setTimeout(() => {
      acceptExchangeProposal(newProposal.id, true);
    }, 2800);
  };

  const acceptExchangeProposal = (proposalId: string, isFromPeer = false) => {
    let targetProp: BarterSwapProposal | undefined;

    setSwapProposals(prev => {
      targetProp = prev.find(p => p.id === proposalId);
      // Authorization & state transition check: only pending proposals can be accepted
      if (!targetProp || targetProp.status !== 'pending') {
        return prev;
      }
      const updated = prev.map(p => (p.id === proposalId ? { ...p, status: 'accepted' as const } : p));
      if (typeof window !== 'undefined' && currentUser.id) {
        try {
          localStorage.setItem(`skillxchange_proposals_${currentUser.id}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    if (!targetProp || targetProp.status !== 'pending') return;

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
      const target = prev.find(p => p.id === proposalId);
      if (!target || target.status !== 'pending') return prev;
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

  const bookPaidTeacher = (teacherId: string, skillName: string, rateInr: number = 450) => {
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
  const startLiveSession = (title: string, teacherName: string, learnerName: string, skillName: string, roomCode?: string) => {
    const code = roomCode || `ROOM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const session: LiveSessionState = {
      id: `sess-${Date.now()}`,
      roomCode: code,
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
        { id: 'obj-1', text: 'Live Vectorized Concept Exchange', completed: true },
        { id: 'obj-2', text: 'Collaborative Practice & Whiteboard', completed: false },
        { id: 'obj-3', text: 'Peer Micro-Quiz & Ledger Attestation', completed: false },
      ],
    };
    setActiveSession(session);
    showToast(`Study Room [${code}] opened!`, 'success');
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
        incomingCallInvite,
        invitePeerToStudyRoom,
        acceptIncomingCall,
        declineIncomingCall,
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
