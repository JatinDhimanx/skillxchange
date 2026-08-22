'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, X, BookOpen, Users, Zap, CheckCircle2 } from 'lucide-react';

const POPULAR_TEACH = ['Python', 'JavaScript', 'Graphic Design', 'Guitar', 'English Speaking', 'Yoga', 'Photography', 'Cooking'];
const POPULAR_LEARN = ['React / Next.js', 'Machine Learning', 'Spanish', 'Piano', 'UI/UX Design', 'Data Analysis', 'Public Speaking', 'Finance'];

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { addSkillToTeach, addSkillToLearn } = useApp();
  const [step, setStep] = useState(0);
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');

  const handleFinish = () => {
    if (teachSkill) addSkillToTeach(teachSkill, 'General', 'Intermediate', 2);
    if (learnSkill) addSkillToLearn(learnSkill, 'Beginner', 'flexible');
    onComplete();
  };

  const steps = [
    {
      title: 'Welcome to SkillXchange 👋',
      subtitle: 'Learn anything for free by teaching what you know. Let\'s get you set up in 3 quick steps.',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { icon: <Users className="w-5 h-5 text-emerald-600" />, label: 'Match with peers who want what you know' },
              { icon: <ArrowRight className="w-5 h-5 text-amber-600" />, label: 'Trade skills 1-on-1 with live study rooms' },
              { icon: <BookOpen className="w-5 h-5 text-blue-600" />, label: 'Earn credits for every hour you teach' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
                {item.icon}
                <span className="text-slate-700 font-medium text-center">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Thousands of peers are already trading skills. Let's find your first match!</p>
        </div>
      ),
      cta: 'Get Started →',
    },
    {
      title: 'What can you teach? 🎯',
      subtitle: 'Pick a skill you\'re good at. Peers looking to learn this will be matched with you.',
      icon: <span className="text-3xl">🎓</span>,
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Type a skill (e.g. Python, Guitar, Cooking...)"
            value={teachSkill}
            onChange={e => setTeachSkill(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
          />
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">Popular skills to teach:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TEACH.map(s => (
                <button
                  key={s}
                  onClick={() => setTeachSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    teachSkill === s
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      cta: teachSkill ? `I can teach ${teachSkill} →` : 'Skip for now →',
    },
    {
      title: 'What do you want to learn? 📚',
      subtitle: 'We\'ll find peers who can teach this to you. You\'ll exchange your skill for theirs.',
      icon: <span className="text-3xl">✨</span>,
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Type what you want to learn..."
            value={learnSkill}
            onChange={e => setLearnSkill(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
          />
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">Most wanted right now:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_LEARN.map(s => (
                <button
                  key={s}
                  onClick={() => setLearnSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    learnSkill === s
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      cta: learnSkill ? `Find matches for ${learnSkill.split(' ')[0]} →` : 'Skip for now →',
    },
    {
      title: "You're all set! 🎉",
      subtitle: 'Your profile is ready. We found peers matching your skills. Start your first exchange!',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
      content: (
        <div className="space-y-3 text-xs">
          {teachSkill && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-lg">🎓</span>
              <div>
                <p className="font-bold text-slate-900">You can teach: <span className="text-amber-700">{teachSkill}</span></p>
                <p className="text-slate-500">Peers looking to learn this will be matched with you</p>
              </div>
            </div>
          )}
          {learnSkill && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-lg">📚</span>
              <div>
                <p className="font-bold text-slate-900">You want to learn: <span className="text-emerald-700">{learnSkill}</span></p>
                <p className="text-slate-500">We'll find peers who can teach you this</p>
              </div>
            </div>
          )}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            💡 Tip: After your first teaching session, you'll earn credits to book any tutor on the platform — completely free!
          </div>
        </div>
      ),
      cta: 'Find my first match →',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const currentStep = steps[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onComplete}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-emerald-500' : i < step ? 'w-4 bg-emerald-300' : 'w-4 bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onComplete}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Icon + Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">{currentStep.icon}</div>
            <h2 className="font-display font-extrabold text-xl text-slate-900">{currentStep.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{currentStep.subtitle}</p>
          </div>

          {/* Dynamic Content */}
          {currentStep.content}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Back
              </button>
            ) : <div />}

            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  handleFinish();
                }
              }}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              {currentStep.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
