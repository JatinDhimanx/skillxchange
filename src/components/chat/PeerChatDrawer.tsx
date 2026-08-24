'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Video, Sparkles, CheckCheck,
  Calendar, Trash2, ShieldCheck, Flame, MessageSquare,
  ArrowRightLeft, CheckCircle2, Clock, Award, Mic, Paperclip
} from 'lucide-react';
import { ScreenTab } from '../layout/HeaderNav';
import confetti from 'canvas-confetti';

interface PeerChatDrawerProps {
  onNavigate?: (tab: ScreenTab) => void;
}

export const PeerChatDrawer: React.FC<PeerChatDrawerProps> = ({ onNavigate }) => {
  const {
    currentUser,
    activeChatPeer,
    closeChat,
    peerConversations,
    isPeerTyping,
    sendPeerMessage,
    sendPeerTyping,
    clearPeerChat,
    startLiveSession,
    invitePeerToStudyRoom,
    sendExchangeProposal,
    acceptExchangeProposal,
    showToast,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [selectedTheirSkill, setSelectedTheirSkill] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activePeerId = activeChatPeer?.id || '';
  const messages = (activePeerId && peerConversations[activePeerId]) || [];
  const isTyping = Boolean(activePeerId && isPeerTyping[activePeerId]);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeChatPeer) {
      setSelectedMySkill(currentUser.skillsToTeach[0]?.skillName || 'General Skills');
      setSelectedTheirSkill(activeChatPeer.skill || 'Peer Skills');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeChatPeer, currentUser]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeChat]);

  if (!activeChatPeer) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (activePeerId) {
      sendPeerTyping(activePeerId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendPeerTyping(activePeerId, false);
      }, 2000);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendPeerTyping(activePeerId, false);
    sendPeerMessage(activePeerId, inputVal.trim());
    setInputVal('');
  };

  const handleQuickPrompt = (promptText: string) => {
    sendPeerMessage(activePeerId, promptText);
  };

  const handleStartStudyRoom = () => {
    invitePeerToStudyRoom(
      activePeerId,
      activeChatPeer.skill,
      `1-on-1 Exchange: ${currentUser.skillsToTeach[0]?.skillName || 'Skill'} ⇄ ${activeChatPeer.skill}`
    );
    closeChat();
    if (onNavigate) {
      onNavigate('session');
    }
  };

  const handleCreateChatSwapProposal = (e: React.FormEvent) => {
    e.preventDefault();
    sendExchangeProposal(activePeerId, selectedMySkill, selectedTheirSkill);
    setShowSwapModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const simulateVoiceNote = () => {
    setIsRecordingVoice(true);
    showToast('Simulating voice message...', 'info');
    setTimeout(() => {
      setIsRecordingVoice(false);
      sendPeerMessage(activePeerId, '🎙️ [Voice Note: 0:14s] Hey! Excited for our exchange session.');
    }, 1500);
  };

  const quickPrompts = [
    { label: '🤝 Propose 1-hr swap', text: `Hi ${activeChatPeer.name}! I'd love to propose a 1-on-1 skill exchange: my ${currentUser.skillsToTeach[0]?.skillName || 'skills'} for your ${activeChatPeer.skill}.` },
    { label: '📅 Availability', text: 'When are you free this week for a 45-minute exchange session?' },
    { label: '⚡ Enter room', text: `Let's jump into the Live Study Room right now!` },
    { label: '📚 Review syllabus', text: 'Could you share the key practical drills we will cover in our first session?' },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeChat}
    >
      <div
        className="w-full sm:max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── TOP BAR ─────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeChatPeer.avatar}
                alt={activeChatPeer.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                  {activeChatPeer.name}
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono-ledger">
                <span className="text-amber-700 font-bold truncate">
                  {activeChatPeer.skill}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Swap Proposal Button */}
            <button
              onClick={() => setShowSwapModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
              title="Propose 1-on-1 Barter Swap"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Swap</span>
            </button>

            {/* Start Live Session Button */}
            <button
              onClick={handleStartStudyRoom}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              title="Launch Live Study Room with this peer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Room</span>
            </button>

            {/* Clear messages */}
            {messages.length > 0 && (
              <button
                onClick={() => clearPeerChat(activePeerId)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Drawer */}
            <button
              onClick={closeChat}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── QUICK PROMPTS CHIPS BAR ────────────────────── */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
          <span className="text-[10px] font-mono-ledger text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(qp.text)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-medium whitespace-nowrap transition-all hover:border-slate-300 shadow-2xs active:scale-95 cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* ── MESSAGES CONTAINER ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs font-sans bg-[#FAFBFD]">
          {/* Day banner */}
          <div className="flex items-center justify-center my-1">
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono-ledger font-medium">
              Today • End-to-End Escrow Protected Peer Chat
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No messages yet with {activeChatPeer.name}</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Send a message or tap one of the quick prompts above to propose a peer exchange!
              </p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.isMe || m.senderId === currentUser.id;
              const isProposal = m.type === 'proposal' || Boolean(m.proposalData);

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-150`}
                >
                  {/* Standard Message vs Rich Proposal Agreement Card */}
                  {isProposal ? (
                    <div className="p-4 rounded-3xl bg-white border-2 border-emerald-300 shadow-md max-w-[90%] space-y-3 text-slate-900">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono-ledger font-bold flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3 text-emerald-600" /> Bilateral Barter Swap
                        </span>
                        <span className="text-[10px] font-mono-ledger text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Escrow Ready
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800">{m.text}</p>

                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono-ledger text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Offered:</span>
                          <span className="font-bold text-slate-900">{m.proposalData?.offeredSkill || 'Python'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Wanted:</span>
                          <span className="font-bold text-slate-900">{m.proposalData?.wantedSkill || activeChatPeer.skill}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleStartStudyRoom}
                          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Video className="w-3 h-3" />
                          <span>Enter Study Room</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[80%] leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                      }`}
                    >
                      <p className="break-words text-[12.5px]">{m.text}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1 px-1 text-[9.5px] font-mono-ledger text-slate-400">
                    <span>{m.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              );
            })
          )}

          {/* Peer Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 max-w-[140px] shadow-2xs animate-pulse">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
              </div>
              <span className="text-[10px] font-mono-ledger text-slate-500 truncate">
                {activeChatPeer.name.split(' ')[0]} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT BAR ──────────────────────────────────── */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
          {/* Reaction & Emoji Quick Chips */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {['👍', '🎸', '🐍', '💡', '🔥', '✨'].map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputVal(prev => prev + emoji)}
                  className="px-2 py-0.5 rounded-lg hover:bg-slate-100 text-sm transition-colors cursor-pointer"
                  title="Add emoji"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={simulateVoiceNote}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer ${
                isRecordingVoice ? 'text-rose-600 animate-pulse' : ''
              }`}
              title="Voice message"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Message ${activeChatPeer.name}...`}
              value={inputVal}
              onChange={handleInputChange}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center transition-all ${
                inputVal.trim()
                  ? 'bg-slate-900 hover:bg-emerald-600 text-white shadow-xs active:scale-95 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ── IN-CHAT PROPOSE BARTER SWAP MODAL ───────────────────────── */}
      {showSwapModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSwapModal(false)}
        >
          <div
            className="w-full max-w-sm max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-ledger font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  1-on-1 Barter Agreement
                </span>
                <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                  Propose Swap to {activeChatPeer.name}
                </h3>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChatSwapProposal} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
                <div>
                  <label className="block text-[11px] font-mono-ledger font-bold text-slate-700 mb-1">
                    You will teach:
                  </label>
                  <select
                    value={selectedMySkill}
                    onChange={e => setSelectedMySkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none"
                  >
                    {currentUser.skillsToTeach?.map((s, idx) => (
                      <option key={idx} value={s.skillName}>{s.skillName} ({s.level})</option>
                    ))}
                    {(!currentUser.skillsToTeach || currentUser.skillsToTeach.length === 0) && (
                      <option value="General Technical Skills">General Technical Guidance</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-ledger font-bold text-slate-700 mb-1">
                    You will learn:
                  </label>
                  <input
                    type="text"
                    value={selectedTheirSkill}
                    onChange={e => setSelectedTheirSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono-ledger focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10.5px] font-mono-ledger text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>0 INR required. Automatically protected by Smart Escrow.</span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Barter Proposal in Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
