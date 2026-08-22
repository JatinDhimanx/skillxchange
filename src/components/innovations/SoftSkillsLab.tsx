'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Activity,
  Award,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Brain,
  History,
  Copy,
  Check,
} from 'lucide-react';

interface VoiceAnalysisResult {
  clarityScore: number;
  confidenceScore: number;
  wordsPerMinute: number;
  tonalCadence: string;
  fillerWordsCount: number;
  fillerWordsList: { word: string; count: number }[];
  strengths: string[];
  areasForImprovement: string[];
  coachFeedback: string;
  suggestedScript: string;
  source?: string;
  timestamp?: number;
}

const DRILL_SCENARIOS = [
  {
    id: 'pitch',
    title: 'Startup Investor Pitch (3-Min Pitch)',
    icon: '💼',
    targetAudience: 'Venture Capitalists & Angel Investors',
    sampleStarter:
      'We are building SkillXchange, a decentralized peer-to-peer knowledge network that eliminates high tuition fees through tokenized skill bartering and verifiable on-chain certificates.',
    description: 'Focus on high energy, crisp value proposition, and firm conclusion.',
  },
  {
    id: 'tech_defense',
    title: 'Technical System Architecture Defense',
    icon: '🛠️',
    targetAudience: 'Senior Staff Engineers & Architects',
    sampleStarter:
      'To achieve sub-millisecond p99 read latency at scale, our service leverages distributed LSM-trees, append-only commit logs, and in-memory bloom filters with consistent hashing.',
    description: 'Focus on clear technical jargon, zero hesitation, and structured logic.',
  },
  {
    id: 'salary',
    title: 'Executive Salary & Compensation Negotiation',
    icon: '🤝',
    targetAudience: 'Hiring Director / HR VP',
    sampleStarter:
      'Based on the market compensation benchmarks for this role and my verified track record of scaling high-throughput engineering teams, I am targeting an annual package of 45 Lakhs with performance equity.',
    description: 'Focus on polite authority, steady breathing, and firm tone.',
  },
  {
    id: 'fluency',
    title: 'Conversational English & Debate Opening',
    icon: '🎙️',
    targetAudience: 'Global Peer Exchange Community',
    sampleStarter:
      'Today I would like to explore how peer-to-peer collaborative learning outperforms traditional classroom lectures by fostering active feedback loops and reciprocal accountability.',
    description: 'Focus on smooth sentence transitions, vocal warmth, and pacing.',
  },
];

