'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  RotateCw,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Tag,
  CheckCircle2,
  Brain,
  Lightbulb,
  FileText,
  Calendar,
  User,
  Zap,
} from 'lucide-react';
import { NotebookEntry } from '../../types';

interface FlashcardItem {
  id: string;
  q: string;
  a: string;
  skill: string;
  mastered?: boolean;
}

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    q: 'Why does NumPy slice indexing create memory views rather than copies?',
    a: 'To maximize performance and eliminate memory overhead by sharing the underlying C-contiguous buffer with offset strides.',
    skill: 'Python Data Science',
  },
  {
    id: 'fc-2',
    q: 'What is the fundamental right-hand rule of Travis Picking in acoustic guitar?',
    a: 'The thumb maintains a steady alternating bass pattern on downbeats, while the index and middle fingers syncopate treble melodies.',
    skill: 'Acoustic Guitar',
  },
  {
    id: 'fc-3',
    q: 'What is the purpose of Raymarching Distance Estimators in GLSL Shaders?',
    a: 'To determine how far a light ray can safely step forward through 3D space without penetrating implicit surface geometries.',
    skill: 'GLSL Shaders',
  },
  {
    id: 'fc-4',
    q: 'How does Write-Ahead Logging (WAL) prevent database corruption?',
    a: 'It writes data modifications to an append-only log on disk before applying them to in-memory pages, guaranteeing ACID durability.',
    skill: 'Distributed Systems',
  },
];

