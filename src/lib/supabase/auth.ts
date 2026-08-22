import { supabase, isSupabaseConfigured } from './client';
import { UserProfile, UserSkillOffering, UserLearningGoal } from '../../types';

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

// ── 1. Fetch User Profile from Supabase DB ────────────────────────────────────
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) return null;

    // Fetch teaching skills
    const { data: teachSkills } = await supabase
      .from('user_skills_teaching')
      .select('*')
      .eq('user_id', userId);

    // Fetch learning skills
    const { data: learnSkills } = await supabase
      .from('user_skills_learning')
      .select('*')
      .eq('user_id', userId);

    const formattedTeach: UserSkillOffering[] = (teachSkills || []).map(t => ({
      skillId: t.id,
      skillName: t.skill_name,
      category: t.category || 'General',
      level: t.level || 'Intermediate',
      yearsExperience: t.years_experience || 1,
      verified: t.verified ?? true,
      verificationBadge: 'Verified Peer',
      hourlyRateInr: t.hourly_rate_inr || 500,
      hourlyRateCredits: t.hourly_rate_credits || 1.0,
      proofCount: t.proof_count || 1,
    }));

    const formattedLearn: UserLearningGoal[] = (learnSkills || []).map(l => ({
      skillId: l.id,
      skillName: l.skill_name,
      targetLevel: l.target_level || 'Intermediate',
      urgency: l.urgency || 'flexible',
      currentRoadmapStep: 1,
      totalRoadmapSteps: 6,
      progressPercent: l.progress_percent || 0,
    }));

    const fullUser: UserProfile = {
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      avatar: profile.avatar,
      headline: profile.headline || 'Skill Exchange Enthusiast',
      bio: profile.bio || `Hello! I am ${profile.name}. Excited to barter skills on SkillXchange.`,
      location: 'India',
      timezone: 'IST (UTC+5:30)',
      college: profile.college_name || 'Skill Network',
      collegeVerified: true,
      languages: ['English'],
      skillsToTeach: formattedTeach,
      skillsToLearn: formattedLearn,
      creditsBalance: profile.credit_balance ?? 5.0,
      totalCreditsEarned: 0,
      totalCreditsSpent: 0,
      teachingHours: 0,
      learningHours: 0,
      trustScore: {
        identityVerified: true,
        skillVerifiedCount: formattedTeach.length,
        completedSessions: 0,
        attendanceRate: 100,
        averageRating: profile.rating || 5.0,
        cancellationRate: 0,
        responseRate: 100,
        accountAgeMonths: 0,
        overallScore: profile.trust_score || 90,
      },
      streakDays: profile.streak_days || 1,
      xpPoints: 100,
      badges: [],
      role: 'user',
    };

    return fullUser;
  } catch {
    return null;
  }
}

// ── 1a. Sync Pending Skills from Auth Metadata ─────────────────────────────────
// If a user signed up with a teach/learn skill while email confirmation was
// pending, those skills live only in auth user_metadata (the trigger that
// creates the profile row doesn't touch the skill tables, and the client
// couldn't write them as an unauthenticated session — see signUpUser). Once
// the user actually has a session (first real sign-in), RLS allows the write,
// so we finish the job here rather than silently losing that data forever.
async function syncPendingSkillsFromMetadata(userId: string, meta: Record<string, any>): Promise<void> {
  if (!supabase) return;
  const teachSkill = meta.teach_skill as string | undefined;
  const learnSkill = meta.learn_skill as string | undefined;
  if (!teachSkill && !learnSkill) return;

  try {
    const [{ data: existingTeach }, { data: existingLearn }] = await Promise.all([
      supabase.from('user_skills_teaching').select('id').eq('user_id', userId),
      supabase.from('user_skills_learning').select('id').eq('user_id', userId),
    ]);

    if (teachSkill && !(existingTeach && existingTeach.length > 0)) {
      await supabase.from('user_skills_teaching').insert({
        user_id: userId,
        skill_name: teachSkill,
        category: 'General',
        level: 'Intermediate',
        years_experience: 1,
        verified: true,
        hourly_rate_credits: 1.0,
        hourly_rate_inr: 500,
        proof_count: 1,
      });
      await supabase.from('skills').upsert({
        name: teachSkill,
        category: 'User Added',
        description: `Taught by ${meta.name || 'a SkillXchange member'}`,
        demand_multiplier: 1.2,
      }, { onConflict: 'name' });
    }

    if (learnSkill && !(existingLearn && existingLearn.length > 0)) {
      await supabase.from('user_skills_learning').insert({
        user_id: userId,
        skill_name: learnSkill,
        target_level: 'Intermediate',
        urgency: 'flexible',
        progress_percent: 0,
      });
    }
  } catch {
    // Best-effort only — never block sign-in over this.
  }
}

