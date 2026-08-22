export type SkillLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';

export type LearningMode = 'direct_exchange' | 'credit_exchange' | 'paid_learning';

export type ExchangeStatus = 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export type MatchQuality = 'perfect' | 'good' | 'possible';

export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  difficulty: SkillLevel;
  tags: string[];
  demandMultiplier: number; // Dynamic economy (Section 60.3)
  activeTeachers: number;
  activeLearners: number;
  marketRateCredits: number;
  marketRateInr: number;
}

export interface UserSkillOffering {
  skillId: string;
  skillName: string;
  category: string;
  level: SkillLevel;
  yearsExperience: number;
  verified: boolean;
  verificationBadge?: string;
  hourlyRateInr?: number; // for paid fallback
  hourlyRateCredits?: number;
  proofCount?: number;
}

export interface UserLearningGoal {
  skillId: string;
  skillName: string;
  targetLevel: SkillLevel;
  urgency: 'flexible' | 'urgent' | 'exam_prep' | 'career_switch';
  targetDateWeeks?: number;
  currentRoadmapStep?: number;
  totalRoadmapSteps?: number;
  progressPercent?: number;
}

export interface TrustScoreBreakdown {
  identityVerified: boolean;
  skillVerifiedCount: number;
  completedSessions: number;
  attendanceRate: number; // %
  averageRating: number; // out of 5
  cancellationRate: number; // %
  responseRate: number; // %
  accountAgeMonths: number;
  overallScore: number; // 0-100
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  headline: string;
  bio: string;
  location: string;
  timezone: string;
  college?: string;
  collegeVerified: boolean;
  languages: string[];
  skillsToTeach: UserSkillOffering[];
  skillsToLearn: UserLearningGoal[];
  creditsBalance: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  teachingHours: number;
  learningHours: number;
  trustScore: TrustScoreBreakdown;
  streakDays: number;
  xpPoints: number;
  badges: Badge[];
  role: 'user' | 'admin';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'teaching' | 'learning' | 'chain' | 'verification' | 'community';
  unlockedAt: string;
}

export interface MatchCandidate {
  user: UserProfile;
  matchScore: number; // 0-100
  quality: MatchQuality;
  reasons: string[];
  skillTeachMatch: {
    offeredByYou: string;
    wantedByThem: string;
    levelFit: string;
  };
  skillLearnMatch: {
    wantedByYou: string;
    offeredByThem: string;
    levelFit: string;
  };
  suggestedMode: LearningMode;
  paidFallbackPrice?: number;
  availabilityOverlap: string;
}

// 60.1 Skill Chain Futures Market
export interface SkillChainNode {
  userId: string;
  userName: string;
  userAvatar: string;
  teachesSkill: string;
  learnsSkill: string;
  nextUserId: string;
  sessionDurationMins: number;
}

export interface SkillChain {
  id: string;
  name: string;
  status: 'detecting' | 'proposed' | 'active' | 'completed';
  nodes: SkillChainNode[];
  totalParticipants: number;
  efficiencyScore: number; // e.g. 98%
  estimatedCompletionWeeks: number;
  isFutureChain: boolean;
  maturityDate?: string;
  daysRemaining?: number;
}

export interface FutureCommitment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  skillCurrentlyLearning: string;
  skillCommittedToTeach: string;
  commitmentDate: string;
  maturityDays: number;
  targetPrerequisiteLevel: SkillLevel;
  matchedChainId?: string;
  status: 'pending_learning' | 'ready_to_teach' | 'chain_locked' | 'fulfilled';
}

// 60.2 Verified-by-Transcript Skill Proof & Micro-Quiz
export interface SessionMicroQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  conceptTested: string;
}

export interface SessionTranscriptProof {
  id: string;
  sessionId: string;
  learnerId: string;
  learnerName: string;
  teacherId: string;
  teacherName: string;
  skillName: string;
  date: string;
  sessionSummaryNotes: string;
  conceptsTaught: string[];
  quizQuestions: SessionMicroQuizQuestion[];
  learnerScore?: number; // e.g. 3/3
  masteryPercentage?: number; // e.g. 95%
  isVerified: boolean;
  verificationBadgeUrl?: string;
}

