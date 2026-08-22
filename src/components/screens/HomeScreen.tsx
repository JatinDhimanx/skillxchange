'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Search,
  Users,
  Repeat,
  Video,
  Wallet,
  Zap,
  BookOpen,
  Mic,
  Lock,
  Star,
  TrendingUp,
  CheckCircle2,
  Award,
  BarChart2,
  GraduationCap,
  Flame,
  Shield,
  Code,
  Music,
  Sparkles,
  Globe,
  Palette,
  FlaskConical,
  Briefcase,
  ChevronRight,
  Handshake,
  Coins,
  ShieldCheck,
  Gem,
  Leaf,
  Rocket,
  Clock,
  Activity,
  MessageSquare,
} from 'lucide-react';
import { ScreenTab } from '../layout/HeaderNav';

interface HomeScreenProps {
  onNavigate: (tab: ScreenTab) => void;
}

/* ──────────────────────────────────────────────────────────── */
/* Inline hook: fade-in on scroll                             */
/* ──────────────────────────────────────────────────────────── */
function useRevealOnScroll() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ──────────────────────────────────────────────────────────── */
/* DATA                                                        */
/* ──────────────────────────────────────────────────────────── */
const TRENDING_SKILLS = [
  { name: 'Python for Data Science', cat: 'Programming', demand: '2.4x', tag: 'High Demand', tagIcon: <Flame className="w-3 h-3" />, color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { name: 'GLSL / WebGL Shaders', cat: 'Creative Coding', demand: '2.8x', tag: 'Rare Skill', tagIcon: <Gem className="w-3 h-3" />, color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { name: 'Business English', cat: 'Languages', demand: '1.8x', tag: 'Rising Fast', tagIcon: <TrendingUp className="w-3 h-3" />, color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { name: 'UI/UX & Figma', cat: 'Design', demand: '2.1x', tag: 'High Demand', tagIcon: <Flame className="w-3 h-3" />, color: 'bg-rose-50 border-rose-200 text-rose-800' },
  { name: 'Acoustic Guitar', cat: 'Arts & Music', demand: '1.0x', tag: 'Balanced', tagIcon: <Music className="w-3 h-3" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { name: 'Japanese Language', cat: 'Languages', demand: '1.6x', tag: 'Rising Fast', tagIcon: <TrendingUp className="w-3 h-3" />, color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'Machine Learning', cat: 'AI/ML', demand: '3.1x', tag: 'Very High', tagIcon: <Rocket className="w-3 h-3" />, color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { name: 'Yoga & Mindfulness', cat: 'Wellness', demand: '1.2x', tag: 'Steady', tagIcon: <Leaf className="w-3 h-3" />, color: 'bg-teal-50 border-teal-200 text-teal-800' },
];

const CATEGORIES = [
  { icon: <Code className="w-5 h-5" />, label: 'Programming', count: 42, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { icon: <Palette className="w-5 h-5" />, label: 'Design', count: 28, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { icon: <Globe className="w-5 h-5" />, label: 'Languages', count: 35, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { icon: <Music className="w-5 h-5" />, label: 'Arts & Music', count: 19, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Science', count: 14, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Business', count: 22, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Add What You Teach',
    desc: 'List any skill — programming, music, language, cooking. If you know it, someone wants to learn it.',
    icon: <GraduationCap className="w-6 h-6 text-amber-600" />,
    color: 'bg-amber-50 border-amber-200',
  },
  {
    step: '02',
    title: 'Add What You Want to Learn',
    desc: 'Set your learning goals with urgency and level. Our AI instantly scans the network for the best matches.',
    icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    step: '03',
    title: 'Get Matched Instantly',
    desc: 'We show you peers with perfect skill overlap — ranked by trust score, availability, and learning level fit.',
    icon: <Users className="w-6 h-6 text-blue-600" />,
    color: 'bg-blue-50 border-blue-200',
  },
  {
    step: '04',
    title: 'Teach → Earn → Learn Free',
    desc: 'Every hour you teach earns Skill Credits. Spend credits to learn from anyone else — zero money ever changes hands.',
    icon: <Wallet className="w-6 h-6 text-purple-600" />,
    color: 'bg-purple-50 border-purple-200',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Graphic Designer → Learning Python',
    avatar: 'https://i.pravatar.cc/150?img=5',
    quote: 'I traded Figma design skills for Python lessons. Within 2 months I built my first data dashboard — completely free!',
    stars: 5,
  },
  {
    name: 'Alex Rivera',
    role: 'Developer → Learning Guitar',
    avatar: 'https://i.pravatar.cc/150?img=1',
    quote: 'I teach coding, they teach me music. SkillXchange made it feel like trading with a friend, not buying a course.',
    stars: 5,
  },
  {
    name: 'Maya Chen',
    role: 'Student → Learned Japanese',
    avatar: 'https://i.pravatar.cc/150?img=2',
    quote: 'I exchanged English conversation sessions for Japanese lessons. Got JLPT N4 certified in 4 months!',
    stars: 5,
  },
];

const FEATURE_HIGHLIGHTS = [
  { icon: <Shield className="w-5 h-5 text-emerald-600" />, title: 'Escrow Protected', desc: 'Credits are held until the session ends and both sides confirm delivery.' },
  { icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />, title: 'Verified Skills', desc: 'AI transcript proof + micro-quizzes create tamper-proof skill certificates.' },
  { icon: <Flame className="w-5 h-5 text-orange-600" />, title: 'Streak Rewards', desc: 'Daily teaching streaks earn bonus XP, badges, and visibility boosts.' },
  { icon: <Sparkles className="w-5 h-5 text-purple-600" />, title: 'Fusion Sessions', desc: 'Cross-discipline exchange workshops blending coding, design, and audio.' },
  { icon: <Mic className="w-5 h-5 text-amber-600" />, title: 'AI Voice Lab', desc: 'Practice soft skills with real-time speech analysis for clarity and confidence.' },
  { icon: <Award className="w-5 h-5 text-rose-600" />, title: 'Skill Bounties', desc: 'Post a bounty for a specific skill. Teachers bid to teach you — you pick the best.' },
];

/* ──────────────────────────────────────────────────────────── */
/* COMPONENT                                                   */
/* ──────────────────────────────────────────────────────────── */
import { AISkillDiscoveryModal } from '../innovations/AISkillDiscoveryModal';

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { allUsers, currentUser, openChatWithPeer, isAuthenticated, openAuthModal } = useApp();

  // Animated counters
  const [stats, setStats] = useState({ exchanges: 0, credits: 0, chains: 0, escrowRate: 0 });
  const [hasCounted, setHasCounted] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Search
  const [simQuery, setSimQuery] = useState('');

  // Section reveal refs
  const howItWorksReveal = useRevealOnScroll();
  const categoriesReveal = useRevealOnScroll();
  const trendingReveal   = useRevealOnScroll();
  const featuresReveal   = useRevealOnScroll();
  const testimonialsReveal = useRevealOnScroll();
  const peersReveal      = useRevealOnScroll();

  // Counter animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !hasCounted) {
          setHasCounted(true);
          const start = performance.now();
          const duration = 1000;
          const animate = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setStats({
              exchanges: Math.floor(ease * 1420),
              credits:   Math.floor(ease * 3850),
              chains:    Math.floor(ease * 428),
              escrowRate: Number((ease * 99.2).toFixed(1)),
            });
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasCounted]);

  const simulatedMatches = allUsers
    .filter(u => u.id !== currentUser.id && u.role !== 'admin')
    .filter(u => {
      if (!simQuery.trim()) return true;
      const q = simQuery.toLowerCase();
      return (
        u.skillsToTeach.some(s => s.skillName.toLowerCase().includes(q)) ||
        u.skillsToLearn.some(l => l.skillName.toLowerCase().includes(q)) ||
        u.name.toLowerCase().includes(q)
      );
    })
    .slice(0, 3);

  const featuredPeers = allUsers.filter(u => u.role !== 'admin').slice(0, 4);

  return (
    <div className="space-y-20 py-6">

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section className="relative text-center space-y-7 max-w-4xl mx-auto px-4 overflow-hidden">
        {/* Background glow blobs */}
        <div className="glow-blob w-72 h-72 bg-amber-100/60 -top-20 -left-20 opacity-60" />
        <div className="glow-blob w-72 h-72 bg-emerald-100/60 -top-10 -right-10 opacity-60" />

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm animate-float whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>1,420+ skills traded this month · Zero cash required</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 relative z-10">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.1] text-balance">
            Everyone knows{' '}
            <span className="relative inline-block text-amber-600">
              something.
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4 Q50 1 100 4 T198 4" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" className="chalk-line-anim" />
              </svg>
            </span>
            {' '}Everyone can learn{' '}
            <span className="text-emerald-600">something.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Trade skills peer-to-peer 1-on-1, practice in live interactive study rooms, and earn barter credits every time you teach.
          </p>
        </div>

        {/* Teach ⇄ Learn Pill */}
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs tracking-wide shadow-xs hover:scale-105 transition-transform whitespace-nowrap">
            <GraduationCap className="w-3.5 h-3.5" /> YOU TEACH (GIVING)
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <div className="w-8 h-px bg-slate-300" />
            <Repeat className="w-3.5 h-3.5" />
            <div className="w-8 h-px bg-slate-300" />
          </div>
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs tracking-wide shadow-xs hover:scale-105 transition-transform whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5" /> YOU LEARN (RECEIVING)
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto space-y-3 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                openAuthModal('signup');
                return;
              }
              onNavigate('matches');
            }}
            className="relative group flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full border border-slate-300 shadow-md focus-within:shadow-lg focus-within:border-slate-800 transition-all p-1.5 sm:p-1"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search a skill (Python, Guitar, UI/UX...)"
                value={simQuery}
                onChange={e => setSimQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="mt-1 sm:mt-0 px-5 py-2.5 rounded-xl sm:rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs shadow transition-all whitespace-nowrap active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Find Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Popular quick tags */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {['Python', 'Guitar', 'UI/UX', 'Japanese', 'Machine Learning', 'Yoga'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('signup');
                    return;
                  }
                  setSimQuery(tag);
                  onNavigate('matches');
                }}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-medium hover:border-slate-400 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Live search preview */}
        {simQuery.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left animate-fade-scale">
            {simulatedMatches.map(peer => (
              <div
                key={peer.id}
                onClick={() => onNavigate('matches')}
                className="paper-card peer-card p-4 space-y-2 cursor-pointer hover:border-emerald-300 transition-all bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="peer-avatar w-9 h-9 rounded-full object-cover border-2 border-slate-200 transition-all duration-300"
                  />
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-900">{peer.name}</h4>
                    <span className="text-[10px] font-mono-ledger text-emerald-700 font-bold">
                      {peer.trustScore.overallScore}/100 Trust
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-mono-ledger space-y-1">
                  <p className="text-amber-800 font-bold truncate">Teaches: {peer.skillsToTeach[0]?.skillName}</p>
                  <p className="text-emerald-800 truncate">Wants: {peer.skillsToLearn[0]?.skillName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">          {isAuthenticated && currentUser.id !== 'guest' ? (
            <>
              <button
                onClick={() => onNavigate('matches')}
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Find My Matches <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('session')}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Open Study Room <Video className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>Get Started Free</span> <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => openAuthModal('signin')}
                className="px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── 2. STATS BAR ─────────────────────────────────────── */}
      <section ref={statsRef} className="max-w-[1180px] mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Exchanges Completed', value: stats.exchanges.toLocaleString(), color: 'text-slate-900', iconEl: <Handshake className="w-5 h-5 text-slate-600" />, bg: 'bg-slate-50 border-slate-200' },
            { label: 'Credits Logged', value: `${stats.credits.toLocaleString()} CR`, color: 'text-emerald-700', iconEl: <Coins className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Chains Closed', value: `${stats.chains} Cycles`, color: 'text-amber-700', iconEl: <Repeat className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' },
            { label: 'Escrow Success', value: `${stats.escrowRate}%`, color: 'text-slate-900', iconEl: <ShieldCheck className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`paper-card p-5 sm:p-6 text-center space-y-2 bg-white animate-count-up stagger-${i + 1}`}
              style={{ opacity: hasCounted ? 1 : 0 }}
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto ${s.bg}`}>{s.iconEl}</div>
              <span className="text-[10px] uppercase font-mono-ledger font-bold text-slate-400 whitespace-nowrap">{s.label}</span>
              <p className={`font-display font-extrabold text-2xl sm:text-3xl whitespace-nowrap ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────── */}
      <section
        ref={howItWorksReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> How It Works
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Start trading in 4 simple steps</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">No money needed. No subscriptions. Just knowledge exchange.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className={`paper-card p-6 space-y-4 bg-white group transition-all ${
                howItWorksReveal.visible ? `animate-fade-in-up stagger-${i + 1}` : 'opacity-0'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl border ${step.color}`}>{step.icon}</div>
                <span className="font-mono-ledger font-black text-3xl text-slate-100 select-none">{step.step}</span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. SKILL CATEGORIES ──────────────────────────────── */}
      <section
        ref={categoriesReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">Browse by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Hundreds of skills across every domain — all tradeable.</p>
          </div>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            View all skills <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => onNavigate('matches')}
              className={`skill-cat-badge paper-card p-4 flex flex-col items-center gap-2 bg-white cursor-pointer ${
                categoriesReveal.visible ? `animate-fade-in-up stagger-${i + 1}` : 'opacity-0'
              }`}
            >
              <div className={`p-3 rounded-xl border ${cat.color}`}>{cat.icon}</div>
              <span className="font-bold text-xs text-slate-900">{cat.label}</span>
              <span className="text-[10px] font-mono-ledger text-slate-400">{cat.count} skills</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 5. TRENDING SKILLS ───────────────────────────────── */}
      <section
        ref={trendingReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" /> Trending Skills Right Now
            </h2>
            <p className="text-xs text-slate-500 mt-1">Skills with the highest demand multipliers in the network this week.</p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            View economy <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING_SKILLS.map((skill, i) => (
            <div
              key={skill.name}
              onClick={() => { setSimQuery(skill.name); onNavigate('matches'); }}
              className={`paper-card p-4 bg-white cursor-pointer group space-y-3 ${
                trendingReveal.visible ? `animate-fade-in-up stagger-${(i % 4) + 1}` : 'opacity-0'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${skill.color}`}>
                  {skill.tagIcon}
                  {skill.tag}
                </span>
                <span className="font-mono-ledger font-black text-sm text-amber-700 whitespace-nowrap">{skill.demand}</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">{skill.name}</h4>
                <p className="text-[11px] text-slate-500 font-mono-ledger mt-0.5">{skill.cat}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <ChevronRight className="w-3.5 h-3.5" /> Find teachers
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. FEATURED PEERS ────────────────────────────────── */}
      <section
        ref={peersReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">Top Peers in Your Network</h2>
            <p className="text-xs text-slate-500 mt-1">Verified teachers with the highest trust scores and active schedules.</p>
          </div>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            View all peers <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPeers.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No registered peers yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first pioneer to create an account and list your skills on the decentralized barter network!
              </p>
            </div>
          ) : (
            featuredPeers.map((peer, i) => (
              <div
                key={peer.id}
                onClick={() => onNavigate('matches')}
                className={`paper-card peer-card p-5 bg-white cursor-pointer space-y-4 ${
                  peersReveal.visible ? `animate-fade-in-up stagger-${i + 1}` : 'opacity-0'
                }`}
              >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="peer-avatar w-11 h-11 rounded-full object-cover border-2 border-slate-200 transition-all duration-300"
                />
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-900 truncate">{peer.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{peer.headline}</p>
                </div>
              </div>

              {/* Trust + streak */}
              <div className="flex items-center justify-between">
                <span className="trust-score-stamp">{peer.trustScore.overallScore}/100</span>
                <span className="flex items-center gap-1 text-[11px] font-mono-ledger text-orange-600">
                  <Flame className="w-3 h-3" /> {peer.streakDays}d streak
                </span>
              </div>

              {/* Teaches / Wants */}
              <div className="space-y-1.5 text-[11px] font-mono-ledger">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-bold shrink-0">Teaches</span>
                  <span className="text-slate-700 truncate">{peer.skillsToTeach[0]?.skillName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold shrink-0">Wants</span>
                  <span className="text-slate-700 truncate">{peer.skillsToLearn[0]?.skillName}</span>
                </div>
              </div>

              {/* Stars & Message button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3 h-3 ${j < Math.floor(peer.trustScore.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 font-mono-ledger ml-1">{peer.trustScore.averageRating.toFixed(1)}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChatWithPeer({
                      id: peer.id,
                      name: peer.name,
                      avatar: peer.avatar,
                      skill: peer.skillsToTeach[0]?.skillName || 'Skills',
                      headline: peer.headline,
                      rating: peer.trustScore.averageRating,
                    });
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-[10.5px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                  title={`Chat with ${peer.name}`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          )))}
        </div>
      </section>

      {/* ── 7. PLATFORM FEATURES ─────────────────────────────── */}
      <section
        ref={featuresReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Everything you need to exchange skills</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">One platform, 10+ tools purpose-built for peer knowledge exchange.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_HIGHLIGHTS.map((feat, i) => (
            <div
              key={feat.title}
              className={`paper-card p-5 bg-white space-y-3 group ${
                featuresReveal.visible ? `animate-fade-in-up stagger-${(i % 6) + 1}` : 'opacity-0'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 w-fit group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Feature Shortcuts */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-display font-bold text-slate-900 uppercase tracking-wide">Quick Feature Shortcuts</span>
            <span className="text-[11px] text-slate-500 font-mono-ledger">Click any tool to open directly</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3">
            {[
              { id: 'matches' as ScreenTab, label: 'Peer Matches', icon: <Users className="w-4 h-4 text-emerald-600" />, bg: 'hover:bg-emerald-50' },
              { id: 'session' as ScreenTab, label: 'Study Room', icon: <Video className="w-4 h-4 text-blue-600" />, bg: 'hover:bg-blue-50' },
              { id: 'fusion' as ScreenTab, label: 'Fusion Labs', icon: <Sparkles className="w-4 h-4 text-purple-600" />, bg: 'hover:bg-purple-50' },
              { id: 'wallet' as ScreenTab, label: 'Credits', icon: <Wallet className="w-4 h-4 text-amber-600" />, bg: 'hover:bg-amber-50' },
              { id: 'bounties' as ScreenTab, label: 'Bounties', icon: <Zap className="w-4 h-4 text-rose-600" />, bg: 'hover:bg-rose-50' },
              { id: 'soft_skills' as ScreenTab, label: 'Voice Lab', icon: <Mic className="w-4 h-4 text-amber-600" />, bg: 'hover:bg-amber-50' },
              { id: 'second_brain' as ScreenTab, label: 'Notes Wiki', icon: <BookOpen className="w-4 h-4 text-emerald-600" />, bg: 'hover:bg-emerald-50' },
              { id: 'credentials' as ScreenTab, label: 'Certificates', icon: <Lock className="w-4 h-4 text-blue-600" />, bg: 'hover:bg-blue-50' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 text-center transition-all hover:scale-105 shadow-xs group ${item.bg}`}
              >
                <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-white mb-1 transition-colors">{item.icon}</div>
                <span className="text-[11px] font-bold text-slate-800 truncate w-full">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ──────────────────────────────────── */}
      <section
        ref={testimonialsReveal.ref as React.RefObject<HTMLElement>}
        className="max-w-[1180px] mx-auto px-4 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Peers love SkillXchange</h2>
          <p className="text-sm text-slate-500">Real stories from the community.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`paper-card p-6 bg-white space-y-4 ${
                testimonialsReveal.visible ? `animate-fade-in-up stagger-${i + 1}` : 'opacity-0'
              }`}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="font-bold text-xs text-slate-900">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. MY PROGRESS SNAPSHOT (Only when authenticated) ──────────────── */}
      {isAuthenticated && currentUser.id !== 'guest' && (
        <section className="max-w-[1180px] mx-auto px-4">
          <div className="paper-card p-6 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-900">Welcome back, {currentUser.name.split(' ')[0]}!</h3>
                  <p className="text-xs text-slate-500">{currentUser.headline}</p>
                  <div className="flex items-center gap-3 text-xs font-mono-ledger">
                    <span className="flex items-center gap-1 text-orange-600 font-bold">
                      <Flame className="w-3.5 h-3.5" /> {currentUser.streakDays}-day streak
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-700 font-bold">{currentUser.xpPoints} XP</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-700 font-bold">{currentUser.creditsBalance.toFixed(1)} CR</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:border-slate-900 text-xs font-bold transition-all whitespace-nowrap"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => onNavigate('progress' as ScreenTab)}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> My Dashboard
                </button>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              {[
                { label: 'Skills Teaching', value: currentUser.skillsToTeach.length, iconEl: <GraduationCap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200', color: 'text-amber-700' },
                { label: 'Skills Learning', value: currentUser.skillsToLearn.length, iconEl: <BookOpen className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200', color: 'text-emerald-700' },
                { label: 'Teaching Hours', value: `${currentUser.teachingHours}h`, iconEl: <Clock className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700' },
                { label: 'Credits Balance', value: `${currentUser.creditsBalance.toFixed(1)} CR`, iconEl: <Coins className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 border-purple-200', color: 'text-purple-700' },
              ].map(s => (
                <div key={s.label} className="text-center space-y-2">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto ${s.bg}`}>{s.iconEl}</div>
                  <p className={`font-display font-black text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-mono-ledger text-slate-400 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 10. FINAL CTA ────────────────────────────────────── */}
      <section className="max-w-[1180px] mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-slate-900" />
          <div className="glow-blob w-64 h-64 bg-emerald-500/20 top-0 left-0" />
          <div className="glow-blob w-64 h-64 bg-amber-500/20 bottom-0 right-0" />

          <div className="relative z-10 p-10 sm:p-14 text-center space-y-5">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Ready to trade what you know?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Join thousands of students, engineers, and creators exchanging skills every day — with verified accountability, zero cash, and 99.2% escrow success.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('matches')}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Find Your First Exchange <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('session')}
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Launch Study Room <Video className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
