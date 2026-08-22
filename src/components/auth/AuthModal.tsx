'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AtSign,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Zap,
  Check,
  GraduationCap,
  KeyRound,
  ArrowLeft,
  Coins,
  Repeat,
  Compass,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { useApp, DEMO_USER_AARAV, DEMO_USER_PRIYA } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { sendPasswordResetEmail, updateUserPassword } from '../../lib/supabase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'forgot' | 'reset_password';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

const POPULAR_TEACH_SKILLS = [
  { name: 'Python for AI', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'UI/UX & Figma', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { name: 'Acoustic Guitar', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'React & Next.js', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { name: 'Public Speaking', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'GLSL Shaders', color: 'bg-purple-50 text-purple-800 border-purple-200' },
];

const POPULAR_LEARN_SKILLS = [
  { name: 'Machine Learning', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { name: 'Japanese Conversation', color: 'bg-red-50 text-red-800 border-red-200' },
  { name: 'Prompt Engineering', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { name: 'Product Design', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { name: 'Cloud Architecture', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Fingerstyle Guitar', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
}) => {
  const { loginUser, loginAsDemoUser, registerUser, resendVerification, showToast } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot' | 'reset_password'>(initialTab);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [headline, setHeadline] = useState('');
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  // Email Verification Screen State
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot / Reset password states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCelebration, setSuccessCelebration] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setErrorMsg(null);
    setEmailVerificationSent(false);
    setRecoverySent(false);
    setResetSuccess(false);

    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token=')) {
        setTab('reset_password');
      }
    }
  }, [initialTab, isOpen]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let s = 0;
    if (pass.length >= 6) s++;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;

    if (s <= 2) return { score: s, label: 'Weak', color: 'bg-rose-500' };
    if (s <= 4) return { score: s, label: 'Good', color: 'bg-amber-500' };
    return { score: s, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(signUpPassword);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await loginUser(signInEmail, signInPassword);
      if (result.success) {
        setSuccessCelebration(true);
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setErrorMsg(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signUpEmail || !signUpPassword) {
      setErrorMsg('Please enter your full name, email, and password.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg(null);
    setSignUpStep(2);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const cleanHandle = handle.trim() || fullName.toLowerCase().replace(/\s+/g, '');
      const result = await registerUser({
        email: signUpEmail,
        password: signUpPassword,
        name: fullName,
        handle: cleanHandle,
        headline: headline || 'Skill Exchange Member',
        teachSkill: teachSkill.trim() || undefined,
        learnSkill: learnSkill.trim() || undefined,
        avatar: selectedAvatar,
      });

      if (result.success) {
        if (result.needsEmailVerification) {
          setRegisteredEmail(signUpEmail);
          setEmailVerificationSent(true);
        } else {
          setSuccessCelebration(true);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        setErrorMsg(result.error || 'Registration failed. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || resendCooldown > 0) return;
    setResendingEmail(true);
    setErrorMsg(null);
    const success = await resendVerification(registeredEmail);
    setResendingEmail(false);
    setResendCooldown(60);
    if (!success) {
      setErrorMsg('Failed to resend email or rate limit reached. Use Instant Verification below if needed.');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await sendPasswordResetEmail(recoveryEmail);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setRecoverySent(true);
        showToast(`Secure password reset email dispatched to ${recoveryEmail}`, 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await updateUserPassword(newPassword);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setResetSuccess(true);
        showToast('Password successfully updated! You can now sign in.', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoUser: typeof DEMO_USER_AARAV) => {
    setLoading(true);
    setErrorMsg(null);
    loginAsDemoUser(demoUser);
    setSuccessCelebration(true);
    setTimeout(() => {
      onClose();
      setLoading(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[580px] max-h-[92vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── LEFT SHOWCASE PANEL (Matching HomeScreen Style) ───────────────────────── */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 text-white flex-col justify-between relative overflow-hidden border-r border-slate-800">
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-amber-400 text-xs font-mono-ledger font-semibold shadow-xs mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Fiat Skill Network</span>
            </div>

            <h2 className="text-2xl font-bold font-sans tracking-tight text-white leading-tight">
              Learn anything for free by teaching what you know.
            </h2>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Exchange skills directly 1-on-1 with interactive study rooms, real-time video, and cryptographically verified ledger certificates.
            </p>
          </div>

          {/* Feature Highlights Matching Home Screen Cards */}
          <div className="relative z-10 space-y-2.5 my-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Live Study Rooms</p>
                <p className="text-[10px] text-slate-400 font-mono-ledger">WebRTC video, audio & whiteboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Barter Credits Economy</p>
                <p className="text-[10px] text-slate-400 font-mono-ledger">Earn every time you teach peers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">SHA-256 Ledger Proofs</p>
                <p className="text-[10px] text-slate-400 font-mono-ledger">Verifiable certificates & quizzes</p>
              </div>
            </div>
          </div>

          {/* Database Live Status Badge */}
          <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-ledger">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-semibold">
                {isSupabaseConfigured ? 'Supabase Database Active' : 'Offline In-Memory Engine'}
              </span>
            </div>
            <span className="text-slate-400">v2.4</span>
          </div>
        </div>

        {/* ── RIGHT AUTH FORM CONTAINER ────────────────────────────────────────────── */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[92vh]">
          <div>
            {/* Top Tab Pill Switcher Matching HeaderNav */}
            {tab !== 'forgot' && (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80 max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-500" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                    setSignUpStep(1);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Celebration Card */}
            {successCelebration && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center my-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-950">Welcome to SkillXchange!</h4>
                <p className="text-xs text-emerald-700 mt-1">Synchronizing your barter wallet and dashboard...</p>
              </div>
            )}

            {/* Email Verification Screen */}
            {emailVerificationSent && !successCelebration && (
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center my-2 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Check Your Email to Activate</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    We've sent an activation link to <strong className="text-slate-900 font-mono-ledger">{registeredEmail}</strong>. Please check your inbox and click the link to confirm your account.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11.5px]">
                    After confirming via the email link, sign in with your credentials to unlock live study rooms, bilateral peer matching, and start swapping skills!
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail || resendCooldown > 0}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {resendingEmail
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Verification Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerificationSent(false);
                      setTab('signin');
                      setSignInEmail(registeredEmail);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    I Have Verified → Sign In
                  </button>
                </div>

                {/* Instant Verification Bypass when Rate Limited */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      const result = await loginUser(registeredEmail || signUpEmail, signUpPassword || 'password123');
                      setLoading(false);
                      if (result.success) {
                        setSuccessCelebration(true);
                        setTimeout(() => {
                          onClose();
                        }, 800);
                      } else {
                        setEmailVerificationSent(false);
                        setTab('signin');
                        setSignInEmail(registeredEmail);
                      }
                    }}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold underline cursor-pointer"
                  >
                    Rate limited by email provider? Click here to Instant Verify & Enter
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 1. SIGN IN TAB */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!successCelebration && !emailVerificationSent && tab === 'signin' && (
              <div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter your verified email and password to access your dashboard.</p>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1.5">
                      Email Address or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="alex@skillexchange.org or @alexr"
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showSignInPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPass(!showSignInPass)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setErrorMsg(null);
                        setSignUpStep(1);
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      New user? Register →
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* ── 2 DEMO USERS FOR INSTANT TESTING ─────────────────── */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono-ledger text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>1-Click Test Accounts</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono-ledger">
                      Instant Testing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* User 1: Aarav Sharma */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickDemoLogin(DEMO_USER_AARAV)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer flex items-center gap-2.5 active:scale-[0.98]"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                        alt="Aarav"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                            Aarav (User A)
                          </p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono-ledger font-bold">
                            Dev
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">Teaches: Python & AI</p>
                      </div>
                    </button>

                    {/* User 2: Priya Patel */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickDemoLogin(DEMO_USER_PRIYA)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer flex items-center gap-2.5 active:scale-[0.98]"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                        alt="Priya"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                            Priya (User B)
                          </p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono-ledger font-bold">
                            Design
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">Teaches: UI/UX Design</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Secure Authentication Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono-ledger">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Auth & Database Verified</span>
                  </span>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 2. SIGN UP TAB (2-Step Flow) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!successCelebration && !emailVerificationSent && tab === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Free Account</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {signUpStep === 1 ? 'Step 1: Your Credentials & Identity' : 'Step 2: Skills Barter Match Profile'}
                    </p>
                  </div>
                  {/* Step Progress Pills */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 rounded-full transition-all ${signUpStep === 1 ? 'bg-emerald-600 w-7' : 'bg-emerald-200 w-4'}`}></span>
                    <span className={`h-2 rounded-full transition-all ${signUpStep === 2 ? 'bg-emerald-600 w-7' : 'bg-slate-200 w-4'}`}></span>
                  </div>
                </div>

                {/* STEP 1: Basic Identity & Password */}
                {signUpStep === 1 && (
                  <form onSubmit={handleSignUpNext} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Aarav Sharma"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                          Handle
                        </label>
                        <div className="relative">
                          <AtSign className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="aarav_s"
                            value={handle}
                            onChange={e => setHandle(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="aarav@college.edu or personal email"
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type={showSignUpPass ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={signUpPassword}
                          onChange={e => setSignUpPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPass(!showSignUpPass)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showSignUpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {signUpPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] font-mono-ledger mb-1">
                            <span className="text-slate-500">Password Strength:</span>
                            <span className="font-bold text-slate-700">{pwdStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pwdStrength.color} transition-all duration-300`}
                              style={{ width: `${pwdStrength.score}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1.5">
                        Choose Profile Avatar
                      </label>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {PRESET_AVATARS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`relative rounded-full overflow-hidden shrink-0 transition-transform ${
                              selectedAvatar === av ? 'ring-2 ring-emerald-600 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={av} alt="Avatar option" className="w-9 h-9 object-cover" />
                            {selectedAvatar === av && (
                              <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer mt-2"
                    >
                      <span>Continue to Skill Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* STEP 2: Skills Barter Configuration */}
                {signUpStep === 2 && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                        Professional Headline / Bio
                      </label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. CS Sophomore & Fullstack Developer"
                          value={headline}
                          onChange={e => setHeadline(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    {/* Teach Skill */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold font-mono-ledger text-emerald-800">
                          Skill You Can Teach (Offer)
                        </label>
                        <span className="text-[10px] text-emerald-600 font-mono-ledger font-bold">+1.0 Credit/hr</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Python, UI Design, Acoustic Guitar"
                        value={teachSkill}
                        onChange={e => setTeachSkill(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      {/* Popular suggestions matching website style */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {POPULAR_TEACH_SKILLS.map(s => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => setTeachSkill(s.name)}
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all ${
                              teachSkill === s.name ? 'bg-emerald-600 text-white border-emerald-600' : s.color
                            }`}
                          >
                            + {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learn Skill */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold font-mono-ledger text-amber-800">
                          Skill You Want to Learn (Goal)
                        </label>
                        <span className="text-[10px] text-amber-600 font-mono-ledger font-bold">Auto-Matched</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning, Japanese, Figma"
                        value={learnSkill}
                        onChange={e => setLearnSkill(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                      {/* Popular suggestions matching website style */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {POPULAR_LEARN_SKILLS.map(s => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => setLearnSkill(s.name)}
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all ${
                              learnSkill === s.name ? 'bg-amber-500 text-white border-amber-500' : s.color
                            }`}
                          >
                            + {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genesis Bonus Box */}
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950">Decentralized Genesis Profile</p>
                        <p className="text-[10.5px] text-amber-800 font-mono-ledger">
                          Includes verified SHA-256 Ledger ID block & zero-fiat barter wallet.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignUpStep(1)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Back to Step 1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <span>Complete Account & Claim 5 Credits</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 3. FORGOT PASSWORD TAB */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!successCelebration && tab === 'forgot' && (
              <div>
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-4 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>

                <div className="mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Reset Your Password</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered email address. Supabase Auth will securely send a password reset link to your inbox.
                  </p>
                </div>

                {recoverySent ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
                    <p className="font-bold flex items-center gap-1.5 text-sm text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password Reset Email Dispatched!
                    </p>
                    <p className="text-emerald-700 leading-relaxed">
                      A secure recovery link has been sent to <strong className="font-mono-ledger">{recoveryEmail}</strong>. Check your inbox (or spam) and click the link to choose a new password.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1.5">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="alex@skillexchange.org"
                          value={recoveryEmail}
                          onChange={e => setRecoveryEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Send Password Reset Email</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 4. CREATE NEW PASSWORD TAB (From Reset Link) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!successCelebration && tab === 'reset_password' && (
              <div>
                <div className="mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create New Password</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your reset token is verified. Enter a strong new password for your SkillXchange account.
                  </p>
                </div>

                {resetSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-emerald-950">Password Updated Successfully!</h4>
                    <p className="text-emerald-700">You can now sign in with your new credentials.</p>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Sign In to Account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Update Password & Continue</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-mono-ledger">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cryptographic Peer Verification</span>
            </div>
            <span>SkillXchange v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
