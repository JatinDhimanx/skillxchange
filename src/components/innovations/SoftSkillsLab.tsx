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
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Copy,
  Check,
  FileText,
  Clock,
  History,
  Radio,
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

const SCENARIOS = [
  {
    id: 'pitch',
    label: '💼 Startup Pitch',
    title: 'Startup Investor Pitch (3-Min Pitch)',
    audience: 'Venture Capitalists & Angel Investors',
    sample:
      'We are building SkillXchange, a decentralized peer knowledge network that eliminates high tuition costs through tokenized skill bartering and verifiable on-chain certificates.',
  },
  {
    id: 'tech',
    label: '🛠️ Tech System Defense',
    title: 'Technical System Architecture Defense',
    audience: 'Staff Engineers & System Architects',
    sample:
      'To achieve sub-millisecond p99 latency at scale, our distributed architecture leverages append-only commit logs, in-memory bloom filters, and consistent partition hashing.',
  },
  {
    id: 'salary',
    label: '🤝 Salary Negotiation',
    title: 'Executive Compensation Negotiation',
    audience: 'Hiring Committee & HR Director',
    sample:
      'Based on the industry compensation benchmarks for this role and my verified track record of scaling high-throughput engineering teams, I am targeting an annual package of 45 Lakhs with performance equity.',
  },
  {
    id: 'fluency',
    label: '🎙️ English Fluency',
    title: 'Conversational Fluency & Public Speaking',
    audience: 'Global Peer Exchange Community',
    sample:
      'Peer-to-peer collaborative learning outperforms traditional classroom lectures by fostering active feedback loops, reciprocal mentorship, and continuous hands-on accountability.',
  },
];

