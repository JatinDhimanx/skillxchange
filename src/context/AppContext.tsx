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
  updateTeachingSkillInDB,
  updateLearningGoalInDB,
  addTeachingSkillToDB,
  removeTeachingSkillFromDB,
  addLearningGoalToDB,
  removeLearningGoalFromDB,
  updateLearningGoalProgressInDB,
  fetchCreditTransactionsFromDB,
  recordCreditTransactionInDB,
  updateUserCreditBalanceInDB,
  deleteNotebookEntryFromDB,
  computeSha256,
  transferCreditsAtomicInDB,
  releaseEscrowAtomicInDB,
} from '../lib/supabase/services';
import {
  SEED_SKILL_CHAINS,
  SEED_FUTURE_COMMITMENTS,
  SEED_TRANSCRIPT_PROOFS,
  DYNAMIC_RATES,
  SEED_BOUNTIES,
  SEED_PREDICTIVE_MATCHES,
  SEED_NOTEBOOK_ENTRIES,
  SEED_CREDENTIAL_LEDGER,
} from '../data/seedData';
import {
  signUpUser,
  signInUser,
  signOutUser,
  updateUserEmail,
  onAuthStateChanged,
  fetchUserProfile,
  resendVerificationEmail,
  getAuthenticatedSession,
  SignUpData
} from '../lib/supabase/auth';