export const SecondBrainNotebook: React.FC = () => {
  const {
    currentUser,
    searchQueryNotebook,
    setSearchQueryNotebook,
    filteredNotebookEntries,
    addNotebookEntry,
    deleteNotebookEntry,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'create'>('notes');
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(DEFAULT_FLASHCARDS);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Note Creator State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSkill, setNoteSkill] = useState('');
  const [noteSummary, setNoteSummary] = useState('');
  const [noteTakeaways, setNoteTakeaways] = useState('');
  const [noteCode, setNoteCode] = useState('');
  const [noteCodeLang, setNoteCodeLang] = useState('typescript');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Toggle flashcard flip
  const toggleCardFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle mastery
  const toggleMastery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlashcards(prev =>
      prev.map(fc => (fc.id === id ? { ...fc, mastered: !fc.mastered } : fc))
    );
    showToast('Flashcard mastery updated! 🎯', 'success');
  };

  // 1-Click Copy Note
  const copyNoteContent = (entry: NotebookEntry) => {
    const text = `# ${entry.title}\n**Skill:** ${entry.skillName} | **Date:** ${entry.date}\n**Teacher:** ${entry.teacherName}\n\n## Summary\n${entry.summary}\n\n## Key Takeaways\n${entry.keyTakeaways.map(t => `- ${t}`).join('\n')}\n\n${entry.codeSnippets?.[0] ? `\`\`\`${entry.codeSnippets[0].language}\n${entry.codeSnippets[0].code}\n\`\`\`` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Note copied to clipboard as Markdown!', 'success');
  };

  // Generate with Gemini AI
  const handleAIGenerate = async () => {
    const topic = noteTitle.trim() || noteSkill.trim() || 'Modern Web Development';
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/second-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          notesText: noteSummary || noteTakeaways || topic,
          skillName: noteSkill.trim() || 'Software Engineering',
        }),
      });

      const data = await response.json();
      if (data.success && data.note) {
        const n = data.note;
        setNoteTitle(n.title);
        setNoteSkill(n.skillName || 'Engineering');
        setNoteSummary(n.summary);
        setNoteTakeaways(n.keyTakeaways.join('\n'));
        if (n.codeSnippets?.[0]) {
          setNoteCode(n.codeSnippets[0].code);
          setNoteCodeLang(n.codeSnippets[0].language || 'typescript');
        }
        if (n.flashcards && n.flashcards.length > 0) {
          const newCards: FlashcardItem[] = n.flashcards.map((f: any, i: number) => ({
            id: `fc-ai-${Date.now()}-${i}`,
            q: f.q,
            a: f.a,
            skill: f.skill || n.skillName,
          }));
          setFlashcards(prev => [...newCards, ...prev]);
        }
        showToast('AI synthesized structured note & generated study flashcards! ✨', 'success');
      } else {
        showToast('AI note generation failed. Please try again.', 'warning');
      }
    } catch (err) {
      console.error('AI generate error:', err);
      showToast('Network error generating AI note.', 'warning');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save Manual or AI Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Please enter a note title.', 'warning');
      return;
    }

    const takeawaysArray = noteTakeaways
      .split('\n')
      .map(t => t.trim().replace(/^[-*•›]\s*/, ''))
      .filter(Boolean);

    const newNote: Omit<NotebookEntry, 'id' | 'date'> = {
      sessionId: `sess-${Date.now()}`,
      title: noteTitle.trim(),
      skillName: noteSkill.trim() || 'General Study',
      skillCategory: 'Technology',
      teacherName: currentUser.name || 'Self-Directed Rehearsal',
      summary: noteSummary.trim() || 'Self-study session note synthesized into knowledge wiki.',
      keyTakeaways: takeawaysArray.length > 0 ? takeawaysArray : ['Core concepts synthesized and documented.'],
      codeSnippets: noteCode.trim()
        ? [{ title: 'Code Snippet', language: noteCodeLang, code: noteCode.trim() }]
        : [],
      actionItems: ['Review key concepts', 'Practice exercise'],
      tags: [(noteSkill || 'study').toLowerCase().replace(/\s+/g, '-'), 'wiki'],
    };

    addNotebookEntry(newNote);

    // Reset Form & Switch to Notes Tab
    setNoteTitle('');
    setNoteSkill('');
    setNoteSummary('');
    setNoteTakeaways('');
    setNoteCode('');
    setActiveTab('notes');
  };

  const masteredCount = flashcards.filter(f => f.mastered).length;

  return (
    <div className="space-y-6 max-w-[1180px] mx-auto animate-fade-in font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Second-Brain Knowledge Wiki
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              AI Indexed & Synced
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Your personal searchable study notebook. Live session notes, code snippets, and active-recall flashcards.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Note / AI Synthesizer</span>
        </button>
      </div>

      {/* ── Tabs & Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Notes ({filteredNotebookEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flashcards'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Flashcards ({flashcards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Note Creator</span>
          </button>
        </div>

        {/* Search Input (Shown on notes & flashcards) */}
        {activeTab !== 'create' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wiki (Pandas, Python)..."
              value={searchQueryNotebook}
              onChange={e => setSearchQueryNotebook(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
            />
          </div>
        )}
      </div>

      {/* ── TAB 1: KNOWLEDGE WIKI NOTES ───────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {filteredNotebookEntries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-slate-900">No Wiki Notes Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                  Create your first note or complete a live peer study session to auto-index takeaways.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Create First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredNotebookEntries.map(entry => (
                <div
                  key={entry.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Header Strip */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono-ledger font-bold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {entry.skillName}
                        </span>
                        <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                          {entry.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyNoteContent(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Copy Markdown"
                        >
                          {copiedId === entry.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteNotebookEntry(entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      {entry.summary}
                    </p>

                    {/* Key Takeaways */}
                    {entry.keyTakeaways && entry.keyTakeaways.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono-ledger font-bold text-slate-400 uppercase tracking-wider">
                          Key Concepts:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700 font-sans">
                          {entry.keyTakeaways.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold mt-0.5">›</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {entry.codeSnippets && entry.codeSnippets.length > 0 && (
                      <div className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono-ledger text-emerald-400 overflow-x-auto shadow-xs">
                        <pre><code>{entry.codeSnippets[0]?.code}</code></pre>
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-ledger text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <strong className="text-slate-700">{entry.teacherName}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ACTIVE RECALL FLASHCARDS ──────────────────────────────── */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Flashcards Progress Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-display font-bold text-slate-900">Active Recall Mastery:</span>
              <span className="text-xs font-mono-ledger font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {masteredCount} / {flashcards.length} Mastered ({Math.round((masteredCount / flashcards.length) * 100)}%)
              </span>
            </div>

            <button
              onClick={() => {
                setFlashcards(prev => prev.map(f => ({ ...f, mastered: false })));
                setFlippedCards({});
                showToast('Flashcards reset for a fresh study session!', 'info');
              }}
              className="text-xs font-mono-ledger text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Deck
            </button>
          </div>

          {/* Flashcards 3D Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {flashcards.map(fc => {
              const isFlipped = !!flippedCards[fc.id];
              return (
                <div
                  key={fc.id}
                  onClick={() => toggleCardFlip(fc.id)}
                  className={`p-6 rounded-3xl min-h-[240px] flex flex-col justify-between border transition-all cursor-pointer select-none shadow-sm hover:shadow-md ${
                    fc.mastered
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isFlipped
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[10px] font-mono-ledger font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {fc.skill}
                    </span>
                    <span className="text-[10px] font-mono-ledger text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Click to flip
                    </span>
                  </div>

                  {/* Question or Answer */}
                  <div className="py-4 text-center">
                    {!isFlipped ? (
                      <p className="font-display font-bold text-sm text-slate-900 leading-relaxed">
                        &ldquo;{fc.q}&rdquo;
                      </p>
                    ) : (
                      <p className="font-sans text-xs text-slate-800 leading-relaxed bg-white/90 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                        {fc.a}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action / Mastery Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono-ledger text-slate-400">
                      {isFlipped ? 'Answer Revealed' : 'Question Prompt'}
                    </span>

                    <button
                      onClick={e => toggleMastery(fc.id, e)}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono-ledger font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        fc.mastered
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{fc.mastered ? 'Mastered' : 'Mark Known'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: CREATE NOTE / AI SYNTHESIZER ───────────────────────────── */}
      {activeTab === 'create' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Note & Flashcard Synthesizer
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Enter a topic or raw study notes. AI will automatically format structured takeaways, code examples, and study flashcards.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGeneratingAI}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              {isGeneratingAI ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Synthesize with Gemini AI</span>
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Note Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus & Raft Protocol"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Skill / Domain Track
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={noteSkill}
                  onChange={e => setNoteSkill(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                Executive Summary / Abstract
              </label>
              <textarea
                rows={2}
                placeholder="High-level overview of the concept or session..."
                value={noteSummary}
                onChange={e => setNoteSummary(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                Key Concepts / Takeaways (One per line)
              </label>
              <textarea
                rows={3}
                placeholder="› Leader election heartbeat mechanism\n› Log replication state machine\n› Commit index durability guarantee"
                value={noteTakeaways}
                onChange={e => setNoteTakeaways(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono-ledger font-bold text-slate-700 uppercase">
                  Code Snippet (Optional)
                </label>
                <select
                  value={noteCodeLang}
                  onChange={e => setNoteCodeLang(e.target.value)}
                  className="text-[11px] font-mono-ledger p-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="rust">Rust</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="// Enter code snippet or implementation example..."
                value={noteCode}
                onChange={e => setNoteCode(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono-ledger text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Save to Second-Brain Wiki 📚
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