export const SoftSkillsLab: React.FC = () => {
  const { showToast } = useApp();

  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<VoiceAnalysisResult[]>([]);

  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 1. DEDICATED TIMER EFFECT (Guaranteed reliable timer)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // 2. SPEECH RECOGNITION SETUP
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
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentText.trim());
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err.error);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 3. START / STOP RECORDING WITH LIVE MICROPHONE AUDIO ANALYZER
  const toggleRecording = async () => {
    if (!isRecording) {
      // START RECORDING
      setRecordingSeconds(0);
      setTranscript('');
      setAnalysisResult(null);
      setIsRecording(true);

      // Request browser microphone hardware access
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = stream;

          // Setup AudioContext for real live audio volume wave metering
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            audioContextRef.current = audioCtx;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkAudioLevel = () => {
              if (!analyser) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkAudioLevel);
            };
            checkAudioLevel();
          }
        }
      } catch (micErr) {
        console.warn('Microphone permission exception:', micErr);
      }

      // Start Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start exception:', e);
        }
      }

      showToast('Microphone active! Speak clearly into your mic...', 'info');
    } else {
      // STOP RECORDING
      setIsRecording(false);
      setAudioLevel(0);

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // Ignore
        }
        audioContextRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Recognition stop exception:', e);
        }
      }

      showToast('Recording stopped! Click "Analyze Speech" for AI feedback.', 'success');
    }
  };

  // 4. RUN AI SPEECH ANALYSIS
  const handleAnalyze = async () => {
    const textToAnalyze = transcript.trim() || activeScenario.sample;
    if (!textToAnalyze) {
      showToast('Please record or enter a speech excerpt first.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/voice-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: activeScenario.title,
          transcript: textToAnalyze,
          durationSeconds: Math.max(15, recordingSeconds),
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const res: VoiceAnalysisResult = {
          ...data.analysis,
          source: data.source,
          timestamp: Date.now(),
        };
        setAnalysisResult(res);
        setHistory(prev => [res, ...prev.slice(0, 3)]);
        showToast('Speech evaluation complete! 🎯', 'success');
      } else {
        showToast(data.error || 'Could not analyze speech excerpt.', 'warning');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Error communicating with AI coach service.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 5. TEXT TO SPEECH (TTS)
  const toggleTTS = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Text-to-speech not supported on this device.', 'info');
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

  const copyScript = () => {
    if (analysisResult?.suggestedScript) {
      navigator.clipboard.writeText(analysisResult.suggestedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Polished script copied to clipboard!', 'success');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-[1180px] mx-auto animate-fade-in font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              AI Voice & Speech Lab
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gemini AI Coach
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Practice public speaking, pitch decks, and technical defense. AI measures clarity, pace (WPM), and filler words in real time.
          </p>
        </div>

        <button
          onClick={() => {
            setTranscript('');
            setAnalysisResult(null);
            setRecordingSeconds(0);
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* ── Scenario Tabs ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <span className="text-xs font-mono-ledger font-bold text-slate-500 uppercase">
          1. Choose Practice Drill:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => {
                setActiveScenario(sc);
                if (!transcript) setTranscript(sc.sample);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                activeScenario.id === sc.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Speech Rehearsal Console ────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              {activeScenario.title}
            </h2>
            <p className="text-xs text-slate-500">
              Target Audience: <span className="font-semibold text-slate-700">{activeScenario.audience}</span>
            </p>
          </div>

          {/* Load Sample Button */}
          <button
            onClick={() => setTranscript(activeScenario.sample)}
            className="text-xs font-mono-ledger font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Insert Sample Pitch
          </button>
        </div>

        {/* Big Clean Mic Record Bar with Live Audio Visualizer */}
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3.5">
            <button
              onClick={toggleRecording}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
              <span>{isRecording ? 'Stop Recording' : 'Record Speech (Mic)'}</span>
            </button>

            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono-ledger font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
                <span>{formatTimer(recordingSeconds)}</span>
              </div>
            )}
          </div>

          {/* Real Audio Level Waveform Bars */}
          {isRecording && (
            <div className="flex items-center gap-1 h-5">
              {[20, 45, 80, 100, 60, 90, 40, 75, 50, 95].map((val, idx) => {
                const heightPct = Math.max(15, (audioLevel * val) / 70);
                return (
                  <div
                    key={idx}
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
                    style={{ height: `${Math.min(100, heightPct)}%` }}
                  />
                );
              })}
            </div>
          )}

          <span className="text-xs font-mono-ledger text-slate-500">
            {isRecording ? 'Capturing speech in real time...' : 'Speak with mic or type below'}
          </span>
        </div>

        {/* Textarea for spoken / rehearsal text */}
        <div className="space-y-3">
          <textarea
            rows={4}
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={`Speak into your microphone or type your speech rehearsal here...\n\nExample: "${activeScenario.sample}"`}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-sans placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all leading-relaxed"
          />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs font-mono-ledger text-slate-500">
              Length: <strong className="text-slate-800">{wordCount}</strong> words
            </span>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!transcript.trim() && !activeScenario.sample)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating with AI Coach...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Analyze Speech with AI Coach</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Results Section ───────────────────────────────────────────── */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 Score Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Clarity */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Clarity Index</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700">
                {analysisResult.clarityScore}%
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.clarityScore}%` }} />
              </div>
            </div>

            {/* Speech Pace */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Speech Pace</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                {analysisResult.wordsPerMinute} <span className="text-xs font-sans font-normal text-slate-400">WPM</span>
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.wordsPerMinute / 180) * 100)}%` }} />
              </div>
            </div>

            {/* Filler Words */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Filler Words</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-rose-600">
                {analysisResult.fillerWordsCount}
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, analysisResult.fillerWordsCount * 25)}%` }} />
              </div>
            </div>

            {/* Confidence */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-ledger text-slate-400">
                <span className="uppercase font-bold text-[10px]">Confidence</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl text-blue-700">
                {analysisResult.confidenceScore}%
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${analysisResult.confidenceScore}%` }} />
              </div>
            </div>
          </div>

          {/* 2-Column AI Feedback Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Strengths & Improvements (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Speech Evaluation Report
              </h3>

              {/* Strengths */}
              <div className="space-y-2">
                <span className="text-xs font-mono-ledger font-bold text-emerald-800 uppercase">
                  Strengths:
                </span>
                <ul className="space-y-1.5">
                  {analysisResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="space-y-2">
                <span className="text-xs font-mono-ledger font-bold text-amber-800 uppercase">
                  Actionable Improvements:
                </span>
                <ul className="space-y-1.5">
                  {analysisResult.areasForImprovement.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coach Feedback & Polished Script (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    AI Coach Summary
                  </h3>
                  <button
                    onClick={() => toggleTTS(analysisResult.coachFeedback + '. ' + analysisResult.suggestedScript)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSpeakingTTS
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingTTS ? 'Stop Audio' : 'Listen to Audio'}</span>
                  </button>
                </div>

                <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{analysisResult.coachFeedback}&rdquo;
                </p>

                {/* Polished Rephrased Script */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-ledger font-bold text-slate-500 uppercase">
                      Polished Version:
                    </span>
                    <button
                      onClick={copyScript}
                      className="text-xs font-mono-ledger font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-sans">
                    {analysisResult.suggestedScript}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-ledger">
                <span>Tone: <strong>{analysisResult.tonalCadence}</strong></span>
                <span className="text-emerald-700 font-bold">Grade: {analysisResult.clarityScore}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent History ───────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
              Recent Practice History
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {history.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ledger text-[10px] text-slate-400">Attempt #{idx + 1}</span>
                  <span className="font-mono-ledger font-bold text-emerald-700">{item.clarityScore}% Clarity</span>
                </div>
                <p className="font-semibold text-slate-800 truncate">{item.tonalCadence}</p>
                <p className="text-[10px] text-slate-500 font-mono-ledger">{item.wordsPerMinute} WPM • {item.fillerWordsCount} fillers</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
