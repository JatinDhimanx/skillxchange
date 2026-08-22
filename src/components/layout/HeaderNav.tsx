'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronDown, Bell, Plus, Sparkles, Lock, Mic,
  BookOpen, GraduationCap, Coins, Menu, X,
  Check, Users, Repeat, Video, Wallet, Compass, BarChart2,
  CheckCheck, Trash2, Inbox, LogIn, LogOut, UserPlus,
} from 'lucide-react';

export type ScreenTab =
  | 'home' | 'matches' | 'chains' | 'graph' | 'session'
  | 'wallet' | 'bounties' | 'fusion' | 'second_brain'
  | 'credentials' | 'soft_skills' | 'college' | 'profile' | 'progress';

interface HeaderNavProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentTab, onSelectTab }) => {
  const {
    currentUser, allUsers, switchUser, notifications,
    markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications,
    addSkillToTeach, addSkillToLearn,
    isAuthenticated, openAuthModal, logoutUser,
  } = useApp();

  const [showNotifications,  setShowNotifications]  = useState(false);
  const [notifFilter,        setNotifFilter]        = useState<'all' | 'unread'>('all');
  const [showAddSkillModal,  setShowAddSkillModal]   = useState(false);
  const [showLabsDropdown,   setShowLabsDropdown]    = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [mobileMenuOpen,     setMobileMenuOpen]      = useState(false);

  const [skillType, setSkillType] = useState<'teach' | 'learn'>('teach');
  const [skillName, setSkillName] = useState('');
  const [category,  setCategory]  = useState('Programming');
  const [level,     setLevel]     = useState('Intermediate');
  const [years,     setYears]     = useState(3);

  const unreadCount = notifications.filter(n => !n.read).length;
  const navRef = useRef<HTMLDivElement | null>(null);

