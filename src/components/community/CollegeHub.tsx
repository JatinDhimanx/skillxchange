'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  Users,
  Search,
  MessageSquare,
  Sparkles,
  Plus,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Send,
  X,
  Award,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface CampusStudyCircle {
  id: string;
  name: string;
  college: string;
  department: string;
  topic: string;
  leadMentor: string;
  membersCount: number;
  maxMembers: number;
  meetingTime: string;
  description: string;
  joined?: boolean;
}

interface CampusNoticeRequest {
  id: string;
  authorName: string;
  authorCollege: string;
  authorAvatar: string;
  subject: string;
  description: string;
  creditReward: number;
  urgency: 'Today' | 'This Week' | 'Flexible';
  datePosted: string;
  responsesCount: number;
  responded?: boolean;
}

const DEFAULT_STUDY_CIRCLES: CampusStudyCircle[] = [
  {
    id: 'circle-1',
    name: 'DSA & LeetCode Hard Sprint',
    college: 'IIT Delhi',
    department: 'Computer Science',
    topic: 'Dynamic Programming & Graphs',
    leadMentor: 'Aarav Sharma',
    membersCount: 14,
    maxMembers: 20,
    meetingTime: 'Tues & Thurs @ 7:00 PM',
    description: 'Weekly peer mock interviews, code walkthroughs, and hard graph problem breakdown sessions.',
  },
  {
    id: 'circle-2',
    name: 'Applied Machine Learning & LLM Guild',
    college: 'BITS Pilani',
    department: 'AI & Data Science',
    topic: 'PyTorch & Fine-Tuning',
    leadMentor: 'Priya Sharma',
    membersCount: 19,
    maxMembers: 25,
    meetingTime: 'Saturdays @ 5:00 PM',
    description: 'Hands-on exploration of LoRA fine-tuning, retrieval-augmented generation, and deployment pipelines.',
  },
  {
    id: 'circle-3',
    name: 'UI/UX & Interactive Design Studio',
    college: 'BMS Institute of Technology',
    department: 'Design & Media',
    topic: 'Figma Systems & Motion UI',
    leadMentor: 'Rohan Patel',
    membersCount: 12,
    maxMembers: 15,
    meetingTime: 'Wednesdays @ 6:30 PM',
    description: 'Critique circles, design system token architecture, and Figma auto-layout best practices.',
  },
  {
    id: 'circle-4',
    name: 'Systems & Kernel Hacking Circle',
    college: 'Delhi Technological University',
    department: 'Software Engineering',
    topic: 'Rust & OS Internals',
    leadMentor: 'Devendra Rao',
    membersCount: 8,
    maxMembers: 12,
    meetingTime: 'Sundays @ 11:00 AM',
    description: 'Operating systems lab assignments, concurrent memory models, and Rust async runtime analysis.',
  },
];

const DEFAULT_CAMPUS_REQUESTS: CampusNoticeRequest[] = [
  {
    id: 'req-1',
    authorName: 'Ananya Verma',
    authorCollege: 'IIT Delhi',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    subject: 'Computer Networks (OSI & Socket Programming in C)',
    description: 'Need help debugging TCP multi-threaded socket server before semester lab evaluation this Friday.',
    creditReward: 1.5,
    urgency: 'This Week',
    datePosted: '2 hours ago',
    responsesCount: 3,
  },
  {
    id: 'req-2',
    authorName: 'Vikram Mehta',
    authorCollege: 'BITS Pilani',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    subject: 'Linear Algebra & Principal Component Analysis (PCA)',
    description: 'Looking for a peer to explain SVD mathematical decomposition intuition and NumPy matrix factorization.',
    creditReward: 2.0,
    urgency: 'Today',
    datePosted: '5 hours ago',
    responsesCount: 5,
  },
  {
    id: 'req-3',
    authorName: 'Sneha Roy',
    authorCollege: 'BMS Institute of Technology',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    subject: 'Next.js 15 App Router & Server Actions Walkthrough',
    description: 'Need someone experienced to review my college capstone full-stack project architecture.',
    creditReward: 1.0,
    urgency: 'Flexible',
    datePosted: 'Yesterday',
    responsesCount: 2,
  },
];

