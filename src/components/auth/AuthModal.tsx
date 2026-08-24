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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  KeyRound,
  Coins,
  Video,
  BadgeCheck,
  Repeat,
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
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

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
    setEmailAlreadyExists(false);

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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signUpEmail || !signUpPassword) {
      setErrorMsg('Please enter your full name, email, and password.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setEmailAlreadyExists(false);
    try {
      const cleanHandle = handle.trim() || fullName.toLowerCase().replace(/\s+/g, '');
      const result = await registerUser({
        email: signUpEmail,
        password: signUpPassword,
        name: fullName,
        handle: cleanHandle,
        headline: 'Skill Exchange Member',
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
      } else if (result.error === 'EMAIL_ALREADY_REGISTERED') {
        setEmailAlreadyExists(true);
        setSignInEmail(signUpEmail);
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
      setErrorMsg('Failed to resend email. Please check your spam folder or wait a moment for Supabase rate limit to reset.');
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

  // Shared field styling
  const fieldClass =
    'w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 py-3 transition-colors focus:bg-white';
  const labelClass = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or create an account"
    >
      <div
        className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl ring-1 ring-slate-900/10 overflow-hidden relative grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[600px] max-h-[94vh] animate-fade-scale"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── LEFT TRUST PANEL (Deep Navy + Ledger Engraving) ──────────────── */}
        <div className="hidden md:flex md:col-span-5 relative flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0B1220] via-[#0D1A2B] to-[#0B1220] p-8 text-white">
          {/* Signature: faint guilloché / security engraving */}
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage:
                'repeating-radial-gradient(circle at 20% 118%, rgba(16,185,129,0.12) 0px, rgba(16,185,129,0.12) 1px, transparent 1.5px, transparent 15px), repeating-radial-gradient(circle at 88% -12%, rgba(45,212,191,0.08) 0px, rgba(45,212,191,0.08) 1px, transparent 1.5px, transparent 21px)',
            }}
          />
          {/* Soft emerald depth glow */}
          <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          {/* Brand lockup */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
                <Repeat className="w-5 h-5" strokeWidth={2.4} />
              </div>
              <span className="text-[17px] font-display font-bold tracking-tight text-white">
                Skill<span className="text-emerald-400">X</span>change
              </span>
            </div>
          </div>

          {/* Headline + subcopy */}
          <div className="relative z-10 my-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10.5px] font-mono-ledger font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              <span>VERIFIED SKILL EXCHANGE</span>
            </div>
            <h2 className="text-[26px] leading-[1.15] font-display font-bold tracking-tight text-white">
              Trade skills with people you can trust.
            </h2>
            <p className="text-[13px] text-slate-400 mt-3 leading-relaxed max-w-xs">
              Teach what you know, learn what you don&apos;t. Every completed exchange is logged to a
              verifiable credential ledger.
            </p>
          </div>

          {/* Trust points */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Live 1-on-1 rooms</p>
                <p className="text-[11px] text-slate-400">HD video, audio &amp; a shared whiteboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Escrow-protected credits</p>
                <p className="text-[11px] text-slate-400">Credits are held safely until a session ends</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Verified certificates</p>
                <p className="text-[11px] text-slate-400">Every skill you prove earns a lasting record</p>
              </div>
            </div>
          </div>

          {/* Ledger status strip */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono-ledger text-[11px]">
            <span className="flex items-center gap-2 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold">
                {isSupabaseConfigured ? 'Ledger live · Supabase' : 'Offline in-memory engine'}
              </span>
            </span>
            <span className="text-slate-500">TLS 256-bit</span>
          </div>
        </div>

        {/* ── RIGHT AUTH FORM CONTAINER ───────────────────────────────────── */}
        <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-between overflow-y-auto max-h-[94vh]">
          <div>
            {/* Tab switcher */}
            {tab !== 'forgot' && tab !== 'reset_password' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-[300px]">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                    setEmailAlreadyExists(false);
                  }}
                  className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create account
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Celebration Card */}
            {successCelebration && (
              <div className="p-7 rounded-2xl bg-emerald-50 border border-emerald-200 text-center my-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/25">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-display font-bold text-emerald-950">You&apos;re in.</h4>
                <p className="text-[13px] text-emerald-700 mt-1">Setting up your wallet and dashboard…</p>
              </div>
            )}

            {/* Email Verification Screen */}
            {emailVerificationSent && !successCelebration && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center my-2 space-y-4 animate-fade-scale">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-lg font-display font-bold text-slate-900">Confirm your email</h4>
                  <p className="text-[13px] text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    We sent an activation link to{' '}
                    <strong className="text-slate-900 font-mono-ledger">{registeredEmail}</strong>. Open it to
                    finish setting up your account.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-left flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[12px]">
                    Once confirmed, sign in to unlock live rooms, peer matching, and your first skill swap.
                  </p>
                </div>
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail || resendCooldown > 0}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {resendingEmail
                      ? 'Sending…'
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerificationSent(false);
                      setTab('signin');
                      setSignInEmail(registeredEmail);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    I&apos;ve confirmed — sign in
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════ 1. SIGN IN ═══════════════════════ */}
            {!successCelebration && !emailVerificationSent && tab === 'signin' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-[22px] font-display font-bold text-slate-900 tracking-tight">Welcome back</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Sign in to pick up where you left off.</p>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email or username</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="you@example.com or @handle"
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        className={`${fieldClass} pl-10 pr-4`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showSignInPass ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        className={`${fieldClass} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPass(!showSignInPass)}
                        aria-label={showSignInPass ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-[13px] text-slate-600">Keep me signed in</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setErrorMsg(null);
                        setEmailAlreadyExists(false);
                      }}
                      className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      New here? Create account
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo accounts */}
                <div className="mt-6">
                  <div className="relative flex items-center justify-center mb-3">
                    <span className="absolute inset-x-0 h-px bg-slate-100" />
                    <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
                      or explore a demo account
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickDemoLogin(DEMO_USER_AARAV)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer flex items-center gap-2.5 active:scale-[0.98]"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                        alt="Aarav"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">Aarav</p>
                        <p className="text-[11px] text-slate-500 truncate">Teaches Python &amp; AI</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickDemoLogin(DEMO_USER_PRIYA)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer flex items-center gap-2.5 active:scale-[0.98]"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                        alt="Priya"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">Priya</p>
                        <p className="text-[11px] text-slate-500 truncate">Teaches UI/UX design</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════ 2. SIGN UP ═══════════════════════ */}
            {!successCelebration && !emailVerificationSent && tab === 'signup' && (
              <div>
                <div className="mb-5">
                  <h3 className="text-[22px] font-display font-bold text-slate-900 tracking-tight">
                    Create your account
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">Fill in your details to get started.</p>
                </div>

                {/* Email already registered prompt */}
                {emailAlreadyExists && (
                  <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[13px] flex items-start gap-2.5 animate-fade-scale">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">This email is already registered.</p>
                      <p className="mt-0.5">
                        Please{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setTab('signin');
                            setErrorMsg(null);
                            setEmailAlreadyExists(false);
                          }}
                          className="underline font-semibold text-amber-800 hover:text-amber-900 cursor-pointer"
                        >
                          sign in instead
                        </button>.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Full name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Aarav Sharma"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className={`${fieldClass} pl-10 pr-3`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Handle <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <AtSign className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="aarav_s"
                          value={handle}
                          onChange={e => setHandle(e.target.value)}
                          className={`${fieldClass} pl-10 pr-3`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={e => { setSignUpEmail(e.target.value); setEmailAlreadyExists(false); }}
                        className={`${fieldClass} pl-10 pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showSignUpPass ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        className={`${fieldClass} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPass(!showSignUpPass)}
                        aria-label={showSignUpPass ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showSignUpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signUpPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Password strength</span>
                          <span className="font-semibold text-slate-700">{pwdStrength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pwdStrength.color} transition-all duration-300`}
                            style={{ width: `${(pwdStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Choose an avatar</label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          aria-label={`Avatar ${idx + 1}`}
                          className={`relative rounded-full overflow-hidden shrink-0 transition-transform ${
                            selectedAvatar === av
                              ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt="" className="w-10 h-10 object-cover" />
                          {selectedAvatar === av && (
                            <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Welcome credits hint */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-emerald-950">You&apos;ll start with 5 credits</p>
                      <p className="text-[11.5px] text-emerald-800">Enough to book your first skill swap.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Create account</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════ 3. FORGOT PASSWORD ═══════════════════════ */}
            {!successCelebration && tab === 'forgot' && (
              <div>
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 font-medium mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to sign in</span>
                </button>

                <div className="mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] font-display font-bold text-slate-900 tracking-tight">
                    Reset your password
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Enter your email and we&apos;ll send you a secure reset link.
                  </p>
                </div>

                {recoverySent ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                    <p className="font-display font-bold flex items-center gap-2 text-[15px] text-emerald-950">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Check your inbox
                    </p>
                    <p className="text-[13px] text-emerald-700 leading-relaxed">
                      A reset link is on its way to{' '}
                      <strong className="font-mono-ledger">{recoveryEmail}</strong>. Check spam if you don&apos;t
                      see it in a minute.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverySubmit} className="space-y-4">
                    <div>
                      <label className={labelClass}>Registered email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={recoveryEmail}
                          onChange={e => setRecoveryEmail(e.target.value)}
                          className={`${fieldClass} pl-10 pr-4`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Send reset link</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ═══════════════════════ 4. CREATE NEW PASSWORD ═══════════════════════ */}
            {!successCelebration && tab === 'reset_password' && (
              <div>
                <div className="mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] font-display font-bold text-slate-900 tracking-tight">
                    Choose a new password
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Your reset link is verified. Set a new password for your account.
                  </p>
                </div>

                {resetSuccess ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-display font-bold text-[15px] text-emerald-950">Password updated</h4>
                    <p className="text-[13px] text-emerald-700">You can now sign in with your new password.</p>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className={labelClass}>New password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className={`${fieldClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          aria-label={showNewPass ? 'Hide password' : 'Show password'}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Confirm new password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className={`${fieldClass} pl-10 pr-4`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Update password</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono-ledger">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted · Supabase Auth</span>
            </span>
            <span>Identity-verified peers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
