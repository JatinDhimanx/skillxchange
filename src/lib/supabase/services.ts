import { supabase, isSupabaseConfigured } from './client';
import {
  UserProfile,
  Skill,
  SkillBounty,
  CredentialBlock,
  NotebookEntry,
  PeerChatMessage,
  LedgerTransaction,
  ActivityNotification,
  BountyBid,
} from '../../types';

// ============================================================================
// 1. PROFILES SERVICE
// ============================================================================
export async function fetchProfilesFromDB(): Promise<UserProfile[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('rating', { ascending: false });

    if (error || !profiles) {
      console.warn('Error fetching profiles from Supabase:', error);
      return null;
    }

    const { data: teachSkills } = await supabase.from('user_skills_teaching').select('*');
    const { data: learnSkills } = await supabase.from('user_skills_learning').select('*');

    return profiles.map(p => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      avatar: p.avatar,
      headline: p.headline || '',
      bio: p.bio || '',
      location: 'Bangalore, India',
      timezone: 'IST (UTC+5:30)',
      college: p.college_name || 'BMS Institute of Technology',
      collegeVerified: true,
      languages: ['English', 'Hindi'],
      skillsToTeach: (teachSkills || [])
        .filter(t => t.user_id === p.id)
        .map(t => ({
          skillId: t.id,
          skillName: t.skill_name,
          category: t.category,
          level: t.level as any,
          yearsExperience: t.years_experience,
          verified: t.verified,
          hourlyRateCredits: Number(t.hourly_rate_credits) || 1.0,
          hourlyRateInr: Number(t.hourly_rate_inr) || 500,
          proofCount: t.proof_count || 0,
        })),
      skillsToLearn: (learnSkills || [])
        .filter(l => l.user_id === p.id)
        .map(l => ({
          skillId: l.id,
          skillName: l.skill_name,
          targetLevel: l.target_level as any,
          urgency: l.urgency || 'flexible',
          progressPercent: l.progress_percent || 0,
        })),
      creditsBalance: Number(p.credit_balance) || 8.5,
      totalCreditsEarned: 14.5,
      totalCreditsSpent: 6.0,
      teachingHours: 12,
      learningHours: 8,
      trustScore: {
        identityVerified: true,
        skillVerifiedCount: 3,
        completedSessions: 18,
        attendanceRate: 98,
        averageRating: Number(p.rating) || 5.0,
        cancellationRate: 0,
        responseRate: 96,
        accountAgeMonths: 6,
        overallScore: p.trust_score || 95,
      },
      streakDays: p.streak_days || 7,
      xpPoints: 1250,
      badges: [
        {
          id: 'b-1',
          title: 'Verified Peer',
          description: 'Identity and skill assessment passed',
          icon: 'ShieldCheck',
          category: 'verification',
          unlockedAt: '2026-08-01',
        },
      ],
      role: 'user',
    }));
  } catch (err) {
    console.warn('Profiles DB fetch exception:', err);
    return null;
  }
}

export async function updateProfileInDB(userId: string, updates: { headline?: string; bio?: string }) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function addTeachingSkillToDB(
  userId: string,
  skill: {
    id: string;
    skillName: string;
    category: string;
    level: string;
    yearsExperience: number;
    hourlyRateCredits: number;
    hourlyRateInr: number;
  }
) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('user_skills_teaching').insert({
      id: skill.id,
      user_id: userId,
      skill_name: skill.skillName,
      category: skill.category,
      level: skill.level,
      years_experience: skill.yearsExperience,
      hourly_rate_credits: skill.hourlyRateCredits,
      hourly_rate_inr: skill.hourlyRateInr,
      verified: true,
      proof_count: 1,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function removeTeachingSkillFromDB(skillId: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('user_skills_teaching').delete().eq('id', skillId);
    return !error;
  } catch {
    return false;
  }
}

export async function addLearningGoalToDB(
  userId: string,
  goal: {
    id: string;
    skillName: string;
    targetLevel: string;
    urgency: string;
  }
) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('user_skills_learning').insert({
      id: goal.id,
      user_id: userId,
      skill_name: goal.skillName,
      target_level: goal.targetLevel,
      urgency: goal.urgency,
      progress_percent: 15,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function removeLearningGoalFromDB(goalId: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('user_skills_learning').delete().eq('id', goalId);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 2. SKILLS DIRECTORY SERVICE
// ============================================================================
export async function fetchSkillsFromDB(): Promise<Skill[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('skills').select('*');
    if (error || !data) return null;
    return data.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      subcategory: s.subcategory || '',
      description: s.description || '',
      difficulty: s.difficulty || 'Intermediate',
      tags: s.tags || [],
      demandMultiplier: Number(s.demand_multiplier) || 1.0,
      activeTeachers: s.active_teachers || 0,
      activeLearners: s.active_learners || 0,
      marketRateCredits: Number(s.market_rate_credits) || 1.0,
      marketRateInr: Number(s.market_rate_inr) || 500,
    }));
  } catch {
    return null;
  }
}

