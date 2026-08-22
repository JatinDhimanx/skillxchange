'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Send,
  ShieldCheck,
  Clock,
  Coins,
} from 'lucide-react';

export const LiveSessionRoom: React.FC = () => {
  const {
    activeSession,
    endLiveSession,
    releaseEscrow,
  } = useApp();

  // Whiteboard Canvas on Paper
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1A2620');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Media Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Live AI Copilot
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: 'AI Copilot active. Logging transcript notes into your personal second-brain notebook and ready to generate custom code drills.',
    },
  ]);
  const [aiQueryInput, setAiQueryInput] = useState('');

  // Setup Canvas on Paper
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || 700;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = tool === 'eraser' ? '#FDFBF7' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
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
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSendAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQueryInput.trim()) return;

    const query = aiQueryInput;
    setAiChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setAiQueryInput('');

    setTimeout(() => {
      let aiResponse = 'Concept explanation: When applying Travis picking, isolate thumb downbeats on strings 6, 5, 4 and syncopate index/middle on treble strings.';
      if (query.toLowerCase().includes('quiz')) {
        aiResponse = 'Generated 3-question follow-up micro-quiz based on this session audio! Results will append to your Credential Ledger.';
      }
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 500);
  };

  const session = activeSession || {
    id: 'sess-8821',
    title: '1-on-1 Study Room: Python Data Pipelines & Vectorization',
    teacherName: 'Alex Rivera',
    learnerName: 'David Kumar',
    skillName: 'Python for Data Science',
    mode: 'direct_exchange',
    durationMins: 45,
    remainingSeconds: 38 * 60,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    whiteboardActiveTool: 'pen',
    escrowStatus: 'held_in_escrow',
    objectives: [
      { id: 'obj-1', text: 'Vectorized NumPy & Pandas Slicing', completed: true },
      { id: 'obj-2', text: 'Multi-Key GroupBy Aggregations', completed: true },
      { id: 'obj-3', text: 'AI Session Summary & Micro-Quiz Generation', completed: false },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Session Bar (Chalkboard) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-[#111e19] border border-[#F2EFE6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#E7A33E]/20 border border-[#E7A33E]/40 text-[#E7A33E]">
            <Video className="w-5 h-5 animate-pulse text-[#E7A33E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-base sm:text-lg text-[#F2EFE6]">{session.title}</h1>
              <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded-full bg-[#2E8C74]/20 text-[#2E8C74] border border-[#2E8C74]/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Escrow Held
              </span>
            </div>
            <p className="text-xs text-[#D9D0B8] font-sans">
              Teacher: <strong className="text-[#E7A33E]">{session.teacherName}</strong> • Learner: <strong className="text-[#2E8C74]">{session.learnerName}</strong>
            </p>
          </div>
        </div>

        {/* Timer in Mono */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#16261F] border border-[#F2EFE6]/20 flex items-center gap-2 text-xs font-mono-ledger text-[#2E8C74] font-bold">
            <Clock className="w-4 h-4 text-[#2E8C74]" />
            <span>SESSION TIME: 38:15 REM.</span>
          </div>

          <button
            onClick={endLiveSession}
            className="px-4 py-2 rounded-xl bg-[#B5482D] hover:bg-[#993b23] text-[#F2EFE6] text-xs font-bold transition-all font-sans"
          >
            End session
          </button>
        </div>
      </div>

      {/* Main Grid: Paper Video & Whiteboard (Left) vs Ink-Green Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Whiteboard & Study Area on Paper (#F6F1E4) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Feeds on Paper Card */}
          <div className="grid grid-cols-2 gap-4">
            {/* Teacher Feed */}
            <div className="rounded-3xl bg-[#F6F1E4] border border-[#D9D0B8] relative aspect-video overflow-hidden shadow-md flex items-center justify-center">
              {!isVideoOff ? (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                  alt="Teacher"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#53635A] text-xs flex flex-col items-center gap-1 font-mono-ledger">
                  <VideoOff className="w-6 h-6" />
                  <span>Video Paused</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-[#16261F]/90 backdrop-blur-md text-[10.5px] font-mono-ledger font-bold text-[#F2EFE6] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E7A33E] animate-pulse"></span>
                <span>{session.teacherName} (Teacher)</span>
              </div>
            </div>

            {/* Learner Feed */}
            <div className="rounded-3xl bg-[#F6F1E4] border border-[#D9D0B8] relative aspect-video overflow-hidden shadow-md flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80"
                alt="Learner"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-[#16261F]/90 backdrop-blur-md text-[10.5px] font-mono-ledger font-bold text-[#F2EFE6] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E8C74]"></span>
                <span>{session.learnerName} (Learner)</span>
              </div>
            </div>
          </div>

          {/* Media Buttons */}
          <div className="p-3 rounded-2xl bg-[#111e19] border border-[#F2EFE6]/15 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={`p-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all font-sans ${
                isMuted ? 'bg-[#B5482D]/20 text-[#B5482D] border border-[#B5482D]' : 'bg-[#16261F] text-[#F2EFE6] hover:bg-[#1f372d]'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'Muted' : 'Mic on'}</span>
            </button>

            <button
              onClick={() => setIsVideoOff(prev => !prev)}
              className={`p-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all font-sans ${
                isVideoOff ? 'bg-[#B5482D]/20 text-[#B5482D] border border-[#B5482D]' : 'bg-[#16261F] text-[#F2EFE6] hover:bg-[#1f372d]'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{isVideoOff ? 'Cam off' : 'Cam on'}</span>
            </button>

            <button
              onClick={() => setIsScreenSharing(prev => !prev)}
              className={`p-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all font-sans ${
                isScreenSharing ? 'bg-[#E7A33E] text-[#16261F]' : 'bg-[#16261F] text-[#F2EFE6] hover:bg-[#1f372d]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{isScreenSharing ? 'Sharing screen' : 'Share screen'}</span>
            </button>
          </div>

          {/* Collaborative Whiteboard on Paper (#F6F1E4) */}
          <div className="ledger-paper rounded-3xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D0B8] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1A2620]" />
                <h3 className="font-display font-bold text-sm text-[#1A2620]">Live Study Whiteboard (Paper Canvas)</h3>
              </div>

              {/* Whiteboard Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    tool === 'pen' ? 'bg-[#1A2620] text-[#F6F1E4]' : 'bg-[#FDFBF7] text-[#1A2620] border border-[#D9D0B8]'
                  }`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    tool === 'eraser' ? 'bg-[#1A2620] text-[#F6F1E4]' : 'bg-[#FDFBF7] text-[#1A2620] border border-[#D9D0B8]'
                  }`}
                >
                  Eraser
                </button>

                {/* Color Palette */}
                <div className="flex items-center gap-1.5 bg-[#FDFBF7] p-1.5 rounded-xl border border-[#D9D0B8]">
                  {['#1A2620', '#E7A33E', '#2E8C74', '#B5482D', '#53635A'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setTool('pen');
                      }}
                      className={`w-4 h-4 rounded-full border ${color === c && tool === 'pen' ? 'scale-125 border-[#1A2620]' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <button
                  onClick={clearCanvas}
                  className="p-1.5 rounded-xl bg-[#FDFBF7] text-[#53635A] hover:text-[#B5482D] border border-[#D9D0B8]"
                  title="Clear Whiteboard"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#D9D0B8] bg-[#FDFBF7]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full cursor-crosshair block"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Session Sidebar stays on Ink-Green (#16261F) for contrast */}
        <div className="space-y-6">
          {/* Objectives Tracker */}
          <div className="rounded-3xl p-5 bg-[#111e19] border border-[#F2EFE6]/15 space-y-3">
            <span className="text-[10px] font-mono-ledger uppercase font-bold text-[#D9D0B8] tracking-wider">
              Session Learning Objectives:
            </span>
            <div className="space-y-2 text-xs">
              {session.objectives.map(obj => (
                <div
                  key={obj.id}
                  className="p-2.5 rounded-xl bg-[#16261F] border border-[#F2EFE6]/10 flex items-center gap-2"
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${obj.completed ? 'text-[#2E8C74]' : 'text-[#53635A]'}`}
                  />
                  <span className={obj.completed ? 'text-[#F2EFE6]' : 'text-[#D9D0B8]'}>{obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Session Copilot Chat on Ink-Green */}
          <div className="rounded-3xl p-5 bg-[#111e19] border border-[#F2EFE6]/15 space-y-4 flex flex-col h-[420px]">
            <div className="flex items-center justify-between border-b border-[#F2EFE6]/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E7A33E]" />
                <h4 className="text-xs font-display font-bold text-[#F2EFE6]">AI Learning Copilot</h4>
              </div>
              <span className="text-[9.5px] font-mono-ledger text-[#2E8C74] font-bold bg-[#2E8C74]/20 px-2 py-0.5 rounded">
                LIVE LOG
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
              {aiChatMessages.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  className={`p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'ai'
                      ? 'bg-[#16261F] border border-[#F2EFE6]/15 text-[#F2EFE6]'
                      : 'bg-[#E7A33E]/20 border border-[#E7A33E]/40 text-[#F2EFE6] ml-6'
                  }`}
                >
                  <p className="text-[9.5px] font-mono-ledger font-bold text-[#E7A33E] uppercase mb-1">
                    {msg.sender === 'ai' ? 'AI Transcript Assistant' : 'You'}
                  </p>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Query Input */}
            <form onSubmit={handleSendAiQuery} className="relative pt-2">
              <input
                type="text"
                placeholder="Ask concept drill or generate micro-quiz..."
                value={aiQueryInput}
                onChange={e => setAiQueryInput(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#16261F] border border-[#F2EFE6]/20 text-xs text-[#F2EFE6] placeholder-[#D9D0B8]/60 focus:outline-none focus:border-[#E7A33E]"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#E7A33E] hover:text-[#D49029]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Mutual Escrow Release */}
          <div className="p-4 rounded-2xl bg-[#111e19] border border-[#2E8C74]/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-ledger">
              <span className="font-bold text-[#2E8C74]">Escrow Settlement:</span>
              <span className="text-[#D9D0B8]">1.4 Credits Held</span>
            </div>
            <button
              onClick={releaseEscrow}
              className="w-full py-2.5 rounded-xl bg-[#2E8C74] hover:bg-[#247561] text-[#F2EFE6] text-xs font-bold transition-all font-sans"
            >
              Learner confirm & release escrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