export type NavigationTab =
  | 'home'
  | 'discovery'
  | 'ai-discovery'
  | 'skill-discovery'
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
  | 'graph'
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
  | 'soft-skills'
  | 'soft-skills-lab'
  | 'verification_center'
  | 'verification-center'
  | 'college'
  | 'college_hub'
  | 'college-hub'
  | 'admin_dashboard'
  | 'admin-panel'
  | 'progress'
  | 'vault'
  | 'hub'
  | 'notebook';

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
  updateCurrentUserFullProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  requestEmailChange: (newEmail: string) => Promise<{ needsVerification: boolean; error: string | null }>;

  // Skills Catalog
  skills: Skill[];
  addSkillToTeach: (skillName: string, category: string, level: string, years: number) => void;
  editSkillToTeach: (skillId: string, updates: Partial<UserSkillOffering>) => void;
  removeSkillToTeach: (skillId: string) => void;
  addSkillToLearn: (skillName: string, targetLevel: string, urgency: string) => void;
  editSkillToLearn: (skillId: string, updates: Partial<UserLearningGoal>) => void;
  removeSkillToLearn: (skillId: string) => void;
  updateLearningGoalProgress: (skillId: string, progressPercent: number) => void;

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

  // Innovations
  fusionOptions: FusionSessionOption[];
  predictiveMatches: PredictiveMatch[];
  requestFusionSession: (fusionId: string) => void;
  createFusionSession: (fusion: Omit<FusionSessionOption, 'id'>) => void;

  // Second Brain Notebook (60.8)
  notebookEntries: NotebookEntry[];
  searchQueryNotebook: string;
  setSearchQueryNotebook: (q: string) => void;
  filteredNotebookEntries: NotebookEntry[];
  addNotebookEntry: (entry: Omit<NotebookEntry, 'id' | 'date'>) => void;
  deleteNotebookEntry: (id: string) => void;

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
  sendPeerTyping: (peerId: string, isTyping: boolean) => void;
  clearPeerChat: (peerId: string) => void;

  // Supabase Auth & Session System
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup' | 'forgot' | 'reset_password';
  openAuthModal: (tab?: 'signin' | 'signup' | 'forgot' | 'reset_password') => void;
  closeAuthModal: () => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
  loginAsDemoUser: (demoUser: UserProfile) => void;
  registerUser: (data: SignUpData) => Promise<{ success: boolean; needsEmailVerification: boolean; error: string | null }>;
  resendVerification: (email: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

// ── Default Mock User ────────────────────────────────────────────────────────
export const DEFAULT_USER: UserProfile = {
  id: 'guest',
  name: 'Jatin',
  handle: '@jatin_dev',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80',
  headline: 'Full-stack developer and UI/UX enthusiast. Let\'s learn and grow together!',
  bio: 'Passionate developer who loves teaching and learning new things.\nAlways up for a good knowledge exchange! 🚀',
  location: 'Chandigarh, India',
  timezone: 'IST (UTC+5:30)',
  college: 'Punjab Engineering College',
  collegeVerified: true,
  languages: ['English', 'Hindi', 'Punjabi'],
  skillsToTeach: [
    {
      skillId: 'teach-1',
      skillName: 'Python',
      category: 'Programming',
      level: 'Advanced',
      yearsExperience: 3,
      verified: true,
      verificationBadge: 'Verified Mentor',
      hourlyRateInr: 600,
      hourlyRateCredits: 1.4,
      proofCount: 18,
    },
    {
      skillId: 'teach-2',
      skillName: 'UI/UX Design',
      category: 'Design & Creative',
      level: 'Intermediate',
      yearsExperience: 2,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 500,
      hourlyRateCredits: 1.2,
      proofCount: 12,
    },
    {
      skillId: 'teach-3',
      skillName: 'Git & GitHub',
      category: 'Programming',
      level: 'Intermediate',
      yearsExperience: 2,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 450,
      hourlyRateCredits: 1.1,
      proofCount: 9,
    },
    {
      skillId: 'teach-4',
      skillName: 'Web Development',
      category: 'Programming',
      level: 'Intermediate',
      yearsExperience: 3,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 550,
      hourlyRateCredits: 1.3,
      proofCount: 15,
    },
  ],
  skillsToLearn: [
    {
      skillId: 'learn-1',
      skillName: 'Machine Learning',
      targetLevel: 'Beginner',
      urgency: 'career_switch',
      targetDateWeeks: 6,
      currentRoadmapStep: 2,
      totalRoadmapSteps: 5,
      progressPercent: 40,
    },
    {
      skillId: 'learn-2',
      skillName: 'Data Structures',
      targetLevel: 'Intermediate',
      urgency: 'urgent',
      targetDateWeeks: 8,
      currentRoadmapStep: 3,
      totalRoadmapSteps: 6,
      progressPercent: 50,
    },
    {
      skillId: 'learn-3',
      skillName: 'React Native',
      targetLevel: 'Intermediate',
      urgency: 'flexible',
      targetDateWeeks: 10,
      currentRoadmapStep: 2,
      totalRoadmapSteps: 5,
      progressPercent: 35,
    },
    {
      skillId: 'learn-4',
      skillName: 'Advanced SQL',
      targetLevel: 'Beginner',
      urgency: 'flexible',
      targetDateWeeks: 4,
      currentRoadmapStep: 1,
      totalRoadmapSteps: 4,
      progressPercent: 20,
    },
  ],
  creditsBalance: 128,
  totalCreditsEarned: 185,
  totalCreditsSpent: 57,
  teachingHours: 36,
  learningHours: 28,
  trustScore: {
    identityVerified: true,
    skillVerifiedCount: 4,
    completedSessions: 43,
    attendanceRate: 99,
    averageRating: 4.95,
    cancellationRate: 1,
    responseRate: 98,
    accountAgeMonths: 8,
    overallScore: 97,
  },
  streakDays: 30,
  xpPoints: 3450,
  badges: [
    {
      id: 'b-1',
      title: 'Top Peer Mentor',
      description: 'Completed 15+ 5-star teaching sessions',
      icon: '🏆',
      category: 'teaching',
      unlockedAt: '2026-07-15',
    },
    {
      id: 'b-2',
      title: 'Chain Pioneer',
      description: 'Successfully initiated a 3-way barter loop',
      icon: '⛓️',
      category: 'chain',
      unlockedAt: '2026-08-01',
    },
    {
      id: 'b-3',
      title: 'Ledger Attested',
      description: '5+ SHA-256 micro-quiz blocks minted',
      icon: '📜',
      category: 'verification',
      unlockedAt: '2026-08-10',
    },
  ],
  role: 'user',
};

export const DEMO_USER_AARAV: UserProfile = {
  id: 'user-demo-aarav',
  name: 'Aarav Sharma',
  handle: '@aarav_dev',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  headline: 'Full-Stack & Machine Learning Tutor',
  bio: 'Hey! I am Aarav. I teach Python, Machine Learning, and Next.js, and I want to learn acoustic guitar.',
  location: 'Bangalore, India',
  timezone: 'IST (UTC+5:30)',
  college: 'BMS Institute of Technology',
  collegeVerified: true,
  languages: ['English', 'Hindi'],
  skillsToTeach: [
    {
      skillId: 'teach-python-01',
      skillName: 'Python & AI',
      category: 'Programming',
      level: 'Advanced',
      yearsExperience: 4,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 600,
      hourlyRateCredits: 1.5,
      proofCount: 8,
    },
    {
      skillId: 'teach-nextjs-01',
      skillName: 'Next.js & React',
      category: 'Programming',
      level: 'Intermediate',
      yearsExperience: 3,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 500,
      hourlyRateCredits: 1.0,
      proofCount: 5,
    },
  ],
  skillsToLearn: [
    {
      skillId: 'learn-guitar-01',
      skillName: 'Guitar & Music Theory',
      targetLevel: 'Intermediate',
      urgency: 'flexible',
      currentRoadmapStep: 2,
      totalRoadmapSteps: 6,
      progressPercent: 30,
    },
  ],
  creditsBalance: 8.5,
  totalCreditsEarned: 14.0,
  totalCreditsSpent: 5.5,
  teachingHours: 14,
  learningHours: 6,
  trustScore: {
    identityVerified: true,
    skillVerifiedCount: 2,
    completedSessions: 12,
    attendanceRate: 100,
    averageRating: 4.9,
    cancellationRate: 0,
    responseRate: 98,
    accountAgeMonths: 5,
    overallScore: 96,
  },
  streakDays: 8,
  xpPoints: 950,
  badges: [
    {
      id: 'b-1',
      title: 'Top Barter Mentor',
      description: 'Completed 10+ verified sessions',
      icon: 'Award',
      category: 'teaching',
      unlockedAt: '2026-08-01',
    },
  ],
  role: 'user',
};

export const DEMO_USER_PRIYA: UserProfile = {
  id: 'user-demo-priya',
  name: 'Priya Patel',
  handle: '@priya_design',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  headline: 'Lead Product Designer & UX Mentor',
  bio: 'Hi! I am Priya. I specialize in Figma UI/UX Design and Design Systems, looking to learn Python & AI scripting.',
  location: 'Mumbai, India',
  timezone: 'IST (UTC+5:30)',
  college: 'National Institute of Design (NID)',
  collegeVerified: true,
  languages: ['English', 'Hindi'],
  skillsToTeach: [
    {
      skillId: 'teach-uiux-01',
      skillName: 'UI/UX & Figma',
      category: 'Design',
      level: 'Advanced',
      yearsExperience: 5,
      verified: true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: 700,
      hourlyRateCredits: 1.5,
      proofCount: 10,
    },
  ],
  skillsToLearn: [
    {
      skillId: 'learn-python-01',
      skillName: 'Python & AI',
      targetLevel: 'Intermediate',
      urgency: 'urgent',
      currentRoadmapStep: 1,
      totalRoadmapSteps: 6,
      progressPercent: 20,
    },
  ],
  creditsBalance: 6.0,
  totalCreditsEarned: 11.0,
  totalCreditsSpent: 5.0,
  teachingHours: 10,
  learningHours: 8,
  trustScore: {
    identityVerified: true,
    skillVerifiedCount: 1,
    completedSessions: 9,
    attendanceRate: 98,
    averageRating: 5.0,
    cancellationRate: 0,
    responseRate: 100,
    accountAgeMonths: 4,
    overallScore: 94,
  },
  streakDays: 5,
  xpPoints: 820,
  badges: [
    {
      id: 'b-2',
      title: 'Design Virtuoso',
      description: '5-star design mentor rating',
      icon: 'Sparkles',
      category: 'teaching',
      unlockedAt: '2026-08-05',
    },
  ],
  role: 'user',
};

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

export const SEED_FUSION_OPTIONS: FusionSessionOption[] = [
  {
    id: 'fusion-1',
    title: 'AI Audio Synthesis & Deep Learning DSP',
    primarySkill: 'Python & PyTorch',
    secondarySkill: 'Music Production & Audio DSP',
    categoryCombo: 'AI + Music',
    compatibilityScore: 98,
    suggestedSplitMins: '30m PyTorch Audio + 30m Ableton Sound Design',
    rationale: 'Combining digital signal processing theory with deep generative models produces immediate audible feedback for model latent spaces.',
    idealFor: 'Software developers wanting creative AI sound synthesis.',
  },
  {
    id: 'fusion-2',
    title: 'Web3 Distributed Ledgers & Cryptographic Systems',
    primarySkill: 'Solidity & Smart Contracts',
    secondarySkill: 'Distributed Systems & Go',
    categoryCombo: 'Blockchain + Systems',
    compatibilityScore: 96,
    suggestedSplitMins: '30m Go Consensus + 30m EVM Bytecode',
    rationale: 'Understanding Raft/Paxos consensus deepens intuition for proof-of-stake finality and Byzantine fault tolerance.',
    idealFor: 'Engineers building high-throughput decentralized protocols.',
  },
  {
    id: 'fusion-3',
    title: 'WebGL 3D Shaders & Creative Brand UI/UX',
    primarySkill: 'GLSL Shaders & Three.js',
    secondarySkill: 'UI/UX Design Systems',
    categoryCombo: 'Design + 3D Graphics',
    compatibilityScore: 95,
    suggestedSplitMins: '30m Figma Spatial Tokens + 30m GLSL Fragment Math',
    rationale: 'Connecting spatial aesthetic layout rules with GPU-accelerated raymarching enables world-class interactive web experiences.',
    idealFor: 'Creative technologists and frontend design engineers.',
  },
  {
    id: 'fusion-4',
    title: 'Conversational Spanish & Latin American Culinary Arts',
    primarySkill: 'Conversational Spanish',
    secondarySkill: 'Regional Mexican & Spanish Gastronomy',
    categoryCombo: 'Language + Culinary',
    compatibilityScore: 94,
    suggestedSplitMins: '30m Vocabulary Practice + 30m Live Recipe Prep',
    rationale: 'Contextual immersion in culinary terminology builds rapid natural vocabulary retention without rote grammar memorization.',
    idealFor: 'Language enthusiasts learning through experiential practice.',
  },
  {
    id: 'fusion-5',
    title: 'Algorithmic High-Frequency Trading & Quantitative Python',
    primarySkill: 'Python Pandas & NumPy',
    secondarySkill: 'Financial Derivatives & Options Math',
    categoryCombo: 'Finance + Code',
    compatibilityScore: 97,
    suggestedSplitMins: '30m Black-Scholes Greeks + 30m Vectorized Backtesting',
    rationale: 'Mathematical options modeling directly maps to vectorized NumPy array computations and risk-neutral hedging simulations.',
    idealFor: 'Quantitative analysts and data scientists entering finance.',
  },
  {
    id: 'fusion-6',
    title: 'Executive Board Rhetoric & Technical Architecture Defense',
    primarySkill: 'Executive Speech & Debate',
    secondarySkill: 'Cloud Microservices Architecture',
    categoryCombo: 'Communication + Architecture',
    compatibilityScore: 93,
    suggestedSplitMins: '30m System Architecture Diagram + 30m Pitch Defense',
    rationale: 'Engineers who learn rhetorical argumentation successfully defend complex architectural tradeoffs to non-technical stakeholders.',
    idealFor: 'Tech leads, staff engineers, and engineering managers.',
  },
];

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
      const [dbProfiles, dbSkills, dbBounties, dbLedger, dbNotes, dbTxns] = await Promise.all([
        fetchProfilesFromDB(),
        fetchSkillsFromDB(),
        fetchBountiesFromDB(),
        fetchCredentialLedgerFromDB(),
        fetchNotebookEntriesFromDB(user.id),
        fetchCreditTransactionsFromDB(user.id),
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

      // Backend-connected dynamic transaction history & credit accounting
      if (dbTxns && dbTxns.length > 0) {
        setTransactions(dbTxns);
        const earned = dbTxns.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
        const spent = Math.abs(dbTxns.filter(t => t.delta < 0).reduce((sum, t) => sum + t.delta, 0));
        const latestBalance = dbTxns[0]?.balance ?? user.creditsBalance;

        setCurrentUser(prev => ({
          ...prev,
          creditsBalance: latestBalance,
          totalCreditsEarned: earned,
          totalCreditsSpent: spent,
        }));
      } else {
        // Fallback local initial state if no transactions yet in DB
        const txKey = `skillxchange_txns_${user.id}`;
        const savedTx = localStorage.getItem(txKey);
        if (savedTx) {
          try {
            const parsed = JSON.parse(savedTx);
            setTransactions(parsed);
            const earned = parsed.filter((t: any) => t.delta > 0).reduce((sum: number, t: any) => sum + t.delta, 0);
            const spent = Math.abs(parsed.filter((t: any) => t.delta < 0).reduce((sum: number, t: any) => sum + t.delta, 0));
            setCurrentUser(prev => ({
              ...prev,
              totalCreditsEarned: earned || prev.totalCreditsEarned,
              totalCreditsSpent: spent || prev.totalCreditsSpent,
            }));
          } catch { }
        } else {
          const initialTx = [
            {
              id: `TXN-${user.id.slice(-4)}-01`,
              date: new Date().toISOString().split('T')[0],
              desc: 'Genesis Barter Credit Grant',
              delta: +user.creditsBalance,
              balance: user.creditsBalance,
            },
          ];
          setTransactions(initialTx);
        }
      }

      // User specific private notifications
      const notifKey = `skillxchange_notifs_${user.id}`;
      const savedNotifs = localStorage.getItem(notifKey);
      if (savedNotifs) {
        try {
          setNotifications(JSON.parse(savedNotifs));
        } catch { }
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
    } catch { }
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
          } catch { }
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
          } catch { }
          hydrateAllData(profile);
        }
      } else {
        // Clear stale local data on logout / invalid session
        try {
          localStorage.removeItem('skillxchange_active_user');
        } catch { }
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
        } catch { }
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
          } catch { }
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

  const loginAsDemoUser = (demoUser: UserProfile) => {
    setCurrentUser(demoUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('skillxchange_active_user', JSON.stringify(demoUser));
    } catch { }
    hydrateAllData(demoUser);
    setAllUsers(prev => {
      const exists = prev.some(u => u.id === demoUser.id);
      return exists ? prev : [demoUser, ...prev];
    });
    setAuthModalOpen(false);
    showToast(`Signed in as ${demoUser.name}!`, 'success');
  };

  const registerUser = async (
    data: SignUpData
  ): Promise<{ success: boolean; needsEmailVerification: boolean; error: string | null }> => {
    setIsAuthLoading(true);
    try {
      const { user, needsEmailVerification, error, warning } = await signUpUser(data);
      if (error) {
        showToast(error, 'warning');
        return { success: false, needsEmailVerification: false, error };
      }

      if (user) {
        if (warning) {
          showToast(warning, 'warning');
        }
        setAllUsers(prev => [user, ...prev.filter(u => u.id !== user.id)]);

        if (!needsEmailVerification) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('skillxchange_active_user', JSON.stringify(user));
          } catch { }
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
    } catch { }
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
  const [fusionOptions, setFusionOptions] = useState<FusionSessionOption[]>(SEED_FUSION_OPTIONS);
  const [predictiveMatches] = useState<PredictiveMatch[]>(SEED_PREDICTIVE_MATCHES);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(SEED_NOTEBOOK_ENTRIES);
  const [searchQueryNotebook, setSearchQueryNotebook] = useState<string>('');
  const [credentialLedger, setCredentialLedger] = useState<CredentialBlock[]>(SEED_CREDENTIAL_LEDGER);

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
  const localBroadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // ── Global Supabase Realtime Channel & Multi-Tab Sync (Live Chat & Invites) ──
  useEffect(() => {
    // 1. Setup Local Browser Multi-Tab Sync
    let localBc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        localBc = new BroadcastChannel('skillxchange_local_realtime');
        localBc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'peer_chat_message' && payload && payload.receiverId === currentUser.id) {
            const incomingMsg: PeerChatMessage = {
              id: payload.id || `msg-${Date.now()}`,
              senderId: payload.senderId,
              senderName: payload.senderName,
              senderAvatar: payload.senderAvatar,
              text: payload.text,
              timestamp: payload.timestamp || 'Just now',
              isMe: false,
              status: 'delivered',
              type: payload.type,
              proposalData: payload.proposalData,
            };

            setPeerConversations(prev => {
              const list = prev[payload.senderId] || [];
              if (list.some(m => m.id === incomingMsg.id)) return prev;
              return {
                ...prev,
                [payload.senderId]: [...list, incomingMsg],
              };
            });

            if (!activeChatPeer || activeChatPeer.id !== payload.senderId) {
              addNotification(`New message from ${payload.senderName}`, payload.text, 'match');
              showToast(`New message from ${payload.senderName}`, 'info');
            }
          } else if (type === 'peer_typing' && payload && payload.receiverId === currentUser.id) {
            setIsPeerTyping(prev => ({
              ...prev,
              [payload.senderId]: Boolean(payload.isTyping),
            }));
          } else if (type === 'room_invite' && payload && payload.toUserId === currentUser.id) {
            setIncomingCallInvite(payload);
            addNotification(`Incoming Study Room Call`, `${payload.fromUserName} invited you to: ${payload.title}`, 'match');
            showToast(`📞 Incoming Study Room call from ${payload.fromUserName}!`, 'success');
          }
        };
        localBroadcastChannelRef.current = localBc;
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Setup Supabase Realtime WebSocket Connection
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase.channel('skillxchange_global_network', {
      config: { broadcast: { self: false } },
    });

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          const newRow = payload?.new;
          if (newRow && (newRow.receiver_id === currentUser.id || newRow.sender_id === currentUser.id)) {
            const isMe = newRow.sender_id === currentUser.id;
            const peerId = isMe ? newRow.receiver_id : newRow.sender_id;
            const incomingMsg: PeerChatMessage = {
              id: newRow.id,
              senderId: newRow.sender_id,
              senderName: newRow.sender_name,
              senderAvatar: newRow.sender_avatar,
              text: newRow.text,
              timestamp: newRow.timestamp || 'Just now',
              isMe,
              status: newRow.is_read ? 'read' : 'delivered',
            };

            setPeerConversations(prev => {
              const currentList = prev[peerId] || [];
              if (currentList.some(m => m.id === incomingMsg.id)) return prev;
              return {
                ...prev,
                [peerId]: [...currentList, incomingMsg],
              };
            });

            if (!isMe && (!activeChatPeer || activeChatPeer.id !== newRow.sender_id)) {
              addNotification(`New message from ${newRow.sender_name}`, newRow.text, 'match');
              showToast(`New message from ${newRow.sender_name}`, 'info');
            }
          }
        }
      )
      .on('broadcast', { event: 'peer_chat_message' }, ({ payload }) => {
        if (payload && payload.receiverId === currentUser.id) {
          const newMsg: PeerChatMessage = {
            id: payload.id || `msg-${Date.now()}`,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            text: payload.text,
            timestamp: payload.timestamp || 'Just now',
            isMe: false,
            status: 'read',
            type: payload.type,
            proposalData: payload.proposalData,
          };

          setPeerConversations(prev => {
            const list = prev[payload.senderId] || [];
            if (list.some(m => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [payload.senderId]: [...list, newMsg],
            };
          });

          if (!activeChatPeer || activeChatPeer.id !== payload.senderId) {
            addNotification(`New message from ${payload.senderName}`, payload.text, 'match');
            showToast(`New message from ${payload.senderName}`, 'info');
          }
        }
      })
      .on('broadcast', { event: 'peer_typing' }, ({ payload }) => {
        if (payload && payload.receiverId === currentUser.id) {
          setIsPeerTyping(prev => ({
            ...prev,
            [payload.senderId]: Boolean(payload.isTyping),
          }));
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
      if (localBc) {
        localBc.close();
        localBroadcastChannelRef.current = null;
      }
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
          // Preserve current authenticated identity instead of clobbering with dbProfiles[0]
          if (currentUser.id && currentUser.id !== 'guest') {
            const myProfile = dbProfiles.find(p => p.id === currentUser.id);
            if (myProfile) {
              setCurrentUser(myProfile);
            }
          }
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

  const sendPeerTyping = (peerId: string, isTyping: boolean) => {
    if (!peerId) return;
    // Broadcast over Supabase Realtime channel
    try {
      globalRealtimeChannelRef.current?.send({
        type: 'broadcast',
        event: 'peer_typing',
        payload: { senderId: currentUser.id, receiverId: peerId, isTyping },
      });
    } catch { }

    // Broadcast over Local Browser Tab Sync
    try {
      localBroadcastChannelRef.current?.postMessage({
        type: 'peer_typing',
        payload: { senderId: currentUser.id, receiverId: peerId, isTyping },
      });
    } catch { }
  };

  const sendPeerMessage = (peerId: string, text: string) => {
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: PeerChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: timeStr,
      isMe: true,
      status: 'sent',
    };

    // 1. Optimistically append local message
    setPeerConversations(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), userMsg],
    }));

    // 2. Persist real message to Supabase DB
    saveChatMessageToDB(currentUser.id, peerId, userMsg);

    // 3. Live broadcast to peer over Supabase Realtime channel
    try {
      globalRealtimeChannelRef.current?.send({
        type: 'broadcast',
        event: 'peer_chat_message',
        payload: { ...userMsg, receiverId: peerId },
      });
    } catch { }

    // 4. Live broadcast over local browser tab sync
    try {
      localBroadcastChannelRef.current?.postMessage({
        type: 'peer_chat_message',
        payload: { ...userMsg, receiverId: peerId },
      });
    } catch { }

    // 5. Intelligent interactive peer response simulation (for demo peers or test personas)
    const targetPeer = allUsers.find(u => u.id === peerId);
    const isDemoPersona = !targetPeer?.email || targetPeer.id.startsWith('user-') || targetPeer.id.startsWith('mock-') || peerId === 'guest';
    if (isDemoPersona) {
      setTimeout(() => {
        setIsPeerTyping(prev => ({ ...prev, [peerId]: true }));
      }, 500);

      setTimeout(() => {
        setIsPeerTyping(prev => ({ ...prev, [peerId]: false }));
        const peerName = targetPeer?.name || 'Peer Mentor';
        const peerAvatar = targetPeer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
        const peerTeachSkill = targetPeer?.skillsToTeach[0]?.skillName || 'Technical Skills';

        let replyText = `Awesome! I'd love to help you with ${peerTeachSkill}. Let's do a 30-min hands-on barter session!`;
        const lower = text.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          replyText = `Hey ${currentUser.name}! Great to connect with you. I'm ready to practice ${peerTeachSkill} whenever you are! 🚀`;
        } else if (lower.includes('room') || lower.includes('meet') || lower.includes('call') || lower.includes('video')) {
          replyText = `Sounds great! Hit the "Room" button at the top right of this chat and I'll jump right in.`;
        } else if (lower.includes('swap') || lower.includes('barter') || lower.includes('trade')) {
          replyText = `I just reviewed your skills! I'm happy to teach ${peerTeachSkill} in exchange for ${currentUser.skillsToTeach[0]?.skillName || 'your offerings'}.`;
        } else if (lower.includes('help') || lower.includes('doubt') || lower.includes('question')) {
          replyText = `Definitely! Tell me which specific concept you're stuck on, or we can share our screen in the Study Room to debug it together.`;
        }

        const peerReplyMsg: PeerChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          senderId: peerId,
          senderName: peerName,
          senderAvatar: peerAvatar,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          status: 'delivered',
        };

        setPeerConversations(prev => ({
          ...prev,
          [peerId]: [...(prev[peerId] || []), peerReplyMsg],
        }));

        saveChatMessageToDB(peerId, currentUser.id, peerReplyMsg);
      }, 1800);
    }
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

  const updateCurrentUserFullProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    const updated: UserProfile = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.handle !== undefined) dbUpdates.handle = updates.handle;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.college !== undefined) dbUpdates.college_name = updates.college;
    if (updates.email !== undefined) dbUpdates.email = updates.email;

    await updateProfileInDB(currentUser.id, dbUpdates);
    showToast('Profile updated successfully! ✨', 'success');
    return true;
  };

  const requestEmailChange = async (newEmail: string): Promise<{ needsVerification: boolean; error: string | null }> => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return { needsVerification: false, error: 'Please enter a valid email address.' };
    }
    if (currentUser.email && currentUser.email.toLowerCase() === cleanEmail) {
      showToast('New email is identical to your current email.', 'info');
      return { needsVerification: false, error: 'New email is identical to your current email.' };
    }

    const res = await updateUserEmail(cleanEmail);
    if (res.error) {
      showToast(res.error, 'warning');
      return res;
    }

    if (res.needsVerification) {
      showToast(`Verification email sent to ${cleanEmail}! Please confirm link in your inbox.`, 'info');
    } else {
      const updated: UserProfile = { ...currentUser, email: cleanEmail };
      setCurrentUser(updated);
      setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
      await updateProfileInDB(currentUser.id, { email: cleanEmail });
      showToast('Email updated successfully!', 'success');
    }
    return res;
  };

  const editSkillToTeach = (skillId: string, updates: Partial<UserSkillOffering>) => {
    const updatedTeach = currentUser.skillsToTeach.map(s => (s.skillId === skillId ? { ...s, ...updates } : s));
    const updatedUser = { ...currentUser, skillsToTeach: updatedTeach };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    const target = updatedTeach.find(s => s.skillId === skillId);
    if (target) {
      updateTeachingSkillInDB(skillId, {
        skill_name: target.skillName,
        category: target.category,
        level: target.level,
        years_experience: target.yearsExperience,
        hourly_rate_credits: target.hourlyRateCredits,
        hourly_rate_inr: target.hourlyRateInr,
      });
    }
    showToast('Teaching skill updated!', 'success');
  };

  const editSkillToLearn = (skillId: string, updates: Partial<UserLearningGoal>) => {
    const updatedLearn = currentUser.skillsToLearn.map(g => (g.skillId === skillId ? { ...g, ...updates } : g));
    const updatedUser = { ...currentUser, skillsToLearn: updatedLearn };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    const target = updatedLearn.find(g => g.skillId === skillId);
    if (target) {
      updateLearningGoalInDB(skillId, {
        skill_name: target.skillName,
        target_level: target.targetLevel,
        urgency: target.urgency,
        progress_percent: target.progressPercent,
      });
    }
    showToast('Learning goal updated!', 'success');
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

  const updateLearningGoalProgress = (skillId: string, progressPercent: number) => {
    const updatedLearn = currentUser.skillsToLearn.map(g =>
      g.skillId === skillId ? { ...g, progressPercent } : g
    );
    const updatedUser = { ...currentUser, skillsToLearn: updatedLearn };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    updateLearningGoalProgressInDB(skillId, progressPercent);
    showToast(`Learning goal progress updated to ${progressPercent}%! 📈`, 'success');
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
      } catch { }
    }
  }, [currentUser.id]);

  const saveProposalsToStorage = (list: BarterSwapProposal[]) => {
    setSwapProposals(list);
    if (typeof window !== 'undefined' && currentUser.id) {
      try {
        localStorage.setItem(`skillxchange_proposals_${currentUser.id}`, JSON.stringify(list));
      } catch { }
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
        } catch { }
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
        } catch { }
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

      if (mastery >= 70) {
        const rewardCredit = 1.0;
        const newBalance = Number((currentUser.creditsBalance + rewardCredit).toFixed(1));
        setCurrentUser(prev => ({
          ...prev,
          creditsBalance: newBalance,
          totalCreditsEarned: prev.totalCreditsEarned + rewardCredit,
        }));
        const newTxn: LedgerTransaction = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          desc: `Micro-Quiz Mastery Reward: ${proof.skillName}`,
          delta: +rewardCredit,
          balance: newBalance,
        };
        setTransactions(prev => [newTxn, ...prev]);
        recordCreditTransactionInDB(
          currentUser.id,
          `Micro-Quiz Mastery Reward: ${proof.skillName}`,
          +rewardCredit,
          newBalance
        );
        showToast(`Micro-Quiz Verified! ${mastery}% scored. +1.0 CR reward added to wallet! 📜✨`, 'success');
      } else {
        showToast(`Micro-Quiz submitted with ${mastery}%. Minimum 70% required for credit reward.`, 'info');
      }

      return { score, total, passed: mastery >= 66 };
    }
    return { score: 0, total: 3, passed: false };
  };

  // Dynamic Credit Transfer & Transaction Log
  const transferCredits = async (toUserId: string, amount: number, reason: string) => {
    if (!toUserId || toUserId === currentUser.id) {
      showToast('Cannot transfer credits to yourself.', 'warning');
      return;
    }

    if (currentUser.creditsBalance < amount) {
      showToast(`Insufficient balance! (Available: ${currentUser.creditsBalance.toFixed(1)} CR)`, 'warning');
      return;
    }

    const newBalance = Number((currentUser.creditsBalance - amount).toFixed(1));
    const recipientUser = allUsers.find(u => u.id === toUserId);
    const recipientNewBalance = recipientUser ? Number((recipientUser.creditsBalance + amount).toFixed(1)) : amount;

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, creditsBalance: newBalance, totalCreditsSpent: u.totalCreditsSpent + amount };
        }
        if (u.id === toUserId) {
          return { ...u, creditsBalance: recipientNewBalance, totalCreditsEarned: u.totalCreditsEarned + amount };
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

    // Backend sync: Attempt atomic Postgres RPC first
    const atomicRes = await transferCreditsAtomicInDB(toUserId, amount, reason);
    if (!atomicRes.success) {
      recordCreditTransactionInDB(
        currentUser.id,
        `Transfer to ${recipientUser?.name || 'peer'}: ${reason}`,
        -amount,
        newBalance
      );

      if (toUserId) {
        recordCreditTransactionInDB(
          toUserId,
          `Received from ${currentUser.name}: ${reason}`,
          +amount,
          recipientNewBalance
        );
      }
    }

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
    if (budgetCredits > 0) {
      if (currentUser.creditsBalance < budgetCredits) {
        showToast(`Insufficient barter credits for bounty budget! (Available: ${currentUser.creditsBalance.toFixed(1)} CR)`, 'warning');
        return;
      }
      const newBalance = Number((currentUser.creditsBalance - budgetCredits).toFixed(1));
      setCurrentUser(prev => ({
        ...prev,
        creditsBalance: newBalance,
        totalCreditsSpent: prev.totalCreditsSpent + budgetCredits,
      }));
      const newTxn: LedgerTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        desc: `Escrow Lock for Bounty: ${title}`,
        delta: -budgetCredits,
        balance: newBalance,
      };
      setTransactions(prev => [newTxn, ...prev]);
      recordCreditTransactionInDB(
        currentUser.id,
        `Escrow Lock for Bounty: ${title}`,
        -budgetCredits,
        newBalance
      );
    }

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
    showToast(`Cross-Skill Fusion matched: "${fusion?.title}". Invite sent to mentor! ✨`, 'success');
  };

  const createFusionSession = (fusion: Omit<FusionSessionOption, 'id'>) => {
    const newFusion: FusionSessionOption = {
      ...fusion,
      id: `fusion-${Date.now()}`,
    };
    setFusionOptions(prev => [newFusion, ...prev]);
    showToast(`Hybrid Fusion "${newFusion.title}" published! 🚀`, 'success');
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

  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'date'>) => {
    const newEntry: NotebookEntry = {
      ...entry,
      id: `note-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setNotebookEntries(prev => [newEntry, ...prev]);
    saveNotebookEntryToDB(newEntry, currentUser.id);
    showToast(`Note "${newEntry.title}" saved to your Second-Brain wiki! 📚`, 'success');
  };

  const deleteNotebookEntry = (id: string) => {
    setNotebookEntries(prev => prev.filter(n => n.id !== id));
    deleteNotebookEntryFromDB(id);
    showToast('Note removed from Second-Brain wiki.', 'info');
  };

  // Credential Ledger SHA-256 Block Minting
  const generateNewCredentialBlock = async (learnerName: string, learnerId: string, skillName: string, scorePct: number) => {
    const lastBlock = credentialLedger[credentialLedger.length - 1];
    const newIndex = lastBlock ? lastBlock.blockIndex + 1 : 1;
    const prevHash = lastBlock ? lastBlock.blockHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();

    const dataPayload = `${newIndex}|${learnerId}|${currentUser.id}|${skillName}|${scorePct}|${timestamp}|${prevHash}`;
    const blockHash = await computeSha256(dataPayload);

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
      timestamp,
      previousHash: prevHash,
      blockHash,
      digitalSignature: `SIG_SHA256_ED25519_${blockHash.slice(0, 24)}`,
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

  const releaseEscrow = async () => {
    if (!activeSession) return;
    if (activeSession.escrowStatus === 'learner_confirmed_released') {
      showToast('Escrow has already been released for this session.', 'info');
      return;
    }

    setActiveSession(prev => (prev ? { ...prev, escrowStatus: 'learner_confirmed_released' } : null));
    const isTeacher = currentUser.name === activeSession.teacherName;
    if (isTeacher) {
      const reward = 1.4;
      const newBalance = Number((currentUser.creditsBalance + reward).toFixed(1));
      setCurrentUser(prev => ({
        ...prev,
        creditsBalance: newBalance,
        totalCreditsEarned: prev.totalCreditsEarned + reward,
      }));
      const newTxn: LedgerTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        desc: `Escrow Settlement: ${activeSession.title}`,
        delta: +reward,
        balance: newBalance,
      };
      setTransactions(prev => [newTxn, ...prev]);

      const atomicRes = await releaseEscrowAtomicInDB(currentUser.id, reward, activeSession.title);
      if (!atomicRes.success) {
        recordCreditTransactionInDB(
          currentUser.id,
          `Escrow Settlement: ${activeSession.title}`,
          +reward,
          newBalance
        );
      }
    }
    showToast('Escrow released! 1.4 Credits transferred to teacher wallet.', 'success');
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
        updateCurrentUserFullProfile,
        requestEmailChange,
        skills,
        addSkillToTeach,
        editSkillToTeach,
        removeSkillToTeach,
        addSkillToLearn,
        editSkillToLearn,
        removeSkillToLearn,
        updateLearningGoalProgress,
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
        createFusionSession,
        notebookEntries,
        searchQueryNotebook,
        setSearchQueryNotebook,
        filteredNotebookEntries,
        addNotebookEntry,
        deleteNotebookEntry,
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
        sendPeerTyping,
        clearPeerChat,
        isAuthenticated,
        isAuthLoading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginUser,
        loginAsDemoUser,
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