// ============================================================================
// 3. SKILL BOUNTIES SERVICE
// ============================================================================
export async function fetchBountiesFromDB(): Promise<SkillBounty[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: bounties, error } = await supabase
      .from('skill_bounties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !bounties) return null;

    const { data: bids } = await supabase.from('bounty_bids').select('*');

    return bounties.map(b => ({
      id: b.id,
      learnerId: b.learner_id,
      learnerName: b.learner_name,
      learnerAvatar: b.learner_avatar,
      title: b.title,
      skillName: b.target_skill,
      category: b.category,
      description: b.description,
      targetLevel: 'Intermediate',
      budgetCredits: Number(b.budget_credits) || 8.0,
      budgetInr: Number(b.budget_inr) || 6000,
      deadlineWeeks: b.deadline_weeks || 4,
      bidsCount: b.bids_count || 0,
      status: b.status as any,
      createdAt: b.created_at || 'Just now',
      bids: (bids || [])
        .filter(bid => bid.bounty_id === b.id)
        .map(bid => ({
          id: bid.id,
          teacherId: bid.teacher_id,
          teacherName: bid.teacher_name,
          teacherAvatar: bid.teacher_avatar,
          teacherRating: 4.9,
          trustScore: 95,
          proposedCurriculum: bid.proposed_curriculum,
          estimatedSessions: bid.estimated_sessions,
          bidPriceCredits: Number(bid.bid_credits),
          bidPriceInr: Number(bid.bid_credits) * 350,
          createdAt: bid.created_at || 'Just now',
        })),
    }));
  } catch {
    return null;
  }
}

export async function createBountyInDB(bounty: SkillBounty) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('skill_bounties').insert({
      id: bounty.id,
      learner_id: bounty.learnerId,
      learner_name: bounty.learnerName,
      learner_avatar: bounty.learnerAvatar,
      title: bounty.title,
      target_skill: bounty.skillName,
      category: bounty.category,
      description: bounty.description,
      budget_credits: bounty.budgetCredits,
      budget_inr: bounty.budgetInr,
      deadline_weeks: bounty.deadlineWeeks,
      status: bounty.status,
      bids_count: 0,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function submitBountyBidToDB(
  bountyId: string,
  bid: {
    teacherId: string;
    teacherName: string;
    teacherAvatar: string;
    proposedCurriculum: string;
    estimatedSessions: number;
    bidCredits: number;
  }
) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('bounty_bids').insert({
      bounty_id: bountyId,
      teacher_id: bid.teacherId,
      teacher_name: bid.teacherName,
      teacher_avatar: bid.teacherAvatar,
      proposed_curriculum: bid.proposedCurriculum,
      estimated_sessions: bid.estimatedSessions,
      bid_credits: bid.bidCredits,
      status: 'pending',
    });
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 4. CREDENTIAL BLOCKCHAIN LEDGER SERVICE
// ============================================================================
export async function fetchCredentialLedgerFromDB(): Promise<CredentialBlock[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('credential_blocks')
      .select('*')
      .order('block_index', { ascending: true });

    if (error || !data) return null;

    return data.map(b => ({
      blockIndex: b.block_index,
      certificateId: `CERT-2026-${String(b.block_index).padStart(4, '0')}`,
      learnerName: b.learner_name,
      learnerId: b.learner_id,
      teacherName: b.teacher_name,
      teacherId: b.teacher_id,
      skillName: b.skill_name,
      levelEarned: 'Intermediate',
      sessionCount: b.session_count || 1,
      quizScorePct: Number(b.quiz_score_pct),
      timestamp: b.timestamp,
      previousHash: b.previous_block_hash || '0000000000000000',
      blockHash: b.block_hash,
      digitalSignature: `SIG_ECDSA_${b.block_hash.slice(0, 12)}`,
      verificationUrl: `https://verify.skillexchange.org/cert/CERT-2026-${String(b.block_index).padStart(4, '0')}`,
      status: 'immutable_verified',
    }));
  } catch {
    return null;
  }
}

export async function mintCredentialBlockInDB(block: CredentialBlock) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('credential_blocks').insert({
      block_index: block.blockIndex,
      learner_id: block.learnerId,
      learner_name: block.learnerName,
      teacher_id: block.teacherId,
      teacher_name: block.teacherName,
      skill_name: block.skillName,
      session_count: block.sessionCount,
      quiz_score_pct: block.quizScorePct,
      session_transcript_summary: `Verified 1-on-1 mastery on ${block.skillName}`,
      block_hash: block.blockHash,
      previous_block_hash: block.previousHash,
      timestamp: block.timestamp,
    });
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 5. SECOND-BRAIN NOTEBOOK SERVICE
// ============================================================================
export async function fetchNotebookEntriesFromDB(userId?: string): Promise<NotebookEntry[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase
      .from('notebook_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) return null;

    return data.map(n => ({
      id: n.id,
      sessionId: `ses-${n.id.slice(0, 4)}`,
      date: n.date,
      skillCategory: 'Programming',
      skillName: 'Python for Data Science',
      teacherName: n.teacher_name,
      title: n.title,
      summary: n.summary,
      keyTakeaways: n.key_concepts || ['NumPy contiguous memory allocation', 'Pandas boolean indexing'],
      actionItems: n.action_items || [],
      codeSnippets: n.code_snippets || [],
      tags: ['python', 'data-science'],
    }));
  } catch {
    return null;
  }
}

export async function saveNotebookEntryToDB(entry: NotebookEntry, userId?: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const ownerId = userId || (entry as any).userId || 'guest';
    const { error } = await supabase.from('notebook_entries').insert({
      id: entry.id,
      user_id: ownerId,
      title: entry.title,
      date: entry.date,
      teacher_name: entry.teacherName,
      summary: entry.summary,
      action_items: entry.actionItems,
      key_concepts: entry.keyTakeaways,
      code_snippets: entry.codeSnippets,
      flashcards: [],
    });
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 6. CHAT MESSAGES SERVICE
// ============================================================================
export async function fetchChatMessagesFromDB(currentUserId?: string): Promise<Record<string, PeerChatMessage[]> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (currentUserId && currentUserId !== 'guest') {
      query = query.or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
    }

    const { data, error } = await query;

    if (error || !data) return null;

    const conversations: Record<string, PeerChatMessage[]> = {};
    data.forEach(m => {
      const isSender = currentUserId ? m.sender_id === currentUserId : m.sender_id === 'guest';
      const peerId = isSender ? m.receiver_id : m.sender_id;
      if (!conversations[peerId]) {
        conversations[peerId] = [];
      }
      conversations[peerId].push({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        senderAvatar: m.sender_avatar,
        text: m.text,
        timestamp: m.timestamp,
        isMe: isSender,
        status: m.is_read ? 'read' : 'sent',
      });
    });

    return conversations;
  } catch {
    return null;
  }
}

export async function saveChatMessageToDB(
  senderId: string,
  receiverId: string,
  msg: PeerChatMessage
) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!senderId || !receiverId || senderId === receiverId) return false;
  try {
    const { error } = await supabase.from('chat_messages').insert({
      id: msg.id,
      sender_id: senderId,
      receiver_id: receiverId,
      sender_name: msg.senderName,
      sender_avatar: msg.senderAvatar,
      text: msg.text,
      timestamp: msg.timestamp,
      is_read: msg.status === 'read',
    });
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 7. CREDIT TRANSACTIONS & WALLET SERVICE
// ============================================================================
export async function fetchCreditTransactionsFromDB(userId: string): Promise<LedgerTransaction[] | null> {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest') return null;
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((t: any) => ({
      id: t.id,
      date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      desc: t.description,
      delta: Number(t.delta),
      balance: Number(t.balance),
    }));
  } catch {
    return null;
  }
}

export async function recordCreditTransactionInDB(
  userId: string,
  desc: string,
  delta: number,
  balance: number
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest') return false;
  try {
    // 1. Insert transaction record
    const { error: txError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      description: desc,
      delta: delta,
      balance: balance,
    });

    // 2. Update profile credit balance
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ credit_balance: balance, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return !txError && !profileError;
  } catch {
    return false;
  }
}

export async function updateUserCreditBalanceInDB(userId: string, newBalance: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest') return false;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ credit_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}