  // Close all dropdowns and modals on outside click & Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
        setShowLabsDropdown(false);
        setShowPersonaDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowLabsDropdown(false);
        setShowPersonaDropdown(false);
        setShowAddSkillModal(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu or modal is open
  useEffect(() => {
    document.body.style.overflow = (mobileMenuOpen || showAddSkillModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, showAddSkillModal]);

  const mainNavItems: { id: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home',     label: 'Home',         icon: <Compass  className="w-4 h-4" /> },
    { id: 'matches',  label: 'Find Matches',  icon: <Users    className="w-4 h-4" /> },
    { id: 'session',  label: 'Study Room',    icon: <Video    className="w-4 h-4" /> },
    { id: 'wallet',   label: 'My Credits',    icon: <Wallet   className="w-4 h-4" /> },
    { id: 'progress', label: 'My Progress',   icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const innovationItems: { id: ScreenTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'soft_skills',  label: 'AI Voice Lab',       icon: <Mic          className="w-4 h-4 text-amber-600"  />, desc: 'Speech cadence & clarity analyzer'      },
    { id: 'second_brain', label: 'Second Brain',        icon: <BookOpen     className="w-4 h-4 text-emerald-600"/>, desc: 'Auto session wiki & flashcards'          },
    { id: 'credentials',  label: 'Credential Ledger',   icon: <Lock         className="w-4 h-4 text-blue-600"  />, desc: 'SHA-256 verifiable certificates'          },
    { id: 'fusion',       label: 'Fusion Sessions',     icon: <Sparkles     className="w-4 h-4 text-purple-600"/>, desc: 'Cross-skill hybrid classes'               },
    { id: 'college',      label: 'Campus .EDU Hub',     icon: <GraduationCap className="w-4 h-4 text-emerald-600"/>, desc: 'Verified university peer network'  },
  ];

  const isLabActive = innovationItems.some(i => i.id === currentTab);

  const handleTabClick = (tab: ScreenTab) => {
    onSelectTab(tab);
    setShowLabsDropdown(false);
    setShowPersonaDropdown(false);
    setShowNotifications(false);
    setMobileMenuOpen(false);
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    if (skillType === 'teach') addSkillToTeach(skillName, category, level, years);
    else addSkillToLearn(skillName, level, 'flexible');
    setSkillName('');
    setShowAddSkillModal(false);
  };

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-50 w-full bg-white/96 backdrop-blur-md border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-[1320px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* ── BRAND ─────────────────────────────── */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-display font-black text-xs sm:text-sm shadow-sm shrink-0 group-hover:bg-slate-800 transition-colors">
              SX
            </div>
            <span className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
              Skill<span className="text-amber-600">X</span>change
            </span>
          </div>

          {/* ── DESKTOP NAV (Only when logged in) ──────────────────────── */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center flex-nowrap shrink-0 gap-0.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/80">
              {mainNavItems.map(item => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* AI Labs Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setShowLabsDropdown(!showLabsDropdown);
                    setShowNotifications(false);
                    setShowPersonaDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isLabActive
                      ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>AI Labs</span>
                  <ChevronDown className={`w-3 h-3 opacity-60 shrink-0 transition-transform duration-200 ${showLabsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLabsDropdown && (
                  <div className="absolute left-0 mt-2 w-72 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 space-y-1 animate-slide-down">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider text-slate-400">
                        AI Innovation Labs
                      </span>
                    </div>
                    {innovationItems.map(lab => (
                      <button
                        key={lab.id}
                        onClick={() => handleTabClick(lab.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all text-xs cursor-pointer ${
                          currentTab === lab.id ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200/60 shrink-0">{lab.icon}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 whitespace-nowrap">{lab.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{lab.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* ── RIGHT ACTIONS ─────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Add Skill (Only when authenticated) */}
            {isAuthenticated && (
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold transition-all shrink-0 whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Add skill</span>
              </button>
            )}

            {/* Notifications (Only when authenticated) */}
            {isAuthenticated && (
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowLabsDropdown(false);
                    setShowPersonaDropdown(false);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 transition-all relative shrink-0 cursor-pointer"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 space-y-2.5 animate-slide-down">
                  {/* Top Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-xs text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono-ledger font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-700 text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-700 text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                            title="Clear all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 text-[11px] font-semibold">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`flex-1 py-1 rounded-md text-center transition-all ${
                          notifFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`flex-1 py-1 rounded-md text-center transition-all ${
                          notifFilter === 'unread' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>
                  )}

                  {/* Notification List */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {(() => {
                      const list = notifications.filter(n => notifFilter === 'all' || !n.read);
                      if (list.length === 0) {
                        return (
                          <div className="py-6 text-center text-slate-400 space-y-1">
                            <Inbox className="w-6 h-6 mx-auto text-slate-300" />
                            <p className="text-xs font-medium">All caught up!</p>
                            <p className="text-[10px] text-slate-400">No {notifFilter === 'unread' ? 'unread ' : ''}notifications</p>
                          </div>
                        );
                      }
                      return list.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.type === 'chain') handleTabClick('chains');
                            else if (n.type === 'credit') handleTabClick('wallet');
                            else if (n.type === 'proof') handleTabClick('credentials');
                            else handleTabClick('matches');
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? 'bg-slate-50/70 border-slate-200/60 text-slate-600 hover:bg-slate-100/80'
                              : 'bg-amber-50/80 border-amber-200 text-slate-900 hover:bg-amber-100/70 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>}
                              <span className="font-bold text-slate-900 text-xs truncate">{n.title}</span>
                            </div>
                            <span className="text-[9.5px] font-mono-ledger text-slate-400 whitespace-nowrap shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Auth / Persona switcher */}
            {isAuthenticated ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setShowPersonaDropdown(!showPersonaDropdown);
                    setShowLabsDropdown(false);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all shrink-0"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover border border-slate-300 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline whitespace-nowrap">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showPersonaDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showPersonaDropdown && (
                  <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 space-y-2 animate-slide-down">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono-ledger truncate">{currentUser.handle}</p>
                        <span className="inline-flex text-[9px] font-mono-ledger font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 mt-1">
                          Verified Member
                        </span>
                      </div>
                    </div>



                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <button
                        onClick={() => handleTabClick('profile')}
                        className="w-full py-1.5 px-3 rounded-xl text-center font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        View Full Profile
                      </button>
                      <button
                        onClick={() => { logoutUser(); setShowPersonaDropdown(false); }}
                        className="w-full py-1.5 px-3 rounded-xl text-center font-bold text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Get Started
                </button>
              </div>
            )}

            {/* Hamburger — mobile/tablet (Only when logged in) */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shrink-0 active:scale-90 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* ── MOBILE DRAWER ──────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg animate-mobile-drawer overflow-y-auto max-h-[80vh]">
            <div className="px-4 py-5 space-y-5">

              {/* Main Nav Grid */}
              <div>
                <p className="text-[10px] font-mono-ledger font-bold uppercase tracking-widest text-slate-400 mb-2">Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {mainNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        currentTab === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Labs */}
              <div>
                <p className="text-[10px] font-mono-ledger font-bold uppercase tracking-widest text-slate-400 mb-2">AI Innovation Labs</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {innovationItems.map(lab => (
                    <button
                      key={lab.id}
                      onClick={() => handleTabClick(lab.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        currentTab === lab.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">{lab.icon}</div>
                      <div className="text-left">
                        <p className="font-bold">{lab.label}</p>
                        <p className="text-[10px] opacity-70">{lab.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="pt-3 border-t border-slate-100">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setShowAddSkillModal(true); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center shadow-xs transition-colors cursor-pointer"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── ADD SKILL MODAL ─────────────────────────────────── */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddSkillModal(false)}>
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-down sm:animate-fade-scale"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                  Add {skillType === 'teach' ? 'Teaching' : 'Learning'} Skill
                </h3>
                <button onClick={() => setShowAddSkillModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Teach / Learn Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-slate-100 border border-slate-200">
                {(['teach', 'learn'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSkillType(type)}
                    className={`py-2 text-xs font-bold rounded-full transition-all ${
                      skillType === type
                        ? type === 'teach' ? 'bg-amber-500 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'teach' ? 'I can Teach' : 'I want to Learn'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddSkillSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Python, Guitar, Figma..."
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                      {['Programming', 'Languages', 'Design', 'Arts & Music', 'Soft Skills', 'Science', 'Business'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block">Level</label>
                    <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {skillType === 'teach' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block">Years of Experience</label>
                    <input
                      type="number" min={1} max={30} value={years}
                      onChange={e => setYears(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono-ledger"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddSkillModal(false)} className="flex-1 py-3 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-xs">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-full text-white font-bold text-xs transition-all active:scale-95 ${
                      skillType === 'teach' ? 'bg-amber-500 hover:bg-amber-600 shadow-sm' : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    Add {skillType === 'teach' ? 'Skill to Teach' : 'Learning Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
