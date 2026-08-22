'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Video, Sparkles, CheckCheck,
  Calendar, Trash2, ShieldCheck, Flame, MessageSquare
} from 'lucide-react';
import { ScreenTab } from '../layout/HeaderNav';

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
    clearPeerChat,
    startLiveSession,
    showToast,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeChatPeer]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeChat]);

  if (!activeChatPeer) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    sendPeerMessage(activePeerId, inputVal);
    setInputVal('');
  };

  const handleQuickPrompt = (promptText: string) => {
    sendPeerMessage(activePeerId, promptText);
  };

  const handleStartStudyRoom = () => {
    startLiveSession(
      `1-on-1 Exchange: ${currentUser.skillsToTeach[0]?.skillName || 'Skill'} ⇄ ${activeChatPeer.skill}`,
      currentUser.name,
      activeChatPeer.name,
      activeChatPeer.skill
    );
    showToast(`Entering Live Study Room with ${activeChatPeer.name}...`, 'success');
    closeChat();
    if (onNavigate) {
      onNavigate('session');
    }
  };

  const quickPrompts = [
    { label: '🤝 1-hr swap', text: `Hi ${activeChatPeer.name}! I'd love to do a 1-on-1 skill exchange session with you.` },
    { label: '📅 Availability', text: 'When are you free this week for a 45-minute exchange session?' },
    { label: '⚡ Enter room', text: `Let's jump into the Live Study Room right now!` },
    { label: '📚 Syllabus', text: 'Could you share the key topics we can cover in our first session?' },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
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
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
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
                <span className="text-amber-700 font-semibold truncate">
                  {activeChatPeer.skill}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 flex items-center gap-0.5">
                  Active now
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Start Live Session Button */}
            <button
              onClick={handleStartStudyRoom}
              className="px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95 whitespace-nowrap"
              title="Launch Live Study Room with this peer"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Study Room</span>
            </button>

            {/* Clear messages */}
            {messages.length > 0 && (
              <button
                onClick={() => clearPeerChat(activePeerId)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Drawer */}
            <button
              onClick={closeChat}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
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
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-medium whitespace-nowrap transition-all hover:border-slate-300 shadow-2xs active:scale-95"
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
              Today • Verified Peer Chat
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No messages yet with {activeChatPeer.name}</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Send a message or tap one of the quick prompts above to propose a peer exchange!
              </p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.isMe || m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-150`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[80%] leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    <p className="break-words text-[12.5px]">{m.text}</p>
                  </div>

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
          {/* Reaction chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {['👍', '🎸', '🐍', '💡', '🔥', '✨'].map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputVal(prev => prev + emoji)}
                className="px-2 py-0.5 rounded-lg hover:bg-slate-100 text-sm transition-colors"
                title="Add emoji"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Message ${activeChatPeer.name}...`}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                inputVal.trim()
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
