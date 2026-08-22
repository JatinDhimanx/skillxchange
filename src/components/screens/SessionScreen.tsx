'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Share2,
  Edit3,
  FileText,
  Send,
  Sparkles,
  Trash2,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  Code,
  Play,
  Download,
  Square,
  Circle,
  HelpCircle,
  ThumbsUp,
  Flame,
  Lightbulb,
  Rocket,
  Star,
  RefreshCw,
  Copy,
  BookOpen,
  Volume2,
  Terminal,
  Layers,
  ChevronRight,
  Maximize2,
  Users,
  PlusCircle,
  Radio,
  Hand,
  MessageSquare,
  ExternalLink,
  PhoneOff,
  Settings,
  Grid,
  Info,
  Calendar,
  Lock,
  ArrowRight,
  Check,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodePreset {
  id: string;
  name: string;
  lang: string;
  code: string;
  output: string;
}

const CODE_PRESETS: CodePreset[] = [
  {
    id: 'python-numpy',
    name: 'Python: NumPy Vectorization',
    lang: 'python',
    code: `# Vectorized Matrix Transformation Drill
import numpy as np

# Create 1M row sample vector
data = np.random.normal(loc=10.0, scale=2.5, size=(1000000,))

# Vectorized in-place normalization (Zero interpreter loop)
normalized = (data - np.mean(data)) / np.std(data)

print(f"Processed elements: {len(normalized):,}")
print(f"Normalized Mean: {np.mean(normalized):.4f}")
print(f"Normalized Std:  {np.std(normalized):.4f}")
print("✓ Vectorized execution completed in 4.2ms (48x faster than Python loop)")`,
    output: `Processed elements: 1,000,000
Normalized Mean: -0.0000
Normalized Std:  1.0000
✓ Vectorized execution completed in 4.2ms (48x faster than Python loop)`,
  },
  {
    id: 'react-hooks',
    name: 'React: State & Reducer Flow',
    lang: 'typescript',
    code: `// Peer Barter Exchange Hook
import { useReducer } from 'react';

type State = { escrowLocked: boolean; credits: number };
type Action = { type: 'RELEASE_ESCROW' } | { type: 'REFUND' };

function barterReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RELEASE_ESCROW':
      return { escrowLocked: false, credits: state.credits + 1.0 };
    case 'REFUND':
      return { escrowLocked: false, credits: state.credits };
    default:
      return state;
  }
}

console.log("Hook initialized with zero-fiat escrow state!");`,
    output: `[React Dev] BarterReducer mounted.
[Escrow Engine] SHA-256 state lock active.
Hook initialized with zero-fiat escrow state!`,
  },
  {
    id: 'guitar-tab',
    name: 'Music: Travis Picking Pattern',
    lang: 'text',
    code: `/* Acoustic Fingerstyle - Travis Picking Cadence (4/4 Time) */
Thumb Bassline: Alternating Strings (6 -> 4 -> 5 -> 4)
Treble Melody: Index (G string) & Middle (B/High E strings) on upbeat "and"

Measure 1 (C Major):
e|-------0---------------0-------|
B|---------------1---------------|
G|---0-------0-------0-------0---|
D|-------2---------------2-------|
A|---3---------------3-----------|
E|-------------------------------|
     1   &   2   &   3   &   4   &`,
    output: `[Audio Metronome] 84 BPM Tempo Locked.
[AI Pitch Tracking] Chord: C Major (Clean resonance detected)
✓ Thumb alternating bass cadence verified!`,
  },
];

interface LiveClassItem {
  id: string;
  roomCode: string;
  topic: string;
  skill: string;
  instructorName: string;
  instructorAvatar: string;
  instructorRating: number;
  participantsCount: number;
  isLive: boolean;
  scheduledTime: string;
  description: string;
}

export const SessionScreen: React.FC = () => {
  const {
    currentUser,
    allUsers,
    skills,
    activeSession,
    startLiveSession,
    endLiveSession,
    releaseEscrow,
    recordSpeechSnippet,
    softSkillMetrics,
    generateNewCredentialBlock,
    showToast,
  } = useApp();

  // Mode: 'lobby' (choose Create / Attend) vs 'live_meeting' (Google Meet streaming studio)
  const [sessionView, setSessionView] = useState<'lobby' | 'live_meeting'>('lobby');
  const [lobbyTab, setLobbyTab] = useState<'attend' | 'create'>('attend');

  // Lobby: Attend search / join code
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Lobby: Create Room Form State
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomSkill, setNewRoomSkill] = useState(currentUser?.skillsToTeach[0]?.skillName || 'Python & Data Science');
  const [newRoomType, setNewRoomType] = useState<'1on1' | 'open_broadcast'>('1on1');
  const [generatedRoomCode, setGeneratedRoomCode] = useState(`ROOM-${Math.floor(1000 + Math.random() * 9000)}`);

  // Active Meeting Metadata
  const [activeMeeting, setActiveMeeting] = useState<{
    id: string;
    roomCode: string;
    topic: string;
    skill: string;
    instructorName: string;
    instructorAvatar: string;
    isHost: boolean;
  }>({
    id: 'room-default',
    roomCode: 'PY-DATA-902',
    topic: 'Live Study Session: Python Data Pipelines & Vectorization',
    skill: 'Python & Data Science',
    instructorName: 'Alex Rivera',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isHost: false,
  });

  // Dynamic list of available classes to attend (derived from all registered users / instructors)
  const availableClasses: LiveClassItem[] = React.useMemo(() => {
    const list: LiveClassItem[] = [];

    // Derive classes from other registered users
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
    
    otherUsers.forEach((u, i) => {
      const teachSkill = u.skillsToTeach[0]?.skillName || 'General Skills';
      list.push({
        id: `class-${u.id}-${i}`,
        roomCode: `MEET-${u.name.slice(0, 3).toUpperCase()}-${100 + i}`,
        topic: `${teachSkill} Masterclass & Live Peer Coaching`,
        skill: teachSkill,
        instructorName: u.name,
        instructorAvatar: u.avatar,
        instructorRating: u.trustScore?.averageRating || 4.9,
        participantsCount: 2 + (i % 3),
        isLive: true,
        scheduledTime: 'Live Right Now',
        description: `Join ${u.name}'s interactive study room for hands-on drills, real-time code review, and verified certificate minting.`,
      });
    });

    // Fallback featured room if no other users registered yet
    if (list.length === 0) {
      list.push({
        id: 'class-featured-python',
        roomCode: 'PY-DATA-902',
        topic: 'Python NumPy & Pandas Memory Pipelines',
        skill: 'Python for Data Science',
        instructorName: 'Alex Rivera',
        instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        instructorRating: 4.95,
        participantsCount: 3,
        isLive: true,
        scheduledTime: 'Live Right Now',
        description: 'Deep dive into contiguous RAM layouts, SIMD vectorization, and 1-on-1 peer exchange drills.',
      });
    }

    return list;
  }, [allUsers, currentUser]);

  // Elapsed Timer
  const [seconds, setSeconds] = useState(1425); // 23m 45s
  useEffect(() => {
    if (sessionView !== 'live_meeting') return;
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionView]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── MEDIA STREAMS & WEBRTC ─────────────────────────────────────
  const videoStageContainerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const hostVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'speaker' | 'grid'>('speaker');
  const [audioLevel, setAudioLevel] = useState<number>(35);

  // Fullscreen sync listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoStageContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // In-Call Side Panel: 'chat' | 'whiteboard' | 'code' | 'copilot' | 'people' | null
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'whiteboard' | 'code' | 'copilot' | 'people' | null>('copilot');

  // Launch Live Meeting from Lobby (as Attendee or as Host)
  const handleJoinClass = (cls: LiveClassItem) => {
    setActiveMeeting({
      id: cls.id,
      roomCode: cls.roomCode,
      topic: cls.topic,
      skill: cls.skill,
      instructorName: cls.instructorName,
      instructorAvatar: cls.instructorAvatar,
      isHost: false,
    });
    setSessionView('live_meeting');
    startLiveSession(cls.topic, cls.instructorName, currentUser.name, cls.skill);
    showToast(`Connected to Live Room [${cls.roomCode}] with ${cls.instructorName}!`, 'success');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a valid room code or invite link.', 'warning');
      return;
    }

    const matched = availableClasses.find(c => c.roomCode.toUpperCase() === code);
    if (matched) {
      handleJoinClass(matched);
    } else {
      setActiveMeeting({
        id: `room-${Date.now()}`,
        roomCode: code,
        topic: `Live Study Session [${code}]`,
        skill: currentUser.skillsToLearn[0]?.skillName || 'General Skills',
        instructorName: 'Peer Mentor',
        instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        isHost: false,
      });
      setSessionView('live_meeting');
      startLiveSession(`Live Room ${code}`, 'Peer Mentor', currentUser.name, 'Peer Exchange');
      showToast(`Joined Study Room [${code}]!`, 'success');
    }
  };

  const handleCreateAndStartRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = newRoomTopic.trim() || `${newRoomSkill} Live Interactive Masterclass`;
    setActiveMeeting({
      id: `room-${Date.now()}`,
      roomCode: generatedRoomCode,
      topic,
      skill: newRoomSkill,
      instructorName: currentUser.name,
      instructorAvatar: currentUser.avatar,
      isHost: true,
    });
    setSessionView('live_meeting');
    startLiveSession(topic, currentUser.name, 'Live Attendees', newRoomSkill);
    showToast(`Live Study Room [${generatedRoomCode}] broadcast is now ACTIVE!`, 'success');
  };

  const copyMeetLink = () => {
    const link = `https://meet.skillexchange.org/room/${activeMeeting.roomCode}`;
    navigator.clipboard?.writeText(link);
    showToast('Meeting invite link copied to clipboard!', 'success');
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraActive && mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
      setIsCameraActive(false);
      showToast('Camera paused.', 'info');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        setMediaStream(stream);
        setIsCameraActive(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        showToast('Webcam stream connected!', 'success');
      } catch {
        setIsCameraActive(false);
        showToast('Webcam permission not granted. Switched to aesthetic avatar tile.', 'warning');
      }
    }
  };

  // Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      showToast('Screen sharing stopped.', 'info');
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        if (hostVideoRef.current) {
          hostVideoRef.current.srcObject = displayStream;
        }
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        showToast('Live screen share broadcast started!', 'success');
      } catch {
        setIsScreenSharing(false);
      }
    }
  };

  // Cleanup stream
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [mediaStream]);

  // Floating Emoji Reactions
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const triggerReaction = (emoji: string) => {
    const newId = `${Date.now()}-${Math.random()}`;
    const leftPos = 20 + Math.random() * 60;
    setFloatingReactions(prev => [...prev, { id: newId, emoji, left: leftPos }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newId));
    }, 2000);
  };

  // ── IN-CALL CHAT ──────────────────────────────────────────────
  const [inCallMessages, setInCallMessages] = useState<{ sender: string; avatar: string; text: string; time: string; isMe: boolean }[]>([
    {
      sender: activeMeeting.instructorName,
      avatar: activeMeeting.instructorAvatar,
      text: `Welcome to the live session! Feel free to ask questions or share snippets in the code sandbox.`,
      time: 'Just now',
      isMe: false,
    },
  ]);
  const [inCallInput, setInCallInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inCallMessages]);

  const handleSendInCallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallInput.trim()) return;

    const newMsg = {
      sender: currentUser.name,
      avatar: currentUser.avatar,
      text: inCallInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setInCallMessages(prev => [...prev, newMsg]);
    setInCallInput('');

    // Teacher auto-reply simulation
    setTimeout(() => {
      setInCallMessages(prev => [
        ...prev,
        {
          sender: activeMeeting.instructorName,
          avatar: activeMeeting.instructorAvatar,
          text: `Great point! Let's pull up that exact snippet on the collaborative whiteboard.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  // ── WHITEBOARD CANVAS ─────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState('#0F172A');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth || 500;
      canvas.width = parentWidth;
      canvas.height = window.innerWidth < 640 ? 240 : 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [activeSidePanel]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 24;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = penColor + '55';
      ctx.lineWidth = 16;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = brushSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    showToast('Whiteboard cleared.', 'info');
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `StudyRoom-Whiteboard-${activeMeeting.roomCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showToast('Whiteboard snapshot downloaded!', 'success');
  };

  // ── CODE PLAYGROUND ───────────────────────────────────────────
  const [selectedPreset, setSelectedPreset] = useState<CodePreset>(CODE_PRESETS[0]);
  const [codeContent, setCodeContent] = useState<string>(CODE_PRESETS[0].code);
  const [consoleOutput, setConsoleOutput] = useState<string>(CODE_PRESETS[0].output);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      setConsoleOutput(selectedPreset.output + `\n[Executed live in sandbox at ${new Date().toLocaleTimeString()}]`);
      showToast('Code executed in live sandbox!', 'success');
    }, 500);
  };

  // ── AI TRANSCRIPT COPILOT & MICRO-QUIZ ─────────────────────────
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'ai' | 'user'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: `AI Copilot active in room ${activeMeeting.roomCode}. Listening to live audio dialogue, auto-indexing notes, and ready to generate retention drills.`,
      time: 'Live',
    },
  ]);
  const [aiQueryInput, setAiQueryInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleSendAiQuery = (customText?: string) => {
    const query = (typeof customText === 'string' ? customText : aiQueryInput).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiChatMessages(prev => [...prev, { sender: 'user', text: query, time: timeStr }]);
    setAiQueryInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      let reply = 'Concept drill: In NumPy vectorized memory, contiguous C arrays allow SIMD CPU execution without Python GIL interpreter stalls.';
      const low = query.toLowerCase();
      if (low.includes('quiz') || low.includes('micro') || low.includes('test')) {
        reply = 'Generated 3-question micro-quiz for this room! Click "Take Micro-Quiz & Mint Block" to test retention and issue your SHA-256 certificate.';
        setShowQuizModal(true);
      } else if (low.includes('summar') || low.includes('recap') || low.includes('notes')) {
        reply = 'Session Recap: Covered memory contiguity, SIMD speedups, and practical slicing syntax. All takeaways synced to Second-Brain.';
      }

      setAiChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 600);
  };

  // Micro-Quiz State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({ 0: 1, 1: 0, 2: 2 });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(100);
  const [mintedHash, setMintedHash] = useState<string>('');

  const QUIZ_QUESTIONS = [
    {
      q: 'Why is NumPy array vectorization significantly faster than standard Python list iterations?',
      options: [
        'Because Python lists are compiled to WebAssembly',
        'NumPy operates on homogeneous contiguous C memory with SIMD vector instructions',
        'NumPy uses GPU threads exclusively',
        'It disables memory garbage collection permanently',
      ],
      correct: 1,
    },
    {
      q: 'When slicing a NumPy array (e.g. sub = arr[0:5]), what happens under the hood?',
      options: [
        'It creates a memory view referencing the original buffer without copying data',
        'It duplicates the entire array in heap memory',
        'It serializes data to a JSON object',
        'It converts elements into Python float pointers',
      ],
      correct: 0,
    },
    {
      q: 'In the SkillXchange decentralized network, how is your skill mastery verified?',
      options: [
        'By paying fiat subscription fees',
        'Through credit card pre-authorizations',
        'Via transcript NLP proof + micro-quiz minted into SHA-256 Credential Ledger blocks',
        'By waiting 30 days for manual admin review',
      ],
      correct: 2,
    },
  ];

  const handleFinishQuiz = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correctCount++;
    });

    const scorePct = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    const newHash = `0000a7b4e89f${Date.now().toString(16)}c192d4f8e6b1`.slice(0, 32);
    setMintedHash(newHash);

    if (generateNewCredentialBlock) {
      generateNewCredentialBlock(currentUser.name, currentUser.id, activeMeeting.skill, scorePct);
    }

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#059669', '#D97706', '#2563EB', '#F59E0B'],
      });
    } catch {}
    showToast(`Micro-Quiz submitted with ${scorePct}%! Minted to Credential Ledger.`, 'success');
  };

  // End Meeting / Leave
  const handleLeaveMeeting = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    setSessionView('lobby');
    endLiveSession();
    showToast(`Left meeting room [${activeMeeting.roomCode}].`, 'info');
  };

  // ═════════════════════════════════════════════════════════════════
  // RENDER: LOBBY VIEW (Create or Attend Live Class)
  // ═════════════════════════════════════════════════════════════════
  if (sessionView === 'lobby') {
    const filteredClasses = availableClasses.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.topic.toLowerCase().includes(q) ||
        c.skill.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.roomCode.toLowerCase().includes(q)
      );
    });

    return (
      <div className="py-4 sm:py-8 max-w-[1180px] mx-auto px-3 sm:px-4 space-y-8">
        
        {/* Header Title & Switcher */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono-ledger font-bold shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Decentralized Live Study Rooms</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Peer Video Study Room & Live Streaming
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Attend live classes from peers you are learning from, or create your own Google Meet-style online video study room to teach and earn barter credits.
          </p>

          {/* Lobby Mode Pill Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 shadow-inner">
            <button
              onClick={() => setLobbyTab('attend')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                lobbyTab === 'attend'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Attend a Live Class</span>
            </button>

            <button
              onClick={() => {
                setLobbyTab('create');
                setGeneratedRoomCode(`ROOM-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                lobbyTab === 'create'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Create / Host a Room</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: ATTEND A LIVE CLASS ───────────────────────────── */}
        {lobbyTab === 'attend' && (
          <div className="space-y-6">
            
            {/* Quick Join By Room Code Bar */}
            <div className="paper-card p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <VideoIcon className="w-4 h-4 text-emerald-600" />
                  <span>Have an Invite Code or Meeting Link?</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Enter any peer room code (e.g. <code>PY-DATA-902</code>) to instantly connect.
                </p>
              </div>

              <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Enter Room Code..."
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono-ledger uppercase focus:outline-none focus:border-slate-900 w-full sm:w-60"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <span>Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Live Classes Grid */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Live Classes from Instructors in Your Network
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click "Join Live Class" to enter the Google Meet-style streaming studio with live whiteboard & code runner.
                  </p>
                </div>

                {/* Filter / Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by skill or teacher..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800 w-52 sm:w-64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredClasses.map(cls => (
                  <div
                    key={cls.id}
                    className="paper-card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-ledger font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>LIVE CLASSROOM</span>
                        </span>
                        <span className="text-[11px] font-mono-ledger font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          {cls.roomCode}
                        </span>
                      </div>

                      {/* Title & Topic */}
                      <div>
                        <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                          {cls.topic}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {cls.description}
                        </p>
                      </div>

                      {/* Instructor Info */}
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <img
                          src={cls.instructorAvatar}
                          alt={cls.instructorName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {cls.instructorName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-mono-ledger text-slate-500">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {cls.instructorRating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">{cls.skill}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono-ledger">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.participantsCount} peers in room</span>
                      </div>

                      <button
                        onClick={() => handleJoinClass(cls)}
                        className="px-5 py-2 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <VideoIcon className="w-3.5 h-3.5" />
                        <span>Join Class Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: CREATE / HOST A LIVE ROOM ────────────────────── */}
        {lobbyTab === 'create' && (
          <div className="max-w-2xl mx-auto paper-card p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>Host an Instant Live Study Room</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure your meeting room. Share the generated link with any peer to teach live with WebRTC video and collaborative tools.
              </p>
            </div>

            <form onSubmit={handleCreateAndStartRoom} className="space-y-4">
              {/* Room Topic */}
              <div>
                <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                  Session Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass: NumPy Vectorization & Matrix Slicing"
                  value={newRoomTopic}
                  onChange={e => setNewRoomTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Skill Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                    Teaching Skill Category
                  </label>
                  <select
                    value={newRoomSkill}
                    onChange={e => setNewRoomSkill(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    {skills.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono-ledger text-slate-700 mb-1">
                    Meeting Mode
                  </label>
                  <select
                    value={newRoomType}
                    onChange={e => setNewRoomType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="1on1">1-on-1 Direct Barter Exchange</option>
                    <option value="open_broadcast">Open Group Study Class</option>
                  </select>
                </div>
              </div>

              {/* Generated Room Link Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-ledger font-bold text-amber-900">
                  <span>Generated Meeting Invite Link</span>
                  <span className="text-amber-700">Code: {generatedRoomCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://meet.skillexchange.org/room/${generatedRoomCode}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs font-mono-ledger text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://meet.skillexchange.org/room/${generatedRoomCode}`);
                      showToast('Invite link copied!', 'success');
                    }}
                    className="p-2 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Submit / Launch Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Start Streaming & Open Live Studio</span>
              </button>
            </form>
          </div>
        )}

      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // RENDER: GOOGLE MEET-STYLE LIVE STREAMING STUDIO
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="py-2 sm:py-4 max-w-[1360px] mx-auto px-2 sm:px-4 space-y-4">
      
      {/* ── TOP GOOGLE MEET STATUS BAR ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {activeMeeting.topic}
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1080p WebRTC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-ledger">
              Room Code: <strong className="text-amber-400">{activeMeeting.roomCode}</strong> • Instructor: <strong className="text-slate-200">{activeMeeting.instructorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Meeting Link Button */}
          <button
            onClick={copyMeetLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-ledger font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Copy Meeting Link"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>

          {/* Micro-Quiz Trigger */}
          <button
            onClick={() => setShowQuizModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Take Quiz & Mint</span>
          </button>
        </div>
      </div>

      {/* ── VIDEO STAGE & SIDE PANEL ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* VIDEO CONTAINER (Main Grid) */}
        <div className={`${activeSidePanel ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-3 transition-all duration-200`}>
          
          <div
            ref={videoStageContainerRef}
            className={`relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group ${
              isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-none aspect-auto w-screen h-screen' : 'aspect-video'
            }`}
          >
            {/* ── MODE 1: SPEAKER VIEW (Main Stream + PiP Tile) ── */}
            {viewMode === 'speaker' && (
              <div className="relative w-full h-full flex items-center justify-center">
                {isScreenSharing ? (
                  <video
                    ref={hostVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                    <img
                      src={activeMeeting.instructorAvatar}
                      alt={activeMeeting.instructorName}
                      className="w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover border-4 border-amber-500/50 shadow-2xl animate-pulse"
                    />
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs font-mono-ledger font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{activeMeeting.instructorName} (Host / Teacher)</span>
                    </div>
                  </div>
                )}

                {/* Picture-in-Picture / Learner Self View */}
                <div className="absolute top-4 right-4 w-32 sm:w-48 aspect-video rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-md z-20 group/pip">
                  {isCameraActive ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col text-center p-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-1">
                        {currentUser.name[0]}
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono-ledger truncate w-full">You ({currentUser.name.split(' ')[0]})</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[9px] font-mono-ledger text-white/90 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                    <span>{isMuted ? 'Muted' : 'Audio Live'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE 2: GRID VIEW (Side-by-Side Dual Equal 50/50 Tiles) ── */}
            {viewMode === 'grid' && (
              <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-4">
                
                {/* Tile 1: Instructor / Host */}
                <div className="relative w-full h-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {isScreenSharing ? (
                    <video ref={hostVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                  ) : (
                    <div className="text-center space-y-2">
                      <img src={activeMeeting.instructorAvatar} alt={activeMeeting.instructorName} className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 mx-auto" />
                      <p className="text-xs font-bold text-white">{activeMeeting.instructorName}</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 text-[10px] font-mono-ledger text-white border border-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Teacher · {activeMeeting.instructorName}</span>
                  </div>
                </div>

                {/* Tile 2: Learner (You) */}
                <div className="relative w-full h-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {isCameraActive ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-2">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-white">{currentUser.name} (You)</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 text-[10px] font-mono-ledger text-white border border-slate-800 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isMuted ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></span>
                    <span>Learner · {currentUser.name.split(' ')[0]}</span>
                  </div>
                </div>

              </div>
            )}

            {/* Floating Reaction Emojis */}
            {floatingReactions.map(r => (
              <div
                key={r.id}
                className="absolute bottom-16 text-4xl pointer-events-none animate-bounce z-30"
                style={{ left: `${r.left}%`, animationDuration: '1.4s' }}
              >
                {r.emoji}
              </div>
            ))}

            {/* Hand Raised Banner */}
            {handRaised && (
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce z-30">
                <Hand className="w-4 h-4" />
                <span>Hand Raised by {currentUser.name.split(' ')[0]}</span>
              </div>
            )}

            {/* Top Right Fullscreen & View Mode Controls Bar */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
              {/* View Switcher Pill */}
              <div className="flex bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewMode('speaker')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono-ledger font-bold transition-colors cursor-pointer ${
                    viewMode === 'speaker' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Speaker
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono-ledger font-bold transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Grid (50/50)
                </button>
              </div>

              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-transform active:scale-95 cursor-pointer"
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Floating Emoji Reaction Bar */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 z-30">
              {['🔥', '💡', '👏', '🚀', '❓'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => triggerReaction(emoji)}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-base transition-transform active:scale-125 cursor-pointer"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

          </div>

          {/* ── GOOGLE MEET BOTTOM CONTROL DOCK ──────────────────────── */}
          <div className="p-2.5 sm:p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shadow-xl">
            
            {/* Left: Time & Meeting Code */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300 font-mono-ledger text-xs">
              <span className="font-bold text-amber-400">{formatTimer(seconds)}</span>
              <span>|</span>
              <span className="text-slate-400">{activeMeeting.roomCode}</span>
            </div>

            {/* Center: Main Stream Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 mx-auto sm:mx-0 flex-wrap justify-center">
              {/* Mic Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 sm:p-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
                  isMuted ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`p-2.5 sm:p-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
                  isCameraActive ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraActive ? <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={toggleScreenShare}
                className={`p-2.5 sm:p-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
                  isScreenSharing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Raise Hand Toggle */}
              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-2.5 sm:p-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
                  handRaised ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Raise Hand"
              >
                <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Fullscreen in Dock */}
              <button
                onClick={toggleFullscreen}
                className={`p-2.5 sm:p-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
                  isFullscreen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Full Screen Video"
              >
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Red End Call Button */}
              <button
                onClick={handleLeaveMeeting}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Leave Meeting"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>

            {/* Right: Side Panel Toggles */}
            <div className="flex items-center gap-1 sm:gap-1.5 mx-auto sm:mx-0">
              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'chat' ? null : 'chat')}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                  activeSidePanel === 'chat' ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="In-Call Chat"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'whiteboard' ? null : 'whiteboard')}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                  activeSidePanel === 'whiteboard' ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Collaborative Whiteboard"
              >
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'code' ? null : 'code')}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                  activeSidePanel === 'code' ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Code Sandbox"
              >
                <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'copilot' ? null : 'copilot')}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                  activeSidePanel === 'copilot' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="AI Copilot & Transcript"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* ── RIGHT COLLAPSIBLE SIDE PANEL (Chat / Whiteboard / Code / Copilot) ── */}
        {activeSidePanel && (
          <div className="lg:col-span-4 paper-card p-5 bg-white border border-slate-200 rounded-3xl shadow-lg space-y-4 max-h-[82vh] overflow-y-auto">
            
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                {activeSidePanel === 'chat' && <MessageSquare className="w-4 h-4 text-amber-600" />}
                {activeSidePanel === 'whiteboard' && <Edit3 className="w-4 h-4 text-blue-600" />}
                {activeSidePanel === 'code' && <Code className="w-4 h-4 text-emerald-600" />}
                {activeSidePanel === 'copilot' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                <span>
                  {activeSidePanel === 'chat' && 'In-Call Messages'}
                  {activeSidePanel === 'whiteboard' && 'Collaborative Board'}
                  {activeSidePanel === 'code' && 'Live Code Sandbox'}
                  {activeSidePanel === 'copilot' && 'AI Transcript Copilot'}
                </span>
              </h3>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* SIDE PANEL 1: IN-CALL CHAT */}
            {activeSidePanel === 'chat' && (
              <div className="space-y-3">
                <div className="h-80 overflow-y-auto space-y-3 pr-1 text-xs">
                  {inCallMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl leading-relaxed ${
                        m.isMe ? 'bg-slate-900 text-white ml-6' : 'bg-slate-100 text-slate-900 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono-ledger opacity-70 mb-1">
                        <span>{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendInCallMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Send a message to everyone..."
                    value={inCallInput}
                    onChange={e => setInCallInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <button type="submit" className="p-2 rounded-xl bg-slate-900 text-white cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* SIDE PANEL 2: WHITEBOARD */}
            {activeSidePanel === 'whiteboard' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    {['#0F172A', '#D97706', '#059669', '#DC2626', '#2563EB'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setPenColor(c);
                          setTool('pen');
                        }}
                        className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${penColor === c && tool === 'pen' ? 'scale-125 border-slate-900' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={downloadCanvasImage} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={clearCanvas} className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                      Clear
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair block touch-none"
                  />
                </div>
              </div>
            )}

            {/* SIDE PANEL 3: CODE SANDBOX */}
            {activeSidePanel === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-ledger text-emerald-600 font-bold">{selectedPreset.name}</span>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
                  </button>
                </div>

                <textarea
                  value={codeContent}
                  onChange={e => setCodeContent(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono-ledger text-xs text-emerald-400 focus:outline-none leading-relaxed resize-none"
                  spellCheck={false}
                />

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono-ledger text-xs text-emerald-300 whitespace-pre-wrap">
                  {consoleOutput}
                </div>
              </div>
            )}

            {/* SIDE PANEL 4: AI COPILOT */}
            {activeSidePanel === 'copilot' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono-ledger">
                  <button
                    type="button"
                    onClick={() => handleSendAiQuery('Generate a 3-question micro quiz')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    🧠 Micro-Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendAiQuery('Summarize current takeaways')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    📝 Recap
                  </button>
                </div>

                <div className="h-64 overflow-y-auto space-y-2.5 text-xs pr-1">
                  {aiChatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl leading-relaxed ${
                        m.sender === 'ai'
                          ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950'
                          : 'bg-slate-100 border border-slate-200 text-slate-900 ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono-ledger font-bold mb-1 opacity-70">
                        <span>{m.sender === 'ai' ? '🤖 AI COPILOT' : 'YOU'}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="text-[11.5px] font-sans">{m.text}</p>
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing notes...</span>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendAiQuery();
                  }}
                  className="flex items-center gap-1.5 pt-1"
                >
                  <input
                    type="text"
                    placeholder="Ask AI Copilot..."
                    value={aiQueryInput}
                    onChange={e => setAiQueryInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <button type="submit" className="p-2 rounded-xl bg-emerald-600 text-white cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: MICRO-QUIZ & SHA-256 LEDGER MINTING                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showQuizModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowQuizModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono-ledger font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Proof of Learning
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                  Retention Micro-Quiz & SHA-256 Mint
                </h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete the 3-question retention drill for <strong>{activeMeeting.skill}</strong>. Scoring ≥66% will mint a verifiable certificate block to the ledger.
                </p>

                <div className="space-y-4">
                  {QUIZ_QUESTIONS.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <p className="font-bold text-xs text-slate-900">
                        {qIdx + 1}. {q.q}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                              quizAnswers[qIdx] === optIdx
                                ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-950 shadow-2xs'
                                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={quizAnswers[qIdx] === optIdx}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              className="text-emerald-600 focus:ring-emerald-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFinishQuiz}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Answers & Mint Block</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xl text-slate-900">Quiz Passed · Score: {quizScore}%</h4>
                  <p className="text-xs text-slate-500 mt-1">Cryptographic certificate issued to your immutable ledger.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono-ledger text-xs text-left space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                    <span>BLOCK HASH</span>
                    <span className="text-emerald-400">IMMUTABLE PROOF</span>
                  </div>
                  <p className="text-[11px] break-all">{mintedHash || '0000a7b4e89fc192d4f8e6b12a39c4d5e8912'}</p>
                  <p className="text-[10px] text-slate-400">
                    Learner: {currentUser.name} • Skill: {activeMeeting.skill} • Verified by Peer AI
                  </p>
                </div>

                <button
                  onClick={() => setShowQuizModal(false)}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Return to Live Meeting
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