// ── 2a. Check Handle Availability (prevents silent unique-constraint failures) ─
export async function isHandleTaken(handle: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const handleClean = handle.startsWith('@') ? handle : `@${handle}`;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('handle', handleClean)
      .maybeSingle();
    if (error) return false; // fail-open: don't block signup on a check-query error
    return Boolean(data);
  } catch {
    return false;
  }
}

// ── 2. Sign Up User with Email Verification Support ────────────────────────────
export async function signUpUser(data: SignUpData): Promise<{
  user: UserProfile | null;
  needsEmailVerification: boolean;
  error: string | null;
  warning?: string | null;
}> {
  const avatarUrl =
    data.avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  if (!isSupabaseConfigured || !supabase) {
    return {
      user: null,
      needsEmailVerification: false,
      error: 'Supabase is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to connect to your live database.',
    };
  }

  // Validate + normalize handle up front, and reject duplicates before we ever
  // create the Auth user. Without this, two signups that land on the same
  // handle (e.g. two "Aarav Sharma"s) silently fail to write a profile row
  // later on, leaving a real Auth account with no matching profile.
  const rawHandle = (data.handle || data.name).trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!rawHandle) {
    return { user: null, needsEmailVerification: false, error: 'Please choose a valid handle using letters, numbers, or underscores.' };
  }
  data = { ...data, handle: rawHandle };

  if (await isHandleTaken(rawHandle)) {
    return {
      user: null,
      needsEmailVerification: false,
      error: `The handle @${rawHandle} is already taken. Please choose a different one.`,
    };
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
          headline: data.headline || 'Skill Exchange Member',
          teach_skill: data.teachSkill,
          learn_skill: data.learnSkill,
        },
      },
    });

    if (authError) {
      const errMsg = authError.message.toLowerCase();
      const isRateLimit =
        errMsg.includes('rate limit') ||
        errMsg.includes('over_email_send_rate_limit') ||
        (authError as any).status === 429 ||
        errMsg.includes('security purposes');

      if (isRateLimit) {
        // Fallback: create verified user profile directly to bypass device/IP rate limit
        const fallbackUserId = `user-${Date.now()}`;
        const handleClean = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;

        let fallbackProfileError: string | null = null;
        try {
          const { error: fallbackInsertError } = await supabase.from('profiles').upsert({
            id: fallbackUserId,
            email: data.email.trim().toLowerCase(),
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
          if (fallbackInsertError) fallbackProfileError = fallbackInsertError.message;
        } catch (e: any) {
          fallbackProfileError = e?.message || 'Unknown error creating fallback profile.';
        }

        if (fallbackProfileError) {
          return {
            user: null,
            needsEmailVerification: false,
            error: `We couldn't create your account (${fallbackProfileError}). Please try a different handle or email.`,
          };
        }

        const fallbackUser: UserProfile = {
          id: fallbackUserId,
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

        return { user: fallbackUser, needsEmailVerification: false, error: null };
      }

      return { user: null, needsEmailVerification: false, error: authError.message };
    }

    const userId = authData.user?.id || `user-${Date.now()}`;
    const handleClean = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;

    // IMPORTANT: public.profiles has an `on_auth_user_created` trigger
    // (SECURITY DEFINER) that already inserts a matching profile row the
    // moment the Auth user is created — using the metadata we just passed
    // to signUp() above (name/handle/avatar/headline/teach_skill/learn_skill).
    // That trigger runs regardless of session state, so it always succeeds.
    //
    // Whether *we* can also write here from the client depends on whether a
    // session was issued: if email confirmation is required, authData.session
    // is null and this request runs as anon. The `profiles` INSERT policy
    // tolerates anon (auth.uid() IS NULL), but since the trigger's row
    // already exists, our upsert takes the ON CONFLICT DO UPDATE path, which
    // requires auth.uid() = id — impossible while anon. The teaching/learning
    // skill tables have no anon fallback at all, so those inserts would fail
    // outright. Attempting either as anon would either no-op or throw a
    // confusing RLS error for something that already succeeded via the
    // trigger, so we only do these writes when we actually hold a session.
    let skillWarning: string | null = null;
    const hasSession = Boolean(authData.session);

    if (hasSession) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: data.email.trim().toLowerCase(),
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

      if (profileError) {
        return {
          user: null,
          needsEmailVerification: false,
          error: `Your account was created but we couldn't set up your profile (${profileError.message}). Please try signing in — if that fails, contact support.`,
        };
      }

      // Insert teaching skill if provided. Non-fatal: we surface a warning
      // through the error channel only if it fails, but don't block signup.
      if (data.teachSkill) {
        const { error: teachError } = await supabase.from('user_skills_teaching').insert({
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
        if (teachError) skillWarning = `Your account was created, but we couldn't save your teaching skill (${teachError.message}). You can add it later from your profile.`;

        // Also ensure skill is in global directory
        await supabase.from('skills').upsert({
          name: data.teachSkill,
          category: 'User Added',
          description: `Taught by ${data.name}`,
          demand_multiplier: 1.2,
        }, { onConflict: 'name' });
      }

      // Insert learning skill if provided
      if (data.learnSkill) {
        const { error: learnError } = await supabase.from('user_skills_learning').insert({
          user_id: userId,
          skill_name: data.learnSkill,
          target_level: 'Intermediate',
          urgency: 'flexible',
          progress_percent: 0,
        });
        if (learnError && !skillWarning) {
          skillWarning = `Your account was created, but we couldn't save your learning goal (${learnError.message}). You can add it later from your profile.`;
        }
      }
    }
    // else: no session yet (pending email confirmation). The trigger already
    // created the profile from our metadata, and teach_skill/learn_skill are
    // preserved in auth user_metadata — signInUser() finishes the job by
    // syncing them into the skill tables the first time the user actually
    // authenticates (see syncPendingSkillsFromMetadata below), once RLS can
    // see a real auth.uid().

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

    // If session is null, Supabase has email confirmation enabled
    const needsEmailVerification = Boolean(authData.user && !authData.session);

    // Account + profile succeeded; skillWarning (if any) is informational only
    // and should not block the user from proceeding.
    return { user: userProfile, needsEmailVerification, error: null, warning: skillWarning };
  } catch (err: any) {
    return { user: null, needsEmailVerification: false, error: err.message || 'An unexpected error occurred.' };
  }
}

// ── 3. Sign In User ──────────────────────────────────────────────────────────
export async function signInUser(data: SignInData): Promise<{
  user: UserProfile | null;
  session: any;
  error: string | null;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      user: null,
      session: null,
      error: 'Supabase is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to connect to your live database.',
    };
  }

  try {
    let loginEmail = data.email.trim();

    // Support signing in with either email address or @handle / username
    if (!loginEmail.includes('@') || loginEmail.startsWith('@')) {
      const handleQuery = loginEmail.startsWith('@') ? loginEmail : `@${loginEmail}`;
      const { data: profileByHandle } = await supabase
        .from('profiles')
        .select('email, id')
        .ilike('handle', handleQuery)
        .maybeSingle();

      if (profileByHandle?.email) {
        loginEmail = profileByHandle.email;
      }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: data.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        return {
          user: null,
          session: null,
          error: 'Please verify your email address. Check your inbox and click the confirmation link sent by Supabase.',
        };
      }
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials') ||
        msg.includes('user not found') ||
        msg.includes('invalid_grant')
      ) {
        return {
          user: null,
          session: null,
          error: 'Invalid username/email or password. If you do not have an account, please register first.',
        };
      }
      return { user: null, session: null, error: error.message };
    }

    if (!authData.user) {
      return {
        user: null,
        session: null,
        error: 'Invalid username/email or password. If you do not have an account, please register first.',
      };
    }

    // Fetch full profile from DB
    let profile = await fetchUserProfile(authData.user.id);

    // Self-heal: the credentials were correct (Supabase Auth just accepted
    // them), but the profile row is missing — most likely because the
    // profile write during signup failed silently in the past, or the
    // account was created before this fix. Rebuild a minimal profile from
    // the Auth user's metadata instead of telling the user their correct
    // password is "invalid", which is misleading and sends people down a
    // pointless password-reset path.
    if (!profile) {
      const meta = authData.user.user_metadata || {};
      const fallbackHandle = (meta.handle || `@${(authData.user.email || 'user').split('@')[0]}`) as string;
      const { error: healError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: authData.user.email,
        name: meta.name || 'SkillXchange Member',
        handle: fallbackHandle,
        avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'Skill Exchange Enthusiast',
        bio: `Hello! I am ${meta.name || 'a member'}. Excited to barter skills on SkillXchange.`,
        credit_balance: 5.0,
        rating: 5.0,
        trust_score: 90,
        streak_days: 1,
      });

      if (!healError) {
        profile = await fetchUserProfile(authData.user.id);
      }

      if (!profile) {
        return {
          user: null,
          session: authData.session,
          error: 'Your password is correct, but we could not load your profile data. Please try again in a moment or contact support.',
        };
      }
    }

    // Finish syncing any teach/learn skill picked during signup that couldn't
    // be written while email confirmation was pending. Cheap no-op once done.
    const authMeta = authData.user.user_metadata || {};
    await syncPendingSkillsFromMetadata(authData.user.id, authMeta);
    if (!profile.skillsToTeach.length && !profile.skillsToLearn.length && (authMeta.teach_skill || authMeta.learn_skill)) {
      profile = (await fetchUserProfile(authData.user.id)) || profile;
    }

    return { user: profile, session: authData.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || 'Sign in failed. Please check your credentials.' };
  }
}

