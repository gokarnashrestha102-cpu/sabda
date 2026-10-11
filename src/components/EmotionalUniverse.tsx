import React from 'react';
import { WorldDefinition, WorldId } from '../types';
import { WORLDS } from '../data/nepaliLiterature';
import { FeelingCore } from './FeelingCore';
import { soundEngine } from '../audio/SoundEngine';
import { Sparkles, ArrowRight } from 'lucide-react';

interface EmotionalUniverseProps {
  currentWorld: WorldDefinition;
  onSelectWorld: (id: WorldId) => void;
  onExploreWorld: (id: WorldId) => void;
  onOpenDaily: () => void;
}

export const EmotionalUniverse: React.FC<EmotionalUniverseProps> = ({
  currentWorld,
  onSelectWorld,
  onExploreWorld,
  onOpenDaily,
}) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-between px-4 py-6 select-none overflow-hidden">
      {/* Dynamic Background Atmosphere Glow */}
      <div
        className="absolute inset-0 transition-all duration-1000 -z-10 opacity-70 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${currentWorld.accentColor}25 0%, transparent 70%)`,
        }}
      />

      {/* Top Banner: Elegant signature line that changes with the world */}
      <div className="w-full max-w-2xl text-center z-10 pt-2 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-3 backdrop-blur-md">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentWorld.accentColor }}
          />
          <span className="font-nepali">{currentWorld.nameNepali}</span>
          <span aria-hidden="true">·</span>
          <span>{currentWorld.nameEnglish}</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-poetic text-white leading-relaxed tracking-wide px-2 drop-shadow-lg">
          "{currentWorld.signatureQuote}"
        </h1>

        <p className="text-xs text-white/50 font-nepali mt-2">
          {currentWorld.subtitle}
        </p>
      </div>

      {/* Centerpiece: Interactive 3D Feeling Core */}
      <div className="my-auto py-6 sm:py-8 z-10 flex flex-col items-center">
        <FeelingCore
          world={currentWorld}
          onExploreWorld={() => onExploreWorld(currentWorld.id)}
        />
      </div>

      {/* Bottom Section: Floating Emotional Portals Selector */}
      <div className="w-full max-w-4xl z-10 pb-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs text-white/50 font-nepali">
            अन्य भावना संसार रोज्नुहोस् (Select Emotional Realm):
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDaily();
            }}
            className="text-xs text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-1 font-nepali cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>आजको भावना रोज्नुहोस्</span>
          </button>
        </div>

        {/* 8 Emotional Portals Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1">
          {WORLDS.map((w) => {
            const isSelected = w.id === currentWorld.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  soundEngine.playChime(
                    w.id === 'sad' ? 440 : w.id === 'love' ? 523 : 659
                  );
                  onSelectWorld(w.id);
                }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 cursor-pointer backdrop-blur-md min-h-[44px] ${
                  isSelected
                    ? 'bg-white/20 border-white/40 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected
                    ? `0 0 20px ${w.accentColor}40`
                    : undefined,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full transition-transform"
                  style={{
                    backgroundColor: w.accentColor,
                    transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                <div className="text-left">
                  <div
                    className={`text-xs font-nepali font-medium leading-none ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {w.nameNepali}
                  </div>
                  <div className="text-[10px] text-white/40 leading-none mt-1">
                    {w.nameEnglish}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
