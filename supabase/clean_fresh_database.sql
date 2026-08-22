-- ============================================================================
-- SkillXchange Clean Database Reset & 100% Dynamic Production Schema
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR FOR A 100% FRESH DATABASE (0 DUMMY DATA)
-- ============================================================================

-- 1. Drop existing tables if any
DROP TABLE IF EXISTS public.activity_notifications CASCADE;
DROP TABLE IF EXISTS public.peer_chat_messages CASCADE;
DROP TABLE IF EXISTS public.credential_ledger CASCADE;
DROP TABLE IF EXISTS public.second_brain_notebook CASCADE;
DROP TABLE IF EXISTS public.bounty_bids CASCADE;
DROP TABLE IF EXISTS public.skill_bounties CASCADE;
DROP TABLE IF EXISTS public.skill_chains CASCADE;
DROP TABLE IF EXISTS public.user_skills_learning CASCADE;
DROP TABLE IF EXISTS public.user_skills_teaching CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Profiles Table (Real Registered Users, Trust Scores, Ratings & Streaks)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    avatar TEXT NOT NULL,
    bio TEXT,
    headline TEXT,
    college_id TEXT,
    college_name TEXT,
    college_badge TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    trust_score INTEGER DEFAULT 90,
    total_reviews INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 1,
    hourly_rate_inr NUMERIC(10, 2) DEFAULT 500.00,
    hourly_rate_credits NUMERIC(6, 2) DEFAULT 1.00,
    credit_balance NUMERIC(8, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dynamic Skills Directory (Populated directly from user offerings)
CREATE TABLE public.skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'General',
    subcategory TEXT,
    description TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    tags TEXT[] DEFAULT '{}',
    demand_multiplier NUMERIC(4, 2) DEFAULT 1.00,
    active_teachers INTEGER DEFAULT 0,
    active_learners INTEGER DEFAULT 0,
    market_rate_credits NUMERIC(6, 2) DEFAULT 1.00,
    market_rate_inr NUMERIC(10, 2) DEFAULT 500.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Teaching Skills (What real users offer)
CREATE TABLE public.user_skills_teaching (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    level TEXT NOT NULL DEFAULT 'Intermediate',
    years_experience INTEGER DEFAULT 1,
    verified BOOLEAN DEFAULT TRUE,
    hourly_rate_credits NUMERIC(6, 2) DEFAULT 1.00,
    hourly_rate_inr NUMERIC(10, 2) DEFAULT 500.00,
    proof_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Learning Goals (What real users want to learn)
CREATE TABLE public.user_skills_learning (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    target_level TEXT NOT NULL DEFAULT 'Intermediate',
    urgency TEXT DEFAULT 'flexible',
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 3-Way Skill Chains
CREATE TABLE public.skill_chains (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    loop_users JSONB NOT NULL,
    status TEXT DEFAULT 'formed',
    efficiency_score INTEGER DEFAULT 95,
    escrow_credits NUMERIC(6, 2) DEFAULT 3.00,
    cycle_time_mins INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reverse Skill Bounties
CREATE TABLE public.skill_bounties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    learner_id TEXT NOT NULL,
    learner_name TEXT NOT NULL,
    learner_avatar TEXT NOT NULL,
    title TEXT NOT NULL,
    target_skill TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_credits NUMERIC(6, 2) NOT NULL,
    budget_inr NUMERIC(10, 2) NOT NULL,
    deadline_weeks INTEGER NOT NULL,
    status TEXT DEFAULT 'open',
    bids_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Bounty Bids
CREATE TABLE public.bounty_bids (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    bounty_id TEXT NOT NULL REFERENCES public.skill_bounties(id) ON DELETE CASCADE,
    teacher_id TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    teacher_avatar TEXT NOT NULL,
    proposed_curriculum TEXT NOT NULL,
    estimated_sessions INTEGER NOT NULL,
    bid_price_credits NUMERIC(6, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Second Brain Notebook (Auto-indexed live transcripts & notes)
CREATE TABLE public.second_brain_notebook (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    title TEXT NOT NULL,
    markdown_content TEXT NOT NULL,
    flashcards JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Credential Ledger (Cryptographic SHA-256 Certificates)
CREATE TABLE public.credential_ledger (
    block_index INTEGER PRIMARY KEY,
    block_id TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    learner_id TEXT NOT NULL,
    learner_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    score_percentage INTEGER NOT NULL,
    sha256_hash TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    signature_authority TEXT DEFAULT 'SkillXchange Ledger Verifier'
);

-- 12. Peer Chat Messages (Real-Time Synchronized)
CREATE TABLE public.peer_chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- 13. Activity Notifications
CREATE TABLE public.activity_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'match',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Enable Row Level Security (RLS) with open policies for prototype
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_teaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_notifications ENABLE ROW LEVEL SECURITY;

-- Allow Public Access Policies (for seamless auth & barter demo)
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public skills are readable by everyone" ON public.skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Teaching skills accessible" ON public.user_skills_teaching FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Learning skills accessible" ON public.user_skills_learning FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Skill chains accessible" ON public.skill_chains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Bounties accessible" ON public.skill_bounties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Bids accessible" ON public.bounty_bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Notebook entries accessible" ON public.second_brain_notebook FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Credential ledger public" ON public.credential_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Chat messages accessible" ON public.peer_chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Notifications accessible" ON public.activity_notifications FOR ALL USING (true) WITH CHECK (true);