export const SoftSkillsLab: React.FC = () => {
  const { showToast } = useApp();

  const [selectedScenario, setSelectedScenario] = useState(DRILL_SCENARIOS[0]);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<VoiceAnalysisResult[]>([]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup Web Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setSpeechTranscript(currentTranscript.trim());
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          if (err.error !== 'no-speech') {
            showToast(`Mic notice: ${err.error}. You can also type or paste text.`, 'info');
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
            } catch {
              // Ignore already running
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [isRecording, showToast]);

  // Handle Recording Start / Stop
  const toggleRecording = () => {
    if (!isRecording) {
      // Start Recording
      setIsRecording(true);
      setRecordingSeconds(0);
      setSpeechTranscript('');
      setAnalysisResult(null);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start exception:', e);
        }
      }

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      showToast('Microphone live! Start speaking your rehearsal...', 'info');
    } else {
      // Stop Recording
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Recognition stop error:', e);
        }
      }
      showToast('Recording stopped. Ready to analyze with Gemini AI Coach!', 'success');
    }
  };

  // Run AI Speech Analysis with Gemini Backend
  const runAIAnalysis = async () => {
    const textToAnalyze = speechTranscript.trim() || selectedScenario.sampleStarter;
    if (!textToAnalyze) {
      showToast('Please record or type a speech excerpt first.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/voice-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario.title,
          transcript: textToAnalyze,
          durationSeconds: Math.max(15, recordingSeconds),
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const result: VoiceAnalysisResult = {
          ...data.analysis,
          source: data.source,
          timestamp: Date.now(),
        };
        setAnalysisResult(result);
        setSessionHistory(prev => [result, ...prev.slice(0, 4)]);
        showToast('AI Speech Evaluation Complete! 🎯', 'success');
      } else {
        showToast(data.error || 'Failed to analyze speech.', 'warning');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Network error during AI analysis. Please try again.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text to Speech playback of Coach Feedback
  const toggleTTS = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Text-to-speech is not supported on this browser.', 'info');
      return;
    }

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);
      setIsSpeakingTTS(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copySuggestedScript = () => {
    if (analysisResult?.suggestedScript) {
      navigator.clipboard.writeText(analysisResult.suggestedScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
      showToast('Optimized script copied to clipboard!', 'success');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto animate-fade-in font-sans">
      {/* ── 1. HEADER BANNER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-mono-ledger font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-600" />
              AI Voice & Speech Lab
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Gemini AI Powered
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            AI Speech Coach & <span className="text-amber-600">Soft Skills Studio</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
            Practice public speaking, pitch decks, and technical interviews. AI evaluates clarity index, filler words, speech pace (WPM), and provides executive feedback in real time.
          </p>
        </div>

        {/* Live Mic Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleRecording}
            className={`px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shadow-md active:scale-95 cursor-pointer font-sans ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>Stop Recording ({formatTime(recordingSeconds)})</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Start Live Voice Practice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. SCENARIO SELECTOR CARDS ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-ledger font-bold uppercase tracking-wider text-slate-500">
            Select Practice Scenario:
          </span>
          <span className="text-xs font-mono-ledger text-emerald-700 font-bold">
            Audience: {selectedScenario.targetAudience}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DRILL_SCENARIOS.map(sc => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  if (!speechTranscript) {
                    setSpeechTranscript(sc.sampleStarter);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-xs scale-[1.02]'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{sc.icon}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono-ledger font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Active Drill
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 line-clamp-1">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-sans line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. LIVE TRANSCRIPTION & AUDIO CONSOLE ────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isRecording ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isRecording ? <Activity className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                Live Speech Excerpt & Audio Rehearsal
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Speak directly into your microphone or paste a script to evaluate NLP clarity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeechTranscript(selectedScenario.sampleStarter)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Script
            </button>
            <button
              onClick={() => {
                setSpeechTranscript('');
                setAnalysisResult(null);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              title="Clear Transcript"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Bar when recording */}
        {isRecording && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono-ledger font-bold text-rose-400 uppercase tracking-wider">
                Listening Live: {formatTime(recordingSeconds)}
              </span>
            </div>

            {/* Pulsing Audio Waves */}
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 90, 60, 100, 45, 80, 55, 95, 30, 85, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse transition-all duration-300"
                  style={{
                    height: `${Math.max(20, (h * ((recordingSeconds % 3) + 1)) / 3)}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Transcript Textarea */}
        <div className="space-y-2">
          <textarea
            rows={4}
            value={speechTranscript}
            onChange={e => setSpeechTranscript(e.target.value)}
            placeholder={`Click 'Start Live Voice Practice' to speak or type your rehearsal here...\n\nExample: "${selectedScenario.sampleStarter}"`}
            className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs sm:text-sm font-sans leading-relaxed transition-all"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
            <span>
              Word Count: <strong className="text-slate-800">{speechTranscript.trim().split(/\s+/).filter(Boolean).length}</strong> words
            </span>

            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing || (!speechTranscript.trim() && !selectedScenario.sampleStarter)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer font-sans"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating with Gemini...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Analyze with Gemini AI Coach</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. AI ANALYSIS RESULTS METRICS ───────────────────────────────── */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 Metrics Scorecards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Clarity Index */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Clarity Index</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700">
                {analysisResult.clarityScore}%
              </p>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${analysisResult.clarityScore}%` }}
                />
              </div>
              <span className="text-[10px] font-mono-ledger text-emerald-700 font-bold block">
                {analysisResult.clarityScore >= 85 ? 'High Articulation' : 'Needs Practice'}
              </span>
            </div>

            {/* Speech Pace WPM */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Speech Pace</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                {analysisResult.wordsPerMinute} <span className="text-xs font-mono-ledger text-slate-400 font-normal">WPM</span>
              </p>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (analysisResult.wordsPerMinute / 180) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono-ledger text-amber-700 font-bold block">
                {analysisResult.wordsPerMinute >= 120 && analysisResult.wordsPerMinute <= 160 ? 'Optimal Cadence (130-160)' : 'Adjust Speed'}
              </span>
            </div>

            {/* Filler Words */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Filler Words</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-rose-600">
                {analysisResult.fillerWordsCount} <span className="text-xs font-mono-ledger text-slate-400 font-normal">detected</span>
              </p>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, analysisResult.fillerWordsCount * 20)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono-ledger text-slate-500 truncate block">
                {analysisResult.fillerWordsList.length > 0
                  ? analysisResult.fillerWordsList.map(f => `"${f.word}" (${f.count})`).join(', ')
                  : 'Zero fillers detected 🎉'}
              </span>
            </div>

            {/* Vocal Energy & Confidence */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Confidence & Tone</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-blue-700">
                {analysisResult.confidenceScore}%
              </p>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${analysisResult.confidenceScore}%` }}
                />
              </div>
              <span className="text-[10px] font-mono-ledger text-blue-700 font-bold block truncate">
                {analysisResult.tonalCadence}
              </span>
            </div>
          </div>

          {/* Detailed Executive Coach Feedback Report */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Strengths & Improvements (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Key Strengths & Growth Areas
                </h3>
                <span className="text-[10px] font-mono-ledger text-slate-400 uppercase font-bold">
                  {analysisResult.source === 'gemini-ai' ? 'Gemini 1.5 Flash' : 'NLP Heuristic Engine'}
                </span>
              </div>

              {/* Strengths */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono-ledger font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What You Did Well
                </span>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono-ledger font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Actionable Coaching Tips
                </span>
                <ul className="space-y-2">
                  {analysisResult.areasForImprovement.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Coach Summary & Polished Script (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    AI Coach Summary
                  </h3>
                  <button
                    onClick={() => toggleTTS(analysisResult.coachFeedback + ' ' + analysisResult.suggestedScript)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSpeakingTTS
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingTTS ? 'Stop Audio' : 'Listen to Coach'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans italic">
                  &ldquo;{analysisResult.coachFeedback}&rdquo;
                </div>

                {/* Polished Script */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-ledger font-bold text-slate-500 uppercase">
                      Polished Rephrased Script:
                    </span>
                    <button
                      onClick={copySuggestedScript}
                      className="text-[11px] font-mono-ledger font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 font-sans leading-relaxed">
                    {analysisResult.suggestedScript}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Scenario: {selectedScenario.title.slice(0, 20)}...</span>
                <span className="font-mono-ledger text-emerald-700 font-bold">
                  Score: {analysisResult.clarityScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. RECENT DRILL HISTORY ──────────────────────────────────────── */}
      {sessionHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            Recent Drill History (This Session)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sessionHistory.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ledger text-[10px] text-slate-400">Drill #{idx + 1}</span>
                  <span className="font-mono-ledger font-black text-emerald-700">{item.clarityScore}% Clarity</span>
                </div>
                <p className="font-bold text-slate-800 truncate">{item.tonalCadence}</p>
                <p className="text-[10px] text-slate-500 font-mono-ledger">{item.wordsPerMinute} WPM • {item.fillerWordsCount} fillers</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
