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
} from '../types';

// Zero fake users: All real users load dynamically from Supabase database
export const USERS: UserProfile[] = [];

// Base initial taxonomy categories (loaded dynamically from database)
export const INITIAL_SKILLS: Skill[] = [
  {
    id: 'skill-python',
    name: 'Python & AI Engineering',
    category: 'Programming',
    subcategory: 'Data Science',
    description: 'Pandas, NumPy, Scikit-learn, automation scripts, and statistical computing.',
    difficulty: 'Intermediate',
    tags: ['Python', 'AI', 'Data Science', 'Analytics'],
    demandMultiplier: 1.4,
    activeTeachers: 0,
    activeLearners: 0,
    marketRateCredits: 1.4,
    marketRateInr: 450,
  },
  {
    id: 'skill-react',
    name: 'React & Next.js Fullstack',
    category: 'Programming',
    subcategory: 'Web Development',
    description: 'Modern React hooks, server components, Tailwind CSS, TypeScript and state.',
    difficulty: 'Advanced',
    tags: ['React', 'Next.js', 'Frontend', 'TypeScript'],
    demandMultiplier: 1.2,
    activeTeachers: 0,
    activeLearners: 0,
    marketRateCredits: 1.2,
    marketRateInr: 400,
  },
  {
    id: 'skill-guitar',
    name: 'Acoustic Guitar & Fingerstyle',
    category: 'Arts & Music',
    subcategory: 'Music',
    description: 'Chords, rhythm patterns, ear training, fingerstyle arrangements, and live tabs.',
    difficulty: 'Beginner',
    tags: ['Music', 'Guitar', 'Fingerstyle', 'Acoustic'],
    demandMultiplier: 1.0,
    activeTeachers: 0,
    activeLearners: 0,
    marketRateCredits: 1.0,
    marketRateInr: 300,
  },
  {
    id: 'skill-uiux',
    name: 'UI/UX Design Systems & Figma',
    category: 'Design & Creative',
    subcategory: 'Product Design',
    description: 'Component architecture, responsive tokens, usability testing, micro-interactions.',
    difficulty: 'Advanced',
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    demandMultiplier: 1.3,
    activeTeachers: 0,
    activeLearners: 0,
    marketRateCredits: 1.3,
    marketRateInr: 450,
  }
];

export const CHAINS: SkillChain[] = [];
export const SEED_SKILL_CHAINS: SkillChain[] = [];
export const INITIAL_COMMITMENTS: FutureCommitment[] = [];
export const SEED_FUTURE_COMMITMENTS: FutureCommitment[] = [];
export const TRANSCRIPT_PROOFS: SessionTranscriptProof[] = [];
export const SEED_TRANSCRIPT_PROOFS: SessionTranscriptProof[] = [];
export const DYNAMIC_RATES: DynamicSkillRate[] = [
  {
    skillId: 'skill-python',
    skillName: 'Python & AI Engineering',
    category: 'Programming',
    supplyCount: 4,
    demandCount: 28,
    multiplier: 1.4,
    creditPerHour: 1.4,
    inrPerHour: 450,
    trend: 'up',
    change24h: 8.5,
    tier: 'High Demand & Rare',
  },
  {
    skillId: 'skill-react',
    skillName: 'React & Next.js Fullstack',
    category: 'Programming',
    supplyCount: 8,
    demandCount: 22,
    multiplier: 1.2,
    creditPerHour: 1.2,
    inrPerHour: 400,
    trend: 'up',
    change24h: 4.2,
    tier: 'Balanced Growth',
  },
  {
    skillId: 'skill-guitar',
    skillName: 'Acoustic Guitar & Fingerstyle',
    category: 'Arts & Music',
    supplyCount: 6,
    demandCount: 6,
    multiplier: 1.0,
    creditPerHour: 1.0,
    inrPerHour: 300,
    trend: 'stable',
    change24h: 0.0,
    tier: 'Balanced Growth',
  },
];

export const INITIAL_BOUNTIES: SkillBounty[] = [];
export const SEED_BOUNTIES: SkillBounty[] = [];
export const FUSION_OPTIONS: FusionSessionOption[] = [];
export const SEED_FUSION_OPTIONS: FusionSessionOption[] = [];
export const PREDICTIVE_MATCHES: PredictiveMatch[] = [];
export const SEED_PREDICTIVE_MATCHES: PredictiveMatch[] = [];
export const INITIAL_NOTEBOOK_ENTRIES: NotebookEntry[] = [];
export const SEED_NOTEBOOK_ENTRIES: NotebookEntry[] = [];
export const INITIAL_CREDENTIALS: CredentialBlock[] = [];
export const SEED_CREDENTIAL_LEDGER: CredentialBlock[] = [];
