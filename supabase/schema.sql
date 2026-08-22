-- ============================================================================
-- SkillXchange Production Supabase PostgreSQL Schema
-- Section 60.1 - 60.5 Hybrid Architecture & Real-Time Sync
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Users, Trust Scores, Ratings & Streaks)
CREATE TABLE IF NOT EXISTS public.profiles (
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
    streak_days INTEGER DEFAULT 0,
    hourly_rate_inr NUMERIC(10, 2) DEFAULT 0,
    hourly_rate_credits NUMERIC(6, 2) DEFAULT 1.00,
    credit_balance NUMERIC(8, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- (Permissive for Hackathon Demo & Multi-Persona Simulation)
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

-- Allow read & write for public demo access
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public insert skills" ON public.skills FOR ALL USING (true);

CREATE POLICY "Allow public user_skills_teaching" ON public.user_skills_teaching FOR ALL USING (true);
CREATE POLICY "Allow public user_skills_learning" ON public.user_skills_learning FOR ALL USING (true);
CREATE POLICY "Allow public skill_chains" ON public.skill_chains FOR ALL USING (true);
CREATE POLICY "Allow public skill_bounties" ON public.skill_bounties FOR ALL USING (true);
CREATE POLICY "Allow public bounty_bids" ON public.bounty_bids FOR ALL USING (true);
CREATE POLICY "Allow public credential_blocks" ON public.credential_blocks FOR ALL USING (true);
CREATE POLICY "Allow public notebook_entries" ON public.notebook_entries FOR ALL USING (true);
CREATE POLICY "Allow public chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Allow public credit_transactions" ON public.credit_transactions FOR ALL USING (true);
CREATE POLICY "Allow public notifications" ON public.notifications FOR ALL USING (true);

-- Enable Realtime Publication for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_bounties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bounty_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credential_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- Initial Seed Data
-- ============================================================================
INSERT INTO public.profiles (id, name, handle, avatar, headline, bio, rating, trust_score, streak_days, hourly_rate_inr, hourly_rate_credits, credit_balance)
VALUES
    ('user-1', 'Alex Rivera', '@alexr', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'CS Grad & Full-Stack AI Engineer', 'Passionate about machine learning vector embeddings, Python high-performance libraries, and teaching backend architecture.', 4.95, 98, 14, 1200, 1.4, 8.5),
    ('user-2', 'Maya Chen', '@mayac', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Fingerstyle Guitarist & Polyglot', 'Performing musician with 8+ years teaching Travis picking acoustic guitar and conversational Spanish.', 4.98, 99, 21, 1500, 1.5, 12.0),
    ('user-3', 'David Kim', '@davidk', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Senior Product Designer at Fintech', 'Design systems lead specializing in Figma tokens, accessibility, and micro-interactions.', 4.88, 94, 7, 1000, 1.2, 4.0),
    ('user-4', 'Sophia Patel', '@sophiap', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Product Director & Startup Advisor', 'Ex-YC founder helping engineers transition into high-impact product leadership and roadmapping.', 4.92, 97, 18, 1800, 1.8, 15.5),
    ('user-5', 'Kenji Sato', '@kenjis', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Tokyo Tech Alum & Creative Coder', 'Interactive GLSL shader artist and native Japanese language instructor.', 4.90, 96, 9, 1400, 1.6, 6.2)
ON CONFLICT (id) DO NOTHING;

-- Initial Skills Directory
INSERT INTO public.skills (id, name, category, description, difficulty, tags, demand_multiplier, active_teachers, active_learners, market_rate_credits, market_rate_inr)
VALUES
    ('skill-1', 'Python for Data Science', 'Programming', 'NumPy vectorization, Pandas indexing, array memory buffers, and ML pipelines.', 'Intermediate', ARRAY['python', 'data-science', 'numpy', 'pandas'], 2.4, 48, 115, 1.4, 1200),
    ('skill-2', 'Acoustic Guitar (Travis Picking)', 'Arts & Music', 'Alternating steady bass thumb patterns combined with syncopated fingerstyle melody.', 'Intermediate', ARRAY['guitar', 'fingerstyle', 'music-theory'], 1.0, 19, 21, 1.0, 800),
    ('skill-3', 'UI/UX & Figma Tokens', 'Design', 'Auto-layout design systems, responsive atomic typography, and component variants.', 'Intermediate', ARRAY['figma', 'ui-ux', 'design-systems'], 2.1, 28, 59, 1.2, 1000),
    ('skill-4', 'GLSL & WebGL Shaders', 'Creative Coding', 'Raymarching 3D signed distance fields and GPU fragment shader mathematics.', 'Advanced', ARRAY['glsl', 'webgl', 'threejs', 'graphics'], 2.8, 8, 23, 2.0, 1800),
    ('skill-5', 'Conversational Japanese', 'Languages', 'JLPT N4/N3 practical grammar, Kanji radicals, and Tokyo dialect business etiquette.', 'Elementary', ARRAY['japanese', 'jlpt', 'languages'], 1.6, 24, 39, 1.1, 900)
ON CONFLICT (id) DO NOTHING;

-- Initial Teaching Skills
INSERT INTO public.user_skills_teaching (user_id, skill_name, category, level, years_experience, verified, hourly_rate_credits, hourly_rate_inr, proof_count)
VALUES
    ('user-1', 'Python for Data Science', 'Programming', 'Advanced', 4, TRUE, 1.4, 1200, 14),
    ('user-2', 'Acoustic Guitar (Travis Picking)', 'Arts & Music', 'Expert', 8, TRUE, 1.5, 1500, 26),
    ('user-2', 'Conversational Spanish', 'Languages', 'Advanced', 5, TRUE, 1.2, 1000, 18),
    ('user-3', 'UI/UX & Figma Tokens', 'Design', 'Expert', 6, TRUE, 1.2, 1000, 12),
    ('user-5', 'GLSL & WebGL Shaders', 'Creative Coding', 'Expert', 5, TRUE, 2.0, 1800, 9)
ON CONFLICT DO NOTHING;

-- Initial Learning Goals
INSERT INTO public.user_skills_learning (user_id, skill_name, target_level, urgency, progress_percent)
VALUES
    ('user-1', 'Acoustic Guitar (Travis Picking)', 'Intermediate', 'flexible', 45),
    ('user-1', 'UI/UX & Figma Tokens', 'Intermediate', 'career_switch', 60),
    ('user-2', 'Python for Data Science', 'Intermediate', 'exam_prep', 30),
    ('user-3', 'Python for Data Science', 'Intermediate', 'flexible', 20),
    ('user-5', 'UI/UX & Figma Tokens', 'Advanced', 'flexible', 75)
ON CONFLICT DO NOTHING;

-- Initial Credential Blocks
INSERT INTO public.credential_blocks (block_index, learner_id, learner_name, teacher_id, teacher_name, skill_name, session_count, quiz_score_pct, session_transcript_summary, block_hash, previous_block_hash, timestamp)
VALUES
    (1, 'user-1', 'Alex Rivera', 'user-2', 'Maya Chen', 'Acoustic Guitar (Travis Picking)', 3, 100.0, 'Mastered steady alternating thumb bass pattern on strings 6, 5, 4 combined with syncopated index melody on fretboard.', '0000a89f28d8b4c2e64119d8543f01948834927f884102948712398471298374', '0000000000000000000000000000000000000000000000000000000000000000', '2026-08-20 14:32:00'),
    (2, 'user-2', 'Maya Chen', 'user-1', 'Alex Rivera', 'Python for Data Science', 2, 95.0, 'Successfully vectorized standard Python loops into contiguous NumPy array buffers with 42x throughput speedup.', '0000c71e9841bca4920491823749817294817294871298374192837491823749', '0000a89f28d8b4c2e64119d8543f01948834927f884102948712398471298374', '2026-08-21 16:15:00')
ON CONFLICT (block_hash) DO NOTHING;

-- Initial Bounties
INSERT INTO public.skill_bounties (id, learner_id, learner_name, learner_avatar, title, target_skill, category, description, budget_credits, budget_inr, deadline_weeks, status, bids_count)
VALUES
    ('bounty-1', 'user-1', 'Alex Rivera', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Master Raymarching GLSL Shaders for Creative Portfolio', 'GLSL & WebGL Shaders', 'Programming', 'Looking for an experienced shader artist to teach signed distance functions and raymarching camera matrices over 4 weeks.', 8.0, 6000.0, 4, 'open', 3),
    ('bounty-2', 'user-2', 'Maya Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Advanced PyTorch Transformer Fine-Tuning', 'Machine Learning', 'AI/ML', 'Need structured pair programming sessions on LoRA adapters and attention masking for audio classification.', 10.0, 8000.0, 3, 'open', 2)
ON CONFLICT (id) DO NOTHING;

-- Initial Chat Messages
INSERT INTO public.chat_messages (sender_id, receiver_id, sender_name, sender_avatar, text, timestamp, is_read)
VALUES
    ('user-2', 'user-1', 'Maya Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Hi Alex! I saw your profile offers Python & Machine Learning. Would you be open to exchanging with my Acoustic Guitar & Spanish classes?', '10:15 AM', TRUE),
    ('user-1', 'user-2', 'Alex Rivera', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Hey Maya! Absolutely, I''ve been wanting to learn Travis Picking fingerstyle. Are you free for a 1-hour session this week?', '10:18 AM', TRUE),
    ('user-2', 'user-1', 'Maya Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Yes! Tuesday or Thursday evening works best for me. We can enter the Live Study Room whenever you are ready!', '10:20 AM', TRUE)
ON CONFLICT DO NOTHING;
