'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  RotateCw,
  Sparkles,
} from 'lucide-react';

export const SecondBrainNotebook: React.FC = () => {
  const { searchQueryNotebook, setSearchQueryNotebook, filteredNotebookEntries } = useApp();
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [flashcardFlipped, setFlashcardFlipped] = useState<{ [key: number]: boolean }>({});

  const toggleFlip = (idx: number) => {
    setFlashcardFlipped(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const flashcards = [
    {
      q: 'Why does NumPy slice indexing create memory views rather than copies?',
      a: 'To maximize speed and avoid memory overhead by sharing the underlying C-contiguous buffer with offset strides.',
      skill: 'Python Data Science',
    },
    {
      q: 'What is the fundamental right-hand rule of Travis Picking?',
      a: 'The thumb maintains a steady alternating bass on downbeats, while index/middle fingers syncopate treble melodies.',
      skill: 'Acoustic Guitar',
    },
    {
      q: 'What is the purpose of Raymarching Distance Estimators in GLSL?',
      a: 'To determine how far a light ray can safely step through 3D space without penetrating implicit surface geometries.',
      skill: 'GLSL Shaders',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono-ledger font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-600" /> Section 60.8 Innovation
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-ledger font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Personal Session Wiki & Flashcards
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Second-Brain <span className="text-amber-600">Auto-Built Notebook</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Every live session transcript, whiteboard diagram, and code drill is automatically indexed into your personal searchable knowledge graph.
            </p>
          </div>

          {/* Search Bar & View Mode Toggle */}
          <div className="space-y-3 shrink-0 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search wiki (Pandas, Travis picking)..."
                value={searchQueryNotebook}
                onChange={e => setSearchQueryNotebook(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  activeTab === 'notes'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Session Notes ({filteredNotebookEntries.length})
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  activeTab === 'flashcards'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flashcards (3)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'notes' ? (
        filteredNotebookEntries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">No Session Notes Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Your Second-Brain wiki auto-indexes transcripts, key takeaways, and code snippets whenever you complete a live peer study room session.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotebookEntries.map(entry => (
              <div
                key={entry.id}
                className="paper-card rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm bg-white border border-slate-200"
              >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono-ledger font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {entry.skillName}
                    </span>
                    <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                      {entry.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-ledger text-slate-400 whitespace-nowrap">
                    {entry.date}
                  </span>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 font-mono-ledger text-[10.5px] uppercase">
                    Key Concepts:
                  </span>
                  <ul className="space-y-1 text-slate-600 font-sans">
                    {entry.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Snippet if present */}
                {entry.codeSnippets && entry.codeSnippets.length > 0 && (
                  <div className="rounded-2xl bg-slate-900 p-3.5 text-[11px] font-mono-ledger text-emerald-400 overflow-x-auto">
                    <pre><code>{entry.codeSnippets[0]?.code}</code></pre>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-ledger text-slate-400">
                <span>Teacher: <strong className="text-slate-700">{entry.teacherName}</strong></span>
                <span className="text-emerald-700 font-bold">Auto-Indexed</span>
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        /* Flashcards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((fc, idx) => {
            const isFlipped = !!flashcardFlipped[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleFlip(idx)}
                className="paper-card rounded-3xl p-6 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all hover:border-amber-400 shadow-sm bg-white border border-slate-200 select-none"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono-ledger font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {fc.skill}
                  </span>
                  <span className="text-[10px] font-mono-ledger text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Click to flip
                  </span>
                </div>

                <div className="py-4 text-center">
                  {!isFlipped ? (
                    <p className="font-display font-bold text-sm text-slate-900 leading-relaxed">
                      "{fc.q}"
                    </p>
                  ) : (
                    <p className="font-sans text-xs text-emerald-800 leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                      {fc.a}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-mono-ledger text-slate-400">
                    {isFlipped ? 'Answer Revealed' : 'Question Prompt'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
