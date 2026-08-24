'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Share2,
  Edit3,
  Clock,
  BookOpen,
  ArrowLeftRight,
  Sparkles,
  Flame,
  Shield,
  Target,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Mail,
  User,
  AtSign,
  MapPin,
  Globe,
  Camera,
  RefreshCw,
  Send,
  Building,
  Check,
  AlertCircle,
  QrCode,
  Lock,
  Copy,
  Users,
  Video,
  Award,
  Sliders,
  ExternalLink,
  Code2,
  Layers,
  GitBranch,
  Cpu,
  Database,
  Smartphone,
  Palette,
  Terminal,
} from 'lucide-react';
import { UserSkillOffering, UserLearningGoal } from '../../types';

// Preset high quality 3D avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
];

// Helper to pick a distinct icon for each skill
const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('python')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Terminal className="w-4 h-4 text-amber-600" />
      </div>
    );
  }
  if (n.includes('design') || n.includes('ui') || n.includes('ux') || n.includes('figma')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">
        <Palette className="w-4 h-4 text-rose-500" />
      </div>
    );
  }
  if (n.includes('git') || n.includes('github')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
        <GitBranch className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (n.includes('web') || n.includes('fullstack') || n.includes('frontend')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Globe className="w-4 h-4 text-blue-600" />
      </div>
    );
  }
  if (n.includes('machine') || n.includes('ai') || n.includes('ml')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Cpu className="w-4 h-4 text-indigo-600" />
      </div>
    );
  }
  if (n.includes('structure') || n.includes('algorithm') || n.includes('dsa')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Layers className="w-4 h-4 text-sky-600" />
      </div>
    );
  }
  if (n.includes('react') || n.includes('native') || n.includes('mobile')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Smartphone className="w-4 h-4 text-cyan-600" />
      </div>
    );
  }
  if (n.includes('sql') || n.includes('data') || n.includes('database')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
        <Database className="w-4 h-4 text-purple-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
      <Code2 className="w-4 h-4 text-slate-700" />
    </div>
  );
};

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserFullProfile,
    requestEmailChange,
    addSkillToTeach,
    editSkillToTeach,
    removeSkillToTeach,
    addSkillToLearn,
    editSkillToLearn,
    removeSkillToLearn,
    credentialLedger,
    transactions,
    swapProposals,
    showToast,
  } = useApp();

  // Active Left Sidebar Tab
  const [selectedSection, setSelectedSection] = useState<
    'overview' | 'skills_teach' | 'skills_learn' | 'matches' | 'trades' | 'study_rooms' | 'achievements' | 'settings'
  >('overview');

  // Full Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editHandle, setEditHandle] = useState(currentUser.handle);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editHeadline, setEditHeadline] = useState(currentUser.headline);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editCollege, setEditCollege] = useState(currentUser.college || 'Punjab Engineering College');
  const [editLocation, setEditLocation] = useState(currentUser.location || 'Chandigarh, India');
  const [editTimezone, setEditTimezone] = useState(currentUser.timezone || 'IST (UTC+5:30)');
  const [editLanguages, setEditLanguages] = useState(currentUser.languages.join(', '));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setEditAvatar(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Email Change with Verification State
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [pendingEmailAddress, setPendingEmailAddress] = useState('');
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);

  // Teaching Skill Add / Edit Modal
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [editingTeachSkillId, setEditingTeachSkillId] = useState<string | null>(null);
  const [teachSkillName, setTeachSkillName] = useState('');
  const [teachCategory, setTeachCategory] = useState('Programming');
  const [teachLevel, setTeachLevel] = useState('Advanced');
  const [teachYears, setTeachYears] = useState(3);
  const [teachRateCredits, setTeachRateCredits] = useState(1.4);
  const [teachRateInr, setTeachRateInr] = useState(600);

  // Learning Goal Add / Edit Modal
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [editingLearnSkillId, setEditingLearnSkillId] = useState<string | null>(null);
  const [learnSkillName, setLearnSkillName] = useState('');
  const [learnTargetLevel, setLearnTargetLevel] = useState('Beginner');
  const [learnUrgency, setLearnUrgency] = useState<'flexible' | 'urgent' | 'exam_prep' | 'career_switch'>('flexible');
  const [learnProgress, setLearnProgress] = useState(40);

  // Skill Card Options Menu Dropdown state
  const [activeMenuSkillId, setActiveMenuSkillId] = useState<string | null>(null);

  // QR / Cryptographic Certificate Modal
  const [selectedCertBlock, setSelectedCertBlock] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Sync state with currentUser changes
  useEffect(() => {
    setEditName(currentUser.name);
    setEditHandle(currentUser.handle);
    setEditAvatar(currentUser.avatar);
    setEditHeadline(currentUser.headline);
    setEditBio(currentUser.bio);
    setEditCollege(currentUser.college || 'Punjab Engineering College');
    setEditLocation(currentUser.location || 'Chandigarh, India');
    setEditTimezone(currentUser.timezone || 'IST (UTC+5:30)');
    setEditLanguages(currentUser.languages.join(', '));
  }, [currentUser]);

  // Handle Full Profile Submit
  const handleSaveFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name cannot be blank.', 'warning');
      return;
    }

    let cleanHandle = editHandle.trim();
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle.replace(/[^a-zA-Z0-9_]/g, '')}`;
    }

    const langArray = editLanguages
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    setIsSavingProfile(true);
    try {
      await updateCurrentUserFullProfile({
        name: editName.trim(),
        handle: cleanHandle,
        avatar: editAvatar.trim(),
        headline: editHeadline.trim(),
        bio: editBio.trim(),
        college: editCollege.trim(),
        location: editLocation.trim(),
        timezone: editTimezone.trim(),
        languages: langArray.length > 0 ? langArray : ['English'],
      });
      setShowEditProfileModal(false);
    } catch {
      showToast('Failed to save profile changes.', 'warning');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Email Change Request with Verification
  const handleInitiateEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeError(null);

    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setEmailChangeError('Please enter a valid email address.');
      return;
    }

    setIsRequestingEmailChange(true);
    try {
      const res = await requestEmailChange(clean);
      if (res.error) {
        setEmailChangeError(res.error);
      } else {
        setPendingEmailAddress(clean);
        setEmailVerificationPending(true);
      }
    } catch (err: any) {
      setEmailChangeError(err.message || 'Failed to request email update.');
    } finally {
      setIsRequestingEmailChange(false);
    }
  };

  // Open Add Teaching Skill Modal
  const openAddTeach = () => {
    setEditingTeachSkillId(null);
    setTeachSkillName('');
    setTeachCategory('Programming');
    setTeachLevel('Intermediate');
    setTeachYears(2);
    setTeachRateCredits(1.2);
    setTeachRateInr(500);
    setShowTeachModal(true);
    setActiveMenuSkillId(null);
  };

  // Open Edit Teaching Skill Modal
  const openEditTeach = (skill: UserSkillOffering) => {
    setEditingTeachSkillId(skill.skillId);
    setTeachSkillName(skill.skillName);
    setTeachCategory(skill.category);
    setTeachLevel(skill.level);
    setTeachYears(skill.yearsExperience);
    setTeachRateCredits(skill.hourlyRateCredits || 1.2);
    setTeachRateInr(skill.hourlyRateInr || 500);
    setShowTeachModal(true);
    setActiveMenuSkillId(null);
  };

  // Submit Teaching Skill Form
  const handleSaveTeachSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachSkillName.trim()) return;

    if (editingTeachSkillId) {
      editSkillToTeach(editingTeachSkillId, {
        skillName: teachSkillName.trim(),
        category: teachCategory,
        level: teachLevel as any,
        yearsExperience: Number(teachYears),
        hourlyRateCredits: Number(teachRateCredits),
        hourlyRateInr: Number(teachRateInr),
      });
    } else {
      addSkillToTeach(teachSkillName.trim(), teachCategory, teachLevel, Number(teachYears));
    }
    setShowTeachModal(false);
  };

  // Open Add Learning Goal Modal
  const openAddLearn = () => {
    setEditingLearnSkillId(null);
    setLearnSkillName('');
    setLearnTargetLevel('Beginner');
    setLearnUrgency('flexible');
    setLearnProgress(20);
    setShowLearnModal(true);
    setActiveMenuSkillId(null);
  };

  // Open Edit Learning Goal Modal
  const openEditLearn = (goal: UserLearningGoal) => {
    setEditingLearnSkillId(goal.skillId);
    setLearnSkillName(goal.skillName);
    setLearnTargetLevel(goal.targetLevel);
    setLearnUrgency(goal.urgency);
    setLearnProgress(goal.progressPercent || 0);
    setShowLearnModal(true);
    setActiveMenuSkillId(null);
  };

  // Submit Learning Goal Form
  const handleSaveLearnGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnSkillName.trim()) return;

    if (editingLearnSkillId) {
      editSkillToLearn(editingLearnSkillId, {
        skillName: learnSkillName.trim(),
        targetLevel: learnTargetLevel as any,
        urgency: learnUrgency,
        progressPercent: Number(learnProgress),
      });
    } else {
      addSkillToLearn(learnSkillName.trim(), learnTargetLevel, learnUrgency);
    }
    setShowLearnModal(false);
  };

  // Copy Profile URL
  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied to clipboard! 🔗', 'info');
  };

  return (
    <div className="py-6 max-w-7xl w-full mx-auto px-4 sm:px-6 space-y-6 font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      {/* ══════════════════════════ 1. HERO PROFILE CARD ══════════════════════════ */}
      <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
            {/* 3D Avatar with live green indicator */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-tr from-sky-400 to-indigo-500">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                title="Online & Ready for Sessions"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {currentUser.name}
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{currentUser.handle}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.location || 'Chandigarh, India'}
                </span>
                <span>•</span>
                <span>Joined Jan 2024</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-2xl whitespace-pre-line">
                {currentUser.bio ||
                  'Passionate developer who loves teaching and learning new things.\nAlways up for a good knowledge exchange! 🚀'}
              </p>

              {/* Status Metric Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold">
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentUser.creditsBalance.toFixed(0)} Credits</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1.5 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>{currentUser.skillsToTeach.length + currentUser.skillsToLearn.length} Skills</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1.5 shadow-2xs">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentUser.trustScore.completedSessions || 43} Trades</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{currentUser.trustScore.overallScore || 97}% Match Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleShareProfile}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs cursor-pointer transition-all"
              title="Share Public Profile"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ 2. 3-COLUMN CONTENT GRID ══════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ── LEFT SIDEBAR NAVIGATION MENU (3 cols) ── */}
        <div className="md:col-span-3 space-y-1">
          <div className="bg-white rounded-3xl p-2.5 border border-slate-100 shadow-xs space-y-1">
            <button
              onClick={() => setSelectedSection('overview')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'overview'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setSelectedSection('skills_teach')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'skills_teach'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Skills I Teach</span>
            </button>

            <button
              onClick={() => setSelectedSection('skills_learn')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'skills_learn'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Skills I Want to Learn</span>
            </button>

            <button
              onClick={() => setSelectedSection('matches')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'matches'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My Matches</span>
            </button>

            <button
              onClick={() => setSelectedSection('trades')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'trades'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Trade History</span>
            </button>

            <button
              onClick={() => setSelectedSection('study_rooms')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'study_rooms'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>My Study Rooms</span>
            </button>

            <button
              onClick={() => setSelectedSection('achievements')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'achievements'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => setSelectedSection('settings')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSection === 'settings'
                  ? 'bg-slate-100/90 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ── CENTER MAIN CONTENT (6 cols) ── */}
        <div className="md:col-span-6 space-y-6">
          {/* SECTION: OVERVIEW */}
          {selectedSection === 'overview' && (
            <>
              {/* Card 1: About Me */}
              <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">About Me</h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentUser.headline ||
                    'Full-stack developer and UI/UX enthusiast. I enjoy breaking down complex topics into simple explanations. Let’s learn and grow together!'}
                </p>

                {/* Personality & Preference Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    Open to Teaching
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    Open to Learning
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    Patient
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    Communicative
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    Reliable
                  </span>
                </div>
              </div>

              {/* Card 2: Skills I Teach */}
              <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Skills I Teach</h3>
                  <button
                    onClick={() => setSelectedSection('skills_teach')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentUser.skillsToTeach.slice(0, 4).map(skill => (
                    <div
                      key={skill.skillId}
                      className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          {getSkillIcon(skill.skillName)}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuSkillId(
                                  activeMenuSkillId === skill.skillId ? null : skill.skillId
                                )
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuSkillId === skill.skillId && (
                              <div className="absolute right-0 top-6 z-20 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs font-medium animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => openEditTeach(skill)}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    removeSkillToTeach(skill.skillId);
                                    setActiveMenuSkillId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                            {skill.skillName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">{skill.level}</span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-emerald-600 font-mono-ledger">
                        {(skill.hourlyRateCredits || 1.4).toFixed(2)} CR
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Skills I Want to Learn */}
              <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Skills I Want to Learn</h3>
                  <button
                    onClick={() => setSelectedSection('skills_learn')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentUser.skillsToLearn.slice(0, 4).map(goal => (
                    <div
                      key={goal.skillId}
                      className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          {getSkillIcon(goal.skillName)}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuSkillId(
                                  activeMenuSkillId === goal.skillId ? null : goal.skillId
                                )
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuSkillId === goal.skillId && (
                              <div className="absolute right-0 top-6 z-20 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs font-medium animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => openEditLearn(goal)}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    removeSkillToLearn(goal.skillId);
                                    setActiveMenuSkillId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                            {goal.skillName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">{goal.targetLevel}</span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-emerald-600 font-mono-ledger">
                        {goal.skillName.toLowerCase().includes('machine')
                          ? '1.60 CR'
                          : goal.skillName.toLowerCase().includes('structures')
                          ? '1.30 CR'
                          : goal.skillName.toLowerCase().includes('react')
                          ? '1.40 CR'
                          : '1.10 CR'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECTION: SKILLS I TEACH (FULL VIEW) */}
          {selectedSection === 'skills_teach' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Skills You Teach</h3>
                  <p className="text-xs text-slate-500">Skills you mentor or barter with peers</p>
                </div>
                <button
                  onClick={openAddTeach}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>

              <div className="space-y-3">
                {currentUser.skillsToTeach.map(s => (
                  <div
                    key={s.skillId}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {getSkillIcon(s.skillName)}
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{s.skillName}</h4>
                        <p className="text-xs text-slate-500">
                          {s.category} • {s.yearsExperience} yrs exp • Level: {s.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono-ledger">
                        <span className="text-xs font-extrabold text-emerald-600 block">
                          {(s.hourlyRateCredits || 1.4).toFixed(2)} CR/hr
                        </span>
                        <span className="text-[10px] text-slate-400">{s.hourlyRateInr || 600} INR</span>
                      </div>

                      <button
                        onClick={() => openEditTeach(s)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeSkillToTeach(s.skillId)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SKILLS I WANT TO LEARN (FULL VIEW) */}
          {selectedSection === 'skills_learn' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Learning Roadmap & Goals</h3>
                  <p className="text-xs text-slate-500">Skills you are studying from peer mentors</p>
                </div>
                <button
                  onClick={openAddLearn}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Goal
                </button>
              </div>

              <div className="space-y-3">
                {currentUser.skillsToLearn.map(l => (
                  <div
                    key={l.skillId}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getSkillIcon(l.skillName)}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{l.skillName}</h4>
                          <span className="text-xs text-slate-500">Target: {l.targetLevel} • Urgency: {l.urgency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditLearn(l)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeSkillToLearn(l.skillId)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500 font-mono-ledger">
                        <span>Roadmap Progress</span>
                        <span className="text-emerald-700 font-bold">{l.progressPercent || 25}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${l.progressPercent || 25}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: MATCHES & BARTER PROPOSALS */}
          {selectedSection === 'matches' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Barter Matches</h3>
              <p className="text-xs text-slate-500">Active skill swap exchange proposals and peers</p>

              <div className="space-y-3">
                {swapProposals.length > 0 ? (
                  swapProposals.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{p.receiverId === currentUser.id ? p.senderName : p.receiverName}</span>
                        <span className="text-emerald-600 font-mono-ledger">{p.status.toUpperCase()}</span>
                      </div>
                      <p className="text-slate-600">
                        Offer: <strong>{p.offeredSkill}</strong> ➔ Seeking: <strong>{p.wantedSkill}</strong>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active proposals right now. Check the "Find Matches" tab to initiate barter swaps!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: TRADE HISTORY */}
          {selectedSection === 'trades' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Trade & Credits History</h3>
              <p className="text-xs text-slate-500">Record of credit earnings, learning expenditures, and escrows</p>

              <div className="space-y-2.5 font-mono-ledger text-xs">
                {transactions.map(t => (
                  <div key={t.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{t.desc}</div>
                      <div className="text-[10px] text-slate-400">{t.date}</div>
                    </div>
                    <div className={`font-bold text-sm ${t.delta >= 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {t.delta > 0 ? `+${t.delta.toFixed(2)}` : t.delta.toFixed(2)} CR
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: MY STUDY ROOMS & CERTIFICATES */}
          {selectedSection === 'study_rooms' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Live Study Rooms & SHA-256 Ledger</h3>
              <p className="text-xs text-slate-500">Tamper-evident cryptographically signed certificates</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credentialLedger.map(b => (
                  <div
                    key={b.blockIndex}
                    onClick={() => setSelectedCertBlock(b)}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer space-y-2 font-mono-ledger text-xs"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>#{b.blockIndex} • {b.skillName}</span>
                      <span className="text-emerald-600">{b.quizScorePct}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Hash: {b.blockHash}</p>
                    <span className="text-[10px] text-blue-600 font-bold">View Proof & QR ➔</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: ACHIEVEMENTS */}
          {selectedSection === 'achievements' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Achievements & Badges</h3>
              <p className="text-xs text-slate-500">Reputation milestones unlocked on SkillXchange</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentUser.badges.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="text-3xl">{b.icon}</div>
                    <div className="font-bold text-xs text-slate-900">{b.title}</div>
                    <p className="text-[11px] text-slate-500">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SETTINGS & EMAIL CHANGE */}
          {selectedSection === 'settings' && (
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Profile Settings</h3>
                  <p className="text-xs text-slate-500">Manage account information & verified email</p>
                </div>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Edit Profile Details
                </button>
              </div>

              {/* Email Card with Mandatory Verification Flow */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-mono-ledger">Current Verified Email</span>
                  <strong className="text-slate-900 font-bold text-sm">
                    {currentUser.email || 'user@skillexchange.org'}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput('');
                    setEmailVerificationPending(false);
                    setEmailChangeError(null);
                    setShowEmailChangeModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" /> Change Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR WIDGETS (3 cols) ── */}
        <div className="md:col-span-3 space-y-6">
          {/* Widget 1: Profile Completeness */}
          <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Profile Completeness</h3>

            <div className="text-sm font-bold text-emerald-600 font-mono-ledger">
              85% Complete
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
            </div>

            <p className="text-xs text-slate-500 leading-snug">
              Complete your profile to get better matches!
            </p>

            <button
              onClick={openAddLearn}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer block text-center"
            >
              Add Learning Goals
            </button>
          </div>

          {/* Widget 2: Recent Achievements */}
          <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Achievements</h3>

            <div className="space-y-3">
              {/* Item 1: 30-Day Streak */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">30-Day Streak</div>
                  <div className="text-[11px] text-slate-500 font-medium">You're on fire! 🔥</div>
                  <div className="text-[10px] text-slate-400">2 days ago</div>
                </div>
              </div>

              {/* Item 2: Super Teacher */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-amber-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">Super Teacher</div>
                  <div className="text-[11px] text-slate-500 font-medium">Taught 10+ skills</div>
                  <div className="text-[10px] text-slate-400">1 week ago</div>
                </div>
              </div>

              {/* Item 3: Top Trader */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">Top Trader</div>
                  <div className="text-[11px] text-slate-500 font-medium">Completed 25 trades</div>
                  <div className="text-[10px] text-slate-400">2 weeks ago</div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedSection('achievements')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View all achievements
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ MODAL: EDIT PROFILE ══════════════════════════ */}
      {showEditProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-slate-900" />
                Edit Profile Details
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveFullProfile} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-sans">
                {/* Avatar Selector */}
                <div className="space-y-3">
                  <label className="font-bold text-slate-800 block">Profile Photo</label>

                  {/* Current preview + preset row */}
                  <div className="flex items-center gap-3">
                    {/* Current/preview avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={editAvatar}
                        alt="Current avatar"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
                        title="Upload photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Preset quick-picks */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(av)}
                          className={`relative rounded-full overflow-hidden shrink-0 transition-transform cursor-pointer w-10 h-10 ${
                            editAvatar === av ? 'ring-2 ring-emerald-600 ring-offset-1 scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                          {editAvatar === av && (
                            <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />

                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload a photo from your device
                  </button>
                </div>

                {/* Name & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Handle / Username</label>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={e => setEditHandle(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono-ledger text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Headline</label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={e => setEditHeadline(e.target.value)}
                    placeholder="e.g. Full-stack developer & UI/UX enthusiast"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Bio Description</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed focus:outline-none focus:border-slate-900"
                  />
                </div>

                {/* Location & College */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">College / University</label>
                    <input
                      type="text"
                      value={editCollege}
                      onChange={e => setEditCollege(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={editLanguages}
                    onChange={e => setEditLanguages(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Pinned Bottom Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════ MODAL: EMAIL CHANGE WITH VERIFICATION ══════════════════════════ */}
      {showEmailChangeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowEmailChangeModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Change Email Address
              </h3>
              <button
                onClick={() => setShowEmailChangeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            {!emailVerificationPending ? (
              <form onSubmit={handleInitiateEmailChange} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Enter your new email address below. A confirmation email will be sent to the new address to verify ownership before the change takes effect.
                  </p>

                  {emailChangeError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{emailChangeError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">New Email Address</label>
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={e => setNewEmailInput(e.target.value)}
                      placeholder="new.email@example.com"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmailChangeModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRequestingEmailChange}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isRequestingEmailChange ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Verification Link</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center space-y-4 overflow-y-auto flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Check your inbox</h4>
                  <p className="text-xs text-slate-600">
                    We sent a verification link to <strong className="text-slate-900 font-mono-ledger">{pendingEmailAddress}</strong>. Please open the email and click the confirmation link to finalize your new email.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-left text-[11.5px] leading-relaxed">
                  💡 <strong>Note:</strong> Check your Spam / Promotions folder if the message does not appear in your primary inbox within 60 seconds.
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmailChangeModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  I Understand — Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════ MODAL: TEACHING SKILL ADD / EDIT ══════════════════════════ */}
      {showTeachModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowTeachModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900">
                {editingTeachSkillId ? 'Edit Teaching Skill' : 'Add Teaching Skill'}
              </h3>
              <button
                onClick={() => setShowTeachModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveTeachSkill} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Python, UI/UX Design, Git..."
                    value={teachSkillName}
                    onChange={e => setTeachSkillName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Category</label>
                    <select
                      value={teachCategory}
                      onChange={e => setTeachCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="Programming">Programming</option>
                      <option value="Design & Creative">Design</option>
                      <option value="Languages">Languages</option>
                      <option value="Arts & Music">Arts & Music</option>
                      <option value="Academics">Academics</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Level</label>
                    <select
                      value={teachLevel}
                      onChange={e => setTeachLevel(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono-ledger">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 text-[11px]">Experience (yrs)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={teachYears}
                      onChange={e => setTeachYears(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 text-[11px]">Rate (CR/hr)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={teachRateCredits}
                      onChange={e => setTeachRateCredits(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 text-[11px]">Rate (INR)</label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={teachRateInr}
                      onChange={e => setTeachRateInr(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTeachModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingTeachSkillId ? 'Save Changes' : 'Publish Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════ MODAL: LEARNING GOAL ADD / EDIT ══════════════════════════ */}
      {showLearnModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowLearnModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900">
                {editingLearnSkillId ? 'Edit Learning Goal' : 'Add Learning Goal'}
              </h3>
              <button
                onClick={() => setShowLearnModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveLearnGoal} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Skill to Learn</label>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning, Data Structures..."
                    value={learnSkillName}
                    onChange={e => setLearnSkillName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Target Level</label>
                    <select
                      value={learnTargetLevel}
                      onChange={e => setLearnTargetLevel(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Urgency</label>
                    <select
                      value={learnUrgency}
                      onChange={e => setLearnUrgency(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="urgent">Urgent</option>
                      <option value="exam_prep">Exam Prep</option>
                      <option value="career_switch">Career Switch</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono-ledger text-[11px]">
                    <label className="font-bold text-slate-800">Roadmap Progress</label>
                    <span className="text-emerald-700 font-bold">{learnProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={learnProgress}
                    onChange={e => setLearnProgress(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLearnModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingLearnSkillId ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════ MODAL: CERTIFICATE QR & HASH PROOF ══════════════════════════ */}
      {selectedCertBlock && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCertBlock(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Certificate Block #{selectedCertBlock.blockIndex}
              </h3>
              <button
                onClick={() => setSelectedCertBlock(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Proof Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 font-mono-ledger text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Skill Domain:</span>
                  <strong className="text-slate-900">{selectedCertBlock.skillName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Learner:</span>
                  <strong className="text-slate-900">{selectedCertBlock.learnerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mentor:</span>
                  <strong className="text-slate-900">{selectedCertBlock.teacherName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Micro-Quiz Score:</span>
                  <strong className="text-emerald-700 font-black">{selectedCertBlock.quizScorePct}% (Passed)</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 text-[10px] break-all">
                <div className="flex items-center justify-between text-slate-400 font-bold">
                  <span>SHA-256 Block Hash:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCertBlock.blockHash);
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                      showToast('Hash copied! 📋', 'info');
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-emerald-300 font-mono">{selectedCertBlock.blockHash}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-3">
                <QrCode className="w-9 h-9 text-slate-800 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">Decentralized Verification URL</div>
                  <div className="truncate text-slate-500">{selectedCertBlock.verificationUrl}</div>
                </div>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCertBlock(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
