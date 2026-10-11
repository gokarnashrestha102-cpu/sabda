import React from 'react';
import { DAILY_FEELING_OPTIONS } from '../data/nepaliLiterature';
import { DailyFeelingOption, WorldId } from '../types';
import { soundEngine } from '../audio/SoundEngine';
import { Sparkles, X, Compass } from 'lucide-react';

interface DailyFeelingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeeling: (feeling: DailyFeelingOption) => void;
  currentWorldId: WorldId;
}

export const DailyFeelingModal: React.FC<DailyFeelingModalProps> = ({
  isOpen,
  onClose,
  onSelectFeeling,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Skip button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Skip to Universe"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-300 uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>दैनिक अनुष्ठान · Daily Ritual</span>
          </div>

          <h2 className="text-2xl font-bold font-nepali text-white mb-2">
            आज तपाईंको मन कस्तो छ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/70 mb-6 font-nepali">
            आफ्नो साँचो अनुभूति छान्नुहोस्, मनका शब्दहरूले तपाईंको हृदयको संसार खोल्नेछन्।
          </p>

          {/* Options Grid */}
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {DAILY_FEELING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  soundEngine.playChime(659);
                  onSelectFeeling(opt);
                }}
                className="w-full p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.99] text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold font-nepali text-white group-hover:text-rose-200 transition-colors">
                    {opt.nepaliTitle}
                  </div>
                  <div className="text-xs text-slate-400 font-nepali mt-0.5">
                    {opt.description}
                  </div>
                </div>
                <span className="text-xs text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                  →
                </span>
              </button>
            ))}
          </div>

          {/* Skip option */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>भावना नछानी ब्रह्माण्डमा प्रवेश गर्नुहोस् (Skip)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
