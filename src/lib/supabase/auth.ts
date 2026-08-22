import { supabase, isSupabaseConfigured } from './client';
import { UserProfile } from '../../types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  handle: string;
  headline?: string;
  teachSkill?: string;
  learnSkill?: string;
  avatar?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ── 1. Sign Up User ──────────────────────────────────────────────────────────
export async function signUpUser(data: SignUpData): Promise<{ user: UserProfile | null; error: string | null }> {
  const avatarUrl =
    data.avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  if (!isSupabaseConfigured || !supabase) {
    // Local / Offline fallback user creation
    const localUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
      avatar: avatarUrl,
      headline: data.headline || 'Skill Exchange Enthusiast',
      bio: `Hello! I am ${data.name}. Excited to barter skills on SkillXchange.`,
      location: 'Bangalore, India',
      timezone: 'IST (UTC+5:30)',
      college: 'Peer Network',
      collegeVerified: true,
      languages: ['English'],
      skillsToTeach: data.teachSkill
        ? [
            {
              skillId: `teach-${Date.now()}`,
              skillName: data.teachSkill,
              category: 'General',
              level: 'Intermediate',
              yearsExperience: 1,
              verified: true,
              verificationBadge: 'Verified Peer',
              hourlyRateInr: 500,
              hourlyRateCredits: 1.0,
              proofCount: 1,
            },
          ]
        : [],
      skillsToLearn: data.learnSkill
        ? [
            {
              skillId: `learn-${Date.now()}`,
              skillName: data.learnSkill,
              targetLevel: 'Intermediate',
              urgency: 'flexible',
              progressPercent: 0,
            },
          ]
        : [],
      creditsBalance: 5.0,
      totalCreditsEarned: 0,
      totalCreditsSpent: 0,
      teachingHours: 0,
      learningHours: 0,
      trustScore: {
        identityVerified: true,
        skillVerifiedCount: 1,
        completedSessions: 0,
        attendanceRate: 100,
        averageRating: 5.0,
        cancellationRate: 0,
        responseRate: 100,
        accountAgeMonths: 0,
        overallScore: 90,
      },
      streakDays: 1,
      xpPoints: 100,
      badges: [
        {
          id: 'badge-welcome',
          title: 'Early Pioneer',
          description: 'Joined SkillXchange peer network',
          icon: 'Sparkles',
          category: 'community',
          unlockedAt: new Date().toISOString().split('T')[0],
        },
      ],
      role: 'user',
    };
    return { user: localUser, error: null };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          handle: data.handle,
          avatar: avatarUrl,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    const userId = authData.user?.id || `user-${Date.now()}`;
    const handleClean = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;

    // Create profile in profiles table
    await supabase.from('profiles').upsert({
      id: userId,
      name: data.name,
      handle: handleClean,
      avatar: avatarUrl,
      headline: data.headline || 'Skill Exchange Enthusiast',
      bio: `Hello! I am ${data.name}. Excited to barter skills on SkillXchange.`,
      credit_balance: 5.0,
      rating: 5.0,
      trust_score: 90,
      streak_days: 1,
    });

    // Insert teaching skill if provided
    if (data.teachSkill) {
      await supabase.from('user_skills_teaching').insert({
        user_id: userId,
        skill_name: data.teachSkill,
        category: 'General',
        level: 'Intermediate',
        years_experience: 1,
        verified: true,
        hourly_rate_credits: 1.0,
        hourly_rate_inr: 500,
        proof_count: 1,
      });
    }

    // Insert learning skill if provided
    if (data.learnSkill) {
      await supabase.from('user_skills_learning').insert({
        user_id: userId,
        skill_name: data.learnSkill,
        target_level: 'Intermediate',
        urgency: 'flexible',
        progress_percent: 0,
      });
    }

    const userProfile: UserProfile = {
      id: userId,
      name: data.name,
      handle: handleClean,
      avatar: avatarUrl,
      headline: data.headline || 'Skill Exchange Enthusiast',
      bio: `Hello! I am ${data.name}. Excited to barter skills on SkillXchange.`,
      location: 'India',
      timezone: 'IST (UTC+5:30)',
      college: 'Peer Network',
      collegeVerified: true,
      languages: ['English'],
      skillsToTeach: data.teachSkill
        ? [
            {
              skillId: `teach-${Date.now()}`,
              skillName: data.teachSkill,
              category: 'General',
              level: 'Intermediate',
              yearsExperience: 1,
              verified: true,
              verificationBadge: 'Verified Peer',
              hourlyRateInr: 500,
              hourlyRateCredits: 1.0,
              proofCount: 1,
            },
          ]
        : [],
      skillsToLearn: data.learnSkill
        ? [
            {
              skillId: `learn-${Date.now()}`,
              skillName: data.learnSkill,
              targetLevel: 'Intermediate',
              urgency: 'flexible',
              progressPercent: 0,
            },
          ]
        : [],
      creditsBalance: 5.0,
      totalCreditsEarned: 0,
      totalCreditsSpent: 0,
      teachingHours: 0,
      learningHours: 0,
      trustScore: {
        identityVerified: true,
        skillVerifiedCount: 1,
        completedSessions: 0,
        attendanceRate: 100,
        averageRating: 5.0,
        cancellationRate: 0,
        responseRate: 100,
        accountAgeMonths: 0,
        overallScore: 90,
      },
      streakDays: 1,
      xpPoints: 100,
      badges: [],
      role: 'user',
    };

    return { user: userProfile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred during signup.' };
  }
}

// ── 2. Sign In User ──────────────────────────────────────────────────────────
export async function signInUser(data: SignInData): Promise<{ session: any; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { session: { user: { email: data.email } }, error: null };
  }

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: authData.session, error: null };
  } catch (err: any) {
    return { session: null, error: err.message || 'Sign in failed.' };
  }
}

// ── 3. Sign Out User ─────────────────────────────────────────────────────────
export async function signOutUser(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── 4. Listen to Auth Changes ───────────────────────────────────────────────
export function onAuthStateChanged(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data: subscription } = supabase.auth.onAuthStateChange(callback);
  return () => {
    subscription.subscription.unsubscribe();
  };
}
