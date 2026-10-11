import React, { useState, useRef, useEffect } from 'react';
import { WorldDefinition } from '../types';
import { soundEngine } from '../audio/SoundEngine';

interface FeelingCoreProps {
  world: WorldDefinition;
  onExploreWorld: () => void;
  className?: string;
}

export const FeelingCore: React.FC<FeelingCoreProps> = ({
  world,
  onExploreWorld,
  className = '',
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto slow rotation drift
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;
    const loop = () => {
      if (!isDragging) {
        angle += 0.008;
        setRotation((prev) => ({
          x: Math.sin(angle * 0.5) * 8,
          y: Math.cos(angle * 0.4) * 12,
        }));
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setRotation({
      x: Math.max(-30, Math.min(30, dy * 0.3)),
      y: Math.max(-45, Math.min(45, dx * 0.4)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleTap = () => {
    setPulseCount((prev) => prev + 1);
    soundEngine.playChime(world.id === 'sad' ? 440 : world.id === 'love' ? 587 : 659);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleTap}
      className={`relative select-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center ${className}`}
      style={{ perspective: 1000 }}
      role="button"
      tabIndex={0}
      aria-label={`Interactive Feeling Core for ${world.nameNepali}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleTap();
        }
      }}
    >
      {/* 3D Container with dynamic tilt */}
      <div
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Atmospheric Ambient Glow behind object */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-60 transition-colors duration-1000 pointer-events-none"
          style={{
            backgroundColor: world.accentColor,
            transform: `scale(${1 + (pulseCount % 2) * 0.15})`,
          }}
        />

        {/* Ambient Ring Wave on tap */}
        <div
          key={pulseCount}
          className="absolute w-full h-full rounded-full border border-white/40 pointer-events-none animate-ping opacity-75"
          style={{ animationDuration: '1.4s' }}
        />

        {/* --- DYNAMIC SHAPE RENDERING --- */}
        {world.coreShape === 'heart' && (
          // LOVE: Luminous Glowing Heart
          <div className="relative flex items-center justify-center animate-float-slow">
            <svg
              viewBox="0 0 200 200"
              className="w-52 h-52 sm:w-64 sm:h-64 drop-shadow-[0_0_35px_rgba(244,63,94,0.7)]"
            >
              <defs>
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
                <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Inner pulsed heart path */}
              <path
                d="M100,165 C40,120 15,90 15,55 C15,25 40,10 65,10 C82,10 93,22 100,32 C107,22 118,10 135,10 C160,10 185,25 185,55 C185,90 160,120 100,165 Z"
                fill="url(#heartGrad)"
                filter="url(#bloom)"
                className="transition-transform duration-300 origin-center hover:scale-105"
              />
              {/* Crystalline facets on heart */}
              <path
                d="M100,32 L65,10 L15,55 L100,165 L185,55 L135,10 Z"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <circle cx="100" cy="70" r="18" fill="rgba(255,255,255,0.6)" filter="url(#bloom)" />
            </svg>
            {/* Tiny orbiting firefly sparks */}
            <div className="absolute w-48 h-48 rounded-full border border-rose-400/30 animate-spin" style={{ animationDuration: '12s' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-200 shadow-[0_0_10px_#fff] absolute -top-1 left-1/2" />
            </div>
          </div>
        )}

        {world.coreShape === 'moon' && (
          // SAD: Translucent Moon behind rain clouds
          <div className="relative flex items-center justify-center animate-float-slow">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-slate-200 via-sky-200 to-slate-600 shadow-[0_0_50px_rgba(56,189,248,0.5)] relative overflow-hidden flex items-center justify-center">
              {/* Moon craters */}
              <div className="absolute w-8 h-8 rounded-full bg-slate-400/30 top-10 left-12 blur-[1px]" />
              <div className="absolute w-12 h-12 rounded-full bg-slate-400/25 bottom-12 right-12 blur-[1px]" />
              <div className="absolute w-5 h-5 rounded-full bg-slate-400/35 top-20 right-16 blur-[1px]" />
              {/* Rain droplet trail on surface */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>
            {/* Drifting subtle cloud mist */}
            <div className="absolute -bottom-4 w-64 h-24 bg-gradient-to-r from-sky-950/0 via-sky-900/40 to-slate-950/0 backdrop-blur-md rounded-full pointer-events-none" />
          </div>
        )}

        {world.coreShape === 'crystal' && (
          // BREAKUP: Fractured Translucent Glass Sphere
          <div className="relative flex items-center justify-center animate-float-slow">
            <svg viewBox="0 0 200 200" className="w-52 h-52 sm:w-60 sm:h-60 drop-shadow-[0_0_35px_rgba(192,132,252,0.6)]">
              <defs>
                <linearGradient id="shardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(192,132,252,0.3)" />
                </linearGradient>
                <linearGradient id="shardGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.7)" />
                  <stop offset="100%" stopColor="rgba(88,28,135,0.4)" />
                </linearGradient>
              </defs>
              {/* Fractured polygon shards drifting */}
              <polygon points="100,20 145,55 125,100 80,85" fill="url(#shardGrad1)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              <polygon points="100,20 80,85 45,60 55,25" fill="url(#shardGrad2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              <polygon points="80,85 125,100 135,160 85,175" fill="url(#shardGrad1)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              <polygon points="45,60 80,85 85,175 35,140" fill="url(#shardGrad2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              <polygon points="145,55 175,95 135,160 125,100" fill="url(#shardGrad2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              {/* Crack lines with glowing light */}
              <line x1="100" y1="20" x2="85" y2="175" stroke="#f5d0fe" strokeWidth="2" filter="drop-shadow(0 0 8px #c084fc)" />
            </svg>
            <div className="absolute text-[11px] font-nepali text-purple-200/60 tracking-wider pointer-events-none">
              मुक्ति र हिलिङ
            </div>
          </div>
        )}

        {world.coreShape === 'cosmos' && (
          // LIFE: Celestial Rings and Planetary Stardust
          <div className="relative flex items-center justify-center animate-float-slow">
            {/* Central orb */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-900 via-indigo-600 to-sky-300 shadow-[0_0_45px_rgba(129,140,248,0.7)] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/40 blur-md" />
            </div>
            {/* Celestial Ring 1 */}
            <div
              className="absolute w-60 h-28 rounded-full border-2 border-indigo-400/50 pointer-events-none"
              style={{ transform: 'rotate(-25deg)' }}
            />
            {/* Celestial Ring 2 */}
            <div
              className="absolute w-52 h-20 rounded-full border border-cyan-300/40 pointer-events-none animate-spin"
              style={{ animationDuration: '24s', transform: 'rotate(45deg)' }}
            />
          </div>
        )}

        {world.coreShape === 'sun' && (
          // MOTIVATION: Golden Rising Sun with Mountain Horizon
          <div className="relative flex items-center justify-center animate-float-slow">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-200 shadow-[0_0_65px_rgba(245,158,11,0.8)] relative flex items-center justify-center overflow-hidden">
              {/* Radial sunburst beams */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent animate-pulse" />
              {/* Mountain silhouette at bottom */}
              <svg viewBox="0 0 100 50" className="absolute bottom-0 w-full text-neutral-950/80 fill-current">
                <polygon points="0,50 30,20 55,40 80,15 100,50" />
              </svg>
            </div>
          </div>
        )}

        {world.coreShape === 'lone-orb' && (
          // LONELINESS: Distant Cratered Silver Moon in Deep Space
          <div className="relative flex items-center justify-center animate-float-slow">
            <div className="w-44 h-44 rounded-full bg-gradient-to-br from-slate-300 via-blue-900 to-neutral-950 border border-blue-400/30 shadow-[0_0_40px_rgba(96,165,250,0.5)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-200 shadow-[0_0_12px_#38bdf8]" />
            </div>
          </div>
        )}

        {world.coreShape === 'dual-flame' && (
          // FRIENDSHIP: Two Warm Glowing Lights in Harmony
          <div className="relative flex items-center justify-center animate-float-slow">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-emerald-400/70 blur-xl top-4 left-6 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full bg-teal-300/70 blur-xl bottom-4 right-6 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="w-32 h-32 rounded-full border border-emerald-400/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-200 shadow-[0_0_30px_#10b981]" />
              </div>
            </div>
          </div>
        )}

        {world.coreShape === 'nebula' && (
          // DREAMS: Swirling Cosmic Vortex
          <div className="relative flex items-center justify-center animate-float-slow">
            <div className="w-52 h-52 rounded-full bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-fuchsia-600 via-purple-600 to-indigo-600 blur-sm shadow-[0_0_60px_rgba(232,121,249,0.7)] animate-spin" style={{ animationDuration: '30s' }} />
            <div className="absolute w-40 h-40 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_20px_#fff]" />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Helper Text */}
      <div className="mt-4 flex flex-col items-center text-center">
        <p className="text-xs text-white/50 tracking-wider">
          घुमाउनुहोस् वा छुनुहोस् · स्पर्शमा जीवित
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExploreWorld();
            soundEngine.playClick();
          }}
          className="mt-3 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-medium text-white tracking-wide border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 group cursor-pointer shadow-lg"
        >
          <span>{world.nameNepali} प्रवेश गर्नुहोस्</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};