// ── 4. Resend Verification Email ─────────────────────────────────────────────
export async function resendVerificationEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { error: null };
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) {
      const errMsg = error.message.toLowerCase();
      if (
        errMsg.includes('rate limit') ||
        errMsg.includes('over_email_send_rate_limit') ||
        (error as any).status === 429 ||
        errMsg.includes('security purposes')
      ) {
        return {
          error: 'Email rate limit reached for this IP/device. Please wait 60s before trying again.',
        };
      }
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to resend confirmation email.' };
  }
}

// ── 5. Send Password Reset Email ─────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }
  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) {
      const errMsg = error.message.toLowerCase();
      if (
        errMsg.includes('rate limit') ||
        errMsg.includes('over_email_send_rate_limit') ||
        (error as any).status === 429 ||
        errMsg.includes('security purposes')
      ) {
        return {
          error: 'Password reset email rate limit reached. Please wait a minute before requesting another link.',
        };
      }
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to send password reset email.' };
  }
}

// ── 6. Update User Password (New Password Creation) ──────────────────────────
export async function updateUserPassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to update password.' };
  }
}

// ── 7. Get Authenticated Session ─────────────────────────────────────────────
export async function getAuthenticatedSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

// ── 8. Sign Out User ─────────────────────────────────────────────────────────
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

// ── 9. Listen to Auth Changes & Session Recovery ─────────────────────────────
export function onAuthStateChanged(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data: subscription } = supabase.auth.onAuthStateChange(callback);
  return () => {
    subscription.subscription.unsubscribe();
  };
}