export const CollegeHub: React.FC = () => {
  const {
    currentUser,
    allUsers,
    openChatWithPeer,
    invitePeerToStudyRoom,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'peers' | 'leaderboard' | 'circles' | 'requests'>('peers');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All Campuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Circles & Requests State
  const [studyCircles, setStudyCircles] = useState<CampusStudyCircle[]>(DEFAULT_STUDY_CIRCLES);
  const [campusRequests, setCampusRequests] = useState<CampusNoticeRequest[]>(DEFAULT_CAMPUS_REQUESTS);

  // Modals
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);

  // New Circle Form
  const [circleName, setCircleName] = useState('');
  const [circleDept, setCircleDept] = useState('Computer Science');
  const [circleTopic, setCircleTopic] = useState('');
  const [circleTime, setCircleTime] = useState('Saturdays @ 6:00 PM');
  const [circleDesc, setCircleDesc] = useState('');

  // New Request Form
  const [requestSubject, setRequestSubject] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestReward, setRequestReward] = useState(1.5);
  const [requestUrgency, setRequestUrgency] = useState<'Today' | 'This Week' | 'Flexible'>('This Week');

  // List of distinct colleges
  const collegeList = [
    'All Campuses',
    'IIT Delhi',
    'BITS Pilani',
    'BMS Institute of Technology',
    'Delhi Technological University',
    'Stanford University',
  ];

  // Filtered Peers
  const collegeUsers = allUsers.filter(u => {
    const matchesCollege =
      selectedCollegeFilter === 'All Campuses' ||
      (u.college && u.college.toLowerCase().includes(selectedCollegeFilter.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college && u.college.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.skillsToTeach.some(s => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCollege && matchesSearch;
  });

  // Filtered Circles
  const filteredCircles = studyCircles.filter(c => {
    const matchesCollege =
      selectedCollegeFilter === 'All Campuses' ||
      c.college.toLowerCase().includes(selectedCollegeFilter.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollege && matchesSearch;
  });

  // Filtered Requests
  const filteredRequests = campusRequests.filter(r => {
    const matchesCollege =
      selectedCollegeFilter === 'All Campuses' ||
      r.authorCollege.toLowerCase().includes(selectedCollegeFilter.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollege && matchesSearch;
  });

  // Toggle Join Circle
  const toggleJoinCircle = (circleId: string) => {
    setStudyCircles(prev =>
      prev.map(c => {
        if (c.id === circleId) {
          const joined = !c.joined;
          return {
            ...c,
            joined,
            membersCount: joined ? c.membersCount + 1 : c.membersCount - 1,
          };
        }
        return c;
      })
    );
    showToast('Study Circle membership updated! 🎓', 'success');
  };

  // Help Peer Request
  const handleHelpPeer = (req: CampusNoticeRequest) => {
    setCampusRequests(prev =>
      prev.map(r => (r.id === req.id ? { ...r, responded: true, responsesCount: r.responsesCount + 1 } : r))
    );
    openChatWithPeer({
      id: `peer-${req.authorName.toLowerCase().replace(/\s+/g, '-')}`,
      name: req.authorName,
      avatar: req.authorAvatar,
      skill: req.subject,
      college: req.authorCollege,
      status: 'online',
    });
    showToast(`Connected with ${req.authorName} to assist on "${req.subject}"! 💬`, 'success');
  };

  // Submit New Circle
  const handleCreateCircleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleName.trim() || !circleTopic.trim()) {
      showToast('Please fill in Circle Name and Topic.', 'warning');
      return;
    }

    const newCircle: CampusStudyCircle = {
      id: `circle-${Date.now()}`,
      name: circleName.trim(),
      college: currentUser.college || 'IIT Delhi',
      department: circleDept,
      topic: circleTopic.trim(),
      leadMentor: currentUser.name,
      membersCount: 1,
      maxMembers: 20,
      meetingTime: circleTime.trim(),
      description: circleDesc.trim() || 'Collaborative campus peer study guild.',
      joined: true,
    };

    setStudyCircles(prev => [newCircle, ...prev]);
    setCircleName('');
    setCircleTopic('');
    setCircleDesc('');
    setShowCreateCircleModal(false);
    showToast(`Campus Study Circle "${newCircle.name}" created! 🚀`, 'success');
  };

  // Submit New Request
  const handlePostRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim() || !requestDesc.trim()) {
      showToast('Please enter subject and description.', 'warning');
      return;
    }

    const newReq: CampusNoticeRequest = {
      id: `req-${Date.now()}`,
      authorName: currentUser.name,
      authorCollege: currentUser.college || 'IIT Delhi',
      authorAvatar: currentUser.avatar,
      subject: requestSubject.trim(),
      description: requestDesc.trim(),
      creditReward: requestReward,
      urgency: requestUrgency,
      datePosted: 'Just now',
      responsesCount: 0,
    };

    setCampusRequests(prev => [newReq, ...prev]);
    setRequestSubject('');
    setRequestDesc('');
    setShowPostRequestModal(false);
    showToast('Campus study request posted to noticeboard! 📌', 'success');
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Campus .EDU Skill Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              Verified University Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Connect with verified peers in your university. Exchange academic, technical, and creative skills with zero friction.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPostRequestModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Study Request</span>
          </button>

          <button
            onClick={() => setShowCreateCircleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Create Study Circle</span>
          </button>
        </div>
      </div>

      {/* ── Institutional Verification Bar ───────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-slate-900">
                {currentUser.college || 'IIT Delhi'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Institutional .EDU Verified
              </span>
            </div>
            <span className="text-xs text-slate-500 font-sans">
              Peer ID: <strong className="text-slate-700 font-mono-ledger">{currentUser.handle || '@peer_member'}</strong>
            </span>
          </div>
        </div>

        {/* Campus Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-ledger text-slate-400 font-bold uppercase">Campus:</span>
          <select
            value={selectedCollegeFilter}
            onChange={e => setSelectedCollegeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
          >
            {collegeList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs & Search ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveSubTab('peers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'peers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-slate-800" />
            <span>Peers ({collegeUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('circles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'circles'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Study Circles ({filteredCircles.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Noticeboard ({filteredRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'leaderboard'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campus peers & topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* ── TAB 1: CAMPUS PEERS DIRECTORY ────────────────────────────────── */}
      {activeSubTab === 'peers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collegeUsers.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-base text-slate-900">No Peers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No verified students match your current campus and search filter.
              </p>
            </div>
          ) : (
            collegeUsers.map(user => (
              <div
                key={user.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                          {user.name}
                        </h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] font-mono-ledger text-slate-500 truncate">
                        {user.college || 'Partner University'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono-ledger font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {user.trustScore.overallScore}/100 Trust
                        </span>
                        <span className="text-[10px] font-mono-ledger text-slate-500">
                          {user.teachingHours}h Taught
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono-ledger">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Can Teach:</span>
                      <span className="text-slate-900 font-bold truncate block">
                        {user.skillsToTeach[0]?.skillName || 'General Tech'}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/70" />
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Wants to Learn:</span>
                      <span className="text-emerald-700 font-bold truncate block">
                        {user.skillsToLearn[0]?.skillName || 'Music & Design'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() =>
                      openChatWithPeer({
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        skill: user.skillsToTeach[0]?.skillName || 'General Tech',
                        college: user.college,
                        status: 'online',
                      })
                    }
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => {
                      invitePeerToStudyRoom(user.id, user.skillsToTeach[0]?.skillName || 'Peer Exchange');
                      showToast(`Invited ${user.name} to live study session! 🚀`, 'success');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 font-sans"
                  >
                    <span>Request</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: CAMPUS STUDY CIRCLES ──────────────────────────────────── */}
      {activeSubTab === 'circles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredCircles.map(circle => (
            <div
              key={circle.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono-ledger font-bold uppercase text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                    {circle.department}
                  </span>
                  <span className="text-xs font-mono-ledger font-bold text-slate-500">
                    {circle.college}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    {circle.name}
                  </h3>
                  <span className="text-xs font-mono-ledger font-bold text-emerald-700 mt-0.5 block">
                    Focus: {circle.topic}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {circle.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono-ledger space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Lead Mentor:</span>
                    <strong className="text-slate-900">{circle.leadMentor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <strong className="text-slate-900">{circle.meetingTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <strong className="text-purple-700">{circle.membersCount} / {circle.maxMembers} Students</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono-ledger text-emerald-700 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Peer Study Room Ready
                </span>

                <button
                  onClick={() => toggleJoinCircle(circle.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    circle.joined
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95'
                  }`}
                >
                  {circle.joined ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Joined Circle</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join Circle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: CAMPUS NOTICEBOARD / REQUESTS ──────────────────────────── */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={req.authorAvatar}
                  alt={req.authorName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-sm text-slate-900">{req.subject}</h3>
                    <span className="text-[10px] font-mono-ledger font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {req.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans max-w-2xl leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono-ledger text-slate-400">
                    <span>Posted by <strong className="text-slate-700">{req.authorName}</strong> ({req.authorCollege})</span>
                    <span>•</span>
                    <span>{req.datePosted}</span>
                    <span>•</span>
                    <span className="text-purple-600 font-bold">{req.responsesCount} offers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] font-mono-ledger text-slate-400 uppercase font-bold block">Reward</span>
                  <span className="font-display font-black text-base text-emerald-700">{req.creditReward} Credits</span>
                </div>

                <button
                  onClick={() => handleHelpPeer(req)}
                  disabled={req.responded}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
                    req.responded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95'
                  }`}
                >
                  {req.responded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Offer Sent</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Help Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: CAMPUS LEADERBOARD ────────────────────────────────────── */}
      {activeSubTab === 'leaderboard' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Campus Skill Leaderboard (Top Mentors)
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Ranked by verified teaching hours, peer trust scores, and barter session completions.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Season 2026 Active
            </span>
          </div>

          <div className="space-y-3">
            {collegeUsers.map((user, idx) => (
              <div
                key={user.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/80 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-display font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-900 border border-orange-300'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-slate-900">{user.name}</h3>
                      <span className="text-xs font-mono-ledger text-slate-500">({user.college || 'Peer'})</span>
                    </div>
                    <p className="text-xs font-sans text-slate-600">
                      Primary Subject: <strong className="text-slate-800">{user.skillsToTeach[0]?.skillName || 'Computer Science'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono-ledger text-left sm:text-right flex-wrap">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Teaching</span>
                    <span className="font-bold text-slate-900">{user.teachingHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Trust Score</span>
                    <span className="font-bold text-emerald-700">{user.trustScore.overallScore}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">XP Points</span>
                    <span className="font-bold text-amber-700">{user.xpPoints} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE STUDY CIRCLE MODAL ────────────────────────────────────── */}
      {showCreateCircleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Create Campus Study Circle
                </h3>
              </div>
              <button
                onClick={() => setShowCreateCircleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Circle Name *
                </label>
                <input
                  type="text"
                  value={circleName}
                  onChange={e => setCircleName(e.target.value)}
                  placeholder="e.g. Distributed Systems & Raft Paper Study"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Department
                  </label>
                  <input
                    type="text"
                    value={circleDept}
                    onChange={e => setCircleDept(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={circleTime}
                    onChange={e => setCircleTime(e.target.value)}
                    placeholder="e.g. Fridays @ 6:00 PM"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Core Topic / Curriculum *
                </label>
                <input
                  type="text"
                  value={circleTopic}
                  onChange={e => setCircleTopic(e.target.value)}
                  placeholder="e.g. Paxos, Raft, Byzantine Fault Tolerance"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={circleDesc}
                  onChange={e => setCircleDesc(e.target.value)}
                  placeholder="What will members work on together?"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCircleModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Publish Circle 🎓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── POST STUDY REQUEST MODAL ─────────────────────────────────────── */}
      {showPostRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Post Campus Study Request
                </h3>
              </div>
              <button
                onClick={() => setShowPostRequestModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostRequestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Subject / Academic Topic *
                </label>
                <input
                  type="text"
                  value={requestSubject}
                  onChange={e => setRequestSubject(e.target.value)}
                  placeholder="e.g. Database Management Systems (SQL Normalization)"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Credit Reward
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={requestReward}
                    onChange={e => setRequestReward(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                    Urgency
                  </label>
                  <select
                    value={requestUrgency}
                    onChange={e => setRequestUrgency(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="Today">Today (Urgent)</option>
                    <option value="This Week">This Week</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Details & What You Need Help With *
                </label>
                <textarea
                  rows={3}
                  value={requestDesc}
                  onChange={e => setRequestDesc(e.target.value)}
                  placeholder="Describe the specific problem or concept you'd like a peer mentor to walk you through..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostRequestModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Post to Noticeboard 📌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
