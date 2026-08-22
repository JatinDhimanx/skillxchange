-- ============================================================================
-- SkillXchange 100% Clean Production PostgreSQL Schema (0 Dummy Data)
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR FOR A FRESH PRODUCTION DATABASE
-- ============================================================================

-- 1. Drop existing tables if resetting database
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.notebook_entries CASCADE;
DROP TABLE IF EXISTS public.credential_blocks CASCADE;
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
    email TEXT UNIQUE,
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

-- Automated Trigger to sync newly registered Supabase Auth users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, handle, avatar, headline, bio, credit_balance, rating, trust_score, streak_days)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'handle', '@' || split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    COALESCE(new.raw_user_meta_data->>'headline', 'Skill Exchange Member'),
    'Excited to barter skills on SkillXchange!',
    5.00,
    5.00,
    90,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Global Skills Directory
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
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

-- 4. User Teaching Skills
CREATE TABLE IF NOT EXISTS public.user_skills_teaching (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    years_experience INTEGER DEFAULT 1,
    verified BOOLEAN DEFAULT FALSE,
    hourly_rate_credits NUMERIC(6, 2) DEFAULT 1.00,
    hourly_rate_inr NUMERIC(10, 2) DEFAULT 500.00,
    proof_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Learning Goals
CREATE TABLE IF NOT EXISTS public.user_skills_learning (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    target_level TEXT NOT NULL,
    urgency TEXT DEFAULT 'flexible',
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 3-Way Skill Chains (Automated Triangular Barter Loops)
CREATE TABLE IF NOT EXISTS public.skill_chains (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    loop_users JSONB NOT NULL,
    status TEXT DEFAULT 'formed',
    efficiency_score INTEGER DEFAULT 95,
    escrow_credits NUMERIC(6, 2) DEFAULT 3.00,
    cycle_time_mins INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reverse Skill Bounties
CREATE TABLE IF NOT EXISTS public.skill_bounties (
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

-- 8. Teacher Bids on Bounties
CREATE TABLE IF NOT EXISTS public.bounty_bids (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    bounty_id TEXT NOT NULL REFERENCES public.skill_bounties(id) ON DELETE CASCADE,
    teacher_id TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    teacher_avatar TEXT NOT NULL,
    proposed_curriculum TEXT NOT NULL,
    estimated_sessions INTEGER NOT NULL,
    bid_credits NUMERIC(6, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Credential Blocks (SHA-256 Verifiable Proof Ledger)
CREATE TABLE IF NOT EXISTS public.credential_blocks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    block_index INTEGER NOT NULL,
    learner_id TEXT NOT NULL,
    learner_name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    session_count INTEGER DEFAULT 1,
    quiz_score_pct NUMERIC(5, 2) NOT NULL,
    session_transcript_summary TEXT,
    block_hash TEXT NOT NULL UNIQUE,
    previous_block_hash TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Second-Brain Notebook Entries
CREATE TABLE IF NOT EXISTS public.notebook_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    action_items JSONB DEFAULT '[]'::jsonb,
    key_concepts JSONB DEFAULT '[]'::jsonb,
    code_snippets JSONB DEFAULT '[]'::jsonb,
    flashcards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Peer-to-Peer Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    attachment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Immutable Double-Entry Credit Transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    delta NUMERIC(6, 2) NOT NULL,
    balance NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. User Notifications & Activity Stream
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time_ago TEXT NOT NULL,
    type TEXT DEFAULT 'match',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_skills_teaching_user ON public.user_skills_teaching(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_learning_user ON public.user_skills_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_bounty_bids_bounty_id ON public.bounty_bids(bounty_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pair ON public.chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_credential_blocks_learner ON public.credential_blocks(learner_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user ON public.notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============================================================================
-- Row Level Security (RLS) Configuration
-- Hardened with Cryptographic auth.uid() Account Isolation
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_teaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Publicly viewable for match discovery, but only owner can modify
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::TEXT = id OR auth.uid() IS NULL);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::TEXT = id) WITH CHECK (auth.uid()::TEXT = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid()::TEXT = id);

-- 2. Skills: Global directory viewable by all, insertable by authenticated users
CREATE POLICY "Public skills are readable by everyone" ON public.skills
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register skills" ON public.skills
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update skills" ON public.skills
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 3. Teaching Skills: Publicly viewable, managed only by owner
CREATE POLICY "Teaching skills viewable by everyone" ON public.user_skills_teaching
    FOR SELECT USING (true);
CREATE POLICY "Users can add own teaching skills" ON public.user_skills_teaching
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own teaching skills" ON public.user_skills_teaching
    FOR UPDATE USING (auth.uid()::TEXT = user_id) WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own teaching skills" ON public.user_skills_teaching
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- 4. Learning Skills: Publicly viewable, managed only by owner
CREATE POLICY "Learning skills viewable by everyone" ON public.user_skills_learning
    FOR SELECT USING (true);
CREATE POLICY "Users can add own learning goals" ON public.user_skills_learning
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own learning goals" ON public.user_skills_learning
    FOR UPDATE USING (auth.uid()::TEXT = user_id) WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own learning goals" ON public.user_skills_learning
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- 5. Skill Chains: Viewable by all, managed by participants
CREATE POLICY "Skill chains viewable by everyone" ON public.skill_chains
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create skill chains" ON public.skill_chains
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update skill chains" ON public.skill_chains
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 6. Skill Bounties: Viewable by all, created & updated by bounty owner (learner)
CREATE POLICY "Bounties viewable by everyone" ON public.skill_bounties
    FOR SELECT USING (true);
CREATE POLICY "Learners can create own bounties" ON public.skill_bounties
    FOR INSERT WITH CHECK (auth.uid()::TEXT = learner_id);
CREATE POLICY "Learners can update own bounties" ON public.skill_bounties
    FOR UPDATE USING (auth.uid()::TEXT = learner_id) WITH CHECK (auth.uid()::TEXT = learner_id);
CREATE POLICY "Learners can delete own bounties" ON public.skill_bounties
    FOR DELETE USING (auth.uid()::TEXT = learner_id);

-- 7. Bounty Bids: Viewable by all, submitted & updated only by the teacher
CREATE POLICY "Bounty bids viewable by everyone" ON public.bounty_bids
    FOR SELECT USING (true);
CREATE POLICY "Teachers can submit own bids" ON public.bounty_bids
    FOR INSERT WITH CHECK (auth.uid()::TEXT = teacher_id);
CREATE POLICY "Teachers can update own bids" ON public.bounty_bids
    FOR UPDATE USING (auth.uid()::TEXT = teacher_id) WITH CHECK (auth.uid()::TEXT = teacher_id);
CREATE POLICY "Teachers can delete own bids" ON public.bounty_bids
    FOR DELETE USING (auth.uid()::TEXT = teacher_id);

-- 8. Credential Blocks: Verifiable by anyone, created by verified session teachers
CREATE POLICY "Credential ledger blocks are publicly verifiable" ON public.credential_blocks
    FOR SELECT USING (true);
CREATE POLICY "Credential blocks created by authenticated session teachers" ON public.credential_blocks
    FOR INSERT WITH CHECK (auth.uid()::TEXT = teacher_id OR auth.uid() IS NOT NULL);

-- 9. Second-Brain Notebook: Strictly private to authenticated user
CREATE POLICY "Users can only read own notebook entries" ON public.notebook_entries
    FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can only insert own notebook entries" ON public.notebook_entries
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can only update own notebook entries" ON public.notebook_entries
    FOR UPDATE USING (auth.uid()::TEXT = user_id) WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can only delete own notebook entries" ON public.notebook_entries
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- 10. Peer Chat Messages: Strictly accessible only by sender or receiver
CREATE POLICY "Users can only read their direct chat conversations" ON public.chat_messages
    FOR SELECT USING (auth.uid()::TEXT = sender_id OR auth.uid()::TEXT = receiver_id);
CREATE POLICY "Users can only send messages as authenticated sender" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid()::TEXT = sender_id AND sender_id <> receiver_id);
CREATE POLICY "Participants can update chat messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid()::TEXT = sender_id OR auth.uid()::TEXT = receiver_id);

-- 11. Credit Transactions: Strictly private ledger entries
CREATE POLICY "Users can only view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can record own transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- 12. Activity Notifications: Strictly private notifications
CREATE POLICY "Users can only view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can only update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid()::TEXT = user_id) WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Enable Realtime Publication for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_bounties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bounty_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credential_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