// 60.3 Dynamic Credit Value (Skill Economy)
export interface DynamicSkillRate {
  skillId: string;
  skillName: string;
  category: string;
  supplyCount: number;
  demandCount: number;
  multiplier: number; // e.g. 1.8x
  creditPerHour: number;
  inrPerHour: number;
  trend: 'up' | 'down' | 'stable';
  change24h: number; // percentage
  tier: 'High Demand & Rare' | 'Balanced Growth' | 'Oversupplied Base';
}

// 60.5 Skill Bounty Board
export interface SkillBounty {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  skillName: string;
  category: string;
  title: string;
  description: string;
  targetLevel: SkillLevel;
  budgetCredits?: number;
  budgetInr?: number;
  deadlineWeeks: number;
  bidsCount: number;
  status: 'open' | 'awarded' | 'in_progress' | 'closed';
  createdAt: string;
  bids: BountyBid[];
}

export interface BountyBid {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRating: number;
  trustScore: number;
  proposedCurriculum: string;
  estimatedSessions: number;
  bidPriceInr?: number;
  bidPriceCredits?: number;
  createdAt: string;
}

// 60.6 Cross-Skill Fusion Sessions
export interface FusionSessionOption {
  id: string;
  title: string;
  primarySkill: string;
  secondarySkill: string;
  categoryCombo: string;
  compatibilityScore: number; // e.g. 96%
  suggestedSplitMins: string; // e.g. "30m Spanish + 30m Culinary"
  rationale: string;
  idealFor: string;
}

// 60.7 Predictive Future Match
export interface PredictiveMatch {
  id: string;
  targetTeacher: UserProfile;
  prerequisiteRoadmapWeek: number;
  skillTrack: string;
  projectedMatchScore: number; // e.g. 94%
  estimatedTimeToUnlockWeeks: number;
  aiPredictionReason: string;
}

// 60.8 Second-Brain Auto Notebook
export interface NotebookEntry {
  id: string;
  sessionId: string;
  date: string;
  skillCategory: string;
  skillName: string;
  teacherName: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  codeSnippets?: { title: string; language: string; code: string }[];
  actionItems: string[];
  tags: string[];
}

// 60.9 Teach-Verified Credential Chain (Cryptographically signed ledger)
export interface CredentialBlock {
  blockIndex: number;
  certificateId: string;
  learnerName: string;
  learnerId: string;
  teacherName: string;
  teacherId: string;
  skillName: string;
  levelEarned: SkillLevel;
  sessionCount: number;
  quizScorePct: number;
  timestamp: string;
  previousHash: string;
  blockHash: string;
  digitalSignature: string;
  verificationUrl: string;
  status: 'immutable_verified';
}

// 60.10 AI Practice Partner for Soft Skills
export interface SoftSkillPracticeMetrics {
  clarityScore: number; // 0-100
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordsDetected: { word: string; count: number }[];
  confidenceScore: number; // 0-100
  structureScore: number; // 0-100
  liveCoachingTips: string[];
}

// Live Session Room
export interface LiveSessionState {
  id: string;
  title: string;
  teacherName: string;
  learnerName: string;
  skillName: string;
  mode: LearningMode;
  priceCredits?: number;
  priceInr?: number;
  durationMins: number;
  remainingSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  whiteboardActiveTool: 'pen' | 'rect' | 'circle' | 'text' | 'eraser';
  objectives: { id: string; text: string; completed: boolean }[];
  escrowStatus: 'held_in_escrow' | 'teacher_completed' | 'learner_confirmed_released' | 'disputed';
}

// Peer Chat System
export interface PeerChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'proposal' | 'audio' | 'snippet';
  proposalData?: BarterSwapProposal;
  attachment?: {
    type: 'snippet' | 'note' | 'drill';
    title: string;
    content: string;
  };
}

export interface BarterSwapProposal {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  offeredSkill: string;
  wantedSkill: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  proposedAt: string;
  notes?: string;
  escrowCredits: number;
}

export interface ChatPeerInfo {
  id: string;
  name: string;
  avatar: string;
  skill: string;
  headline?: string;
  rating?: number;
  online?: boolean;
}

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
  proposalId?: string;
  actionUrl?: string;
}
