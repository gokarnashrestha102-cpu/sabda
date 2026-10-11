import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Compass } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { WorldId } from '../types';

interface NavbarProps {
  currentView: 'universe' | 'reader';
  onNavigateHome: () => void;
  onOpenDirectory: () => void;
  onOpenDaily: () => void;
  onOpenStudio: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentWorldId: WorldId;
  onSelectWorld: (id: WorldId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onOpenDirectory,
  onOpenDaily,
  onOpenStudio,
  isMuted,
  onToggleMute,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(soundEngine.getVolume());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-black/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          soundEngine.playClick();
          onNavigateHome();
        }}
        className="text-lg sm:text-xl font-bold font-nepali tracking-tight text-white hover:text-rose-300 transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-2 cursor-pointer"
        aria-label="Home"
      >
        <span>मनका शब्द</span>
        <span className="text-xs text-white/40 font-normal font-sans hidden sm:inline">
          · Man Ka Shabda
        </span>
      </button>

      {/* Zone 2: 4–5 concise single-line text nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigateHome();
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-nepali ${
            currentView === 'universe' ? 'text-white underline underline-offset-4 decoration-rose-500' : ''
          }`}
        >
          ब्रह्माण्ड (Universe)
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenDirectory();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-nepali"
        >
          विधा सङ्ग्रह (Browse)
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenDaily();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-nepali flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-rose-400" />
          <span>आजको भावना (Ritual)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenStudio();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-nepali"
        >
          कार्ड स्टुडियो (Studio)
        </button>
      </nav>

      {/* Zone 3: 1 primary action (Interactive Sound Engine & Mobile Triggers) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sound toggle with popover */}
        <div className="relative">
          <button
            onClick={() => {
              onToggleMute();
            }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
              !isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            title={isMuted ? 'ध्वनि अन गर्नुहोस् (Unmute ambient sound)' : 'ध्वनि बन्द गर्नुहोस् (Mute)'}
            aria-label="Toggle ambient soundscapes"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 animate-pulse" />
            )}
          </button>

          {/* Volume slider popover on hover/click */}
          {showVolumeSlider && !isMuted && (
            <div
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute right-0 top-full mt-2 p-3 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-2 z-50 w-36"
            >
              <div className="flex justify-between text-[10px] text-white/60">
                <span>भोल्युम</span>
                <span className="font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-rose-500 cursor-pointer h-1.5"
              />
            </div>
          )}
        </div>

        {/* Explore Button for quick category directory */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenDirectory();
          }}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs font-nepali border border-white/10 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-rose-300" />
          <span>विधा खोज्नुहोस्</span>
        </button>
      </div>
    </header>
  );
};
