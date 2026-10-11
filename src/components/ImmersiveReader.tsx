import React, { useState, useEffect, useCallback } from 'react';
import { LiteraryItem, WorldDefinition } from '../types';
import { soundEngine } from '../audio/SoundEngine';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Copy,
  Image as ImageIcon,
  Check,
  BookOpen,
  LayoutGrid,
  Info,
} from 'lucide-react';

interface ImmersiveReaderProps {
  items: LiteraryItem[];
  world: WorldDefinition;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onOpenStudio: (item: LiteraryItem) => void;
  onToggleViewMode: () => void;
  isListView: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ImmersiveReader: React.FC<ImmersiveReaderProps> = ({
  items,
  world,
  currentIndex,
  onNavigate,
  onOpenStudio,
  onToggleViewMode,
  isListView,
  favorites,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const currentItem = items[currentIndex] || items[0];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      soundEngine.playChime(587);
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      soundEngine.playChime(659);
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (!currentItem) {
    return (
      <div className="text-center py-20 text-white/60 font-nepali">
        कुनै साहित्य भेटिएन।
      </div>
    );
  }

  const isFav = favorites.includes(currentItem.id);

  const handleCopy = async () => {
    soundEngine.playClick();
    await navigator.clipboard.writeText(
      `${currentItem.text}\n\n— ${currentItem.author}\n(मनका शब्द)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    soundEngine.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.title,
          text: `${currentItem.text}\n\n— ${currentItem.author}\n(मनका शब्द)`,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-between min-h-[460px] p-4 sm:p-8">
      {/* Top Bar for Reader Mode */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <span className="font-nepali text-white/80 font-medium">
            {currentItem.subCategory || currentItem.category}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* View mode toggle (Immersive single view vs Fast Grid view) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleViewMode();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {isListView ? (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>गहन पठन (Immersive)</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>द्रुत सूची (Browse All)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Literary Card Focus */}
      <div className="my-auto py-8 sm:py-12 w-full text-center flex flex-col items-center">
        {/* Title */}
        <h3 className="text-sm uppercase tracking-widest text-white/50 font-medium mb-4">
          {currentItem.title}
        </h3>

        {/* Poetic Lines with pristine Devanagari typography */}
        <div className="text-xl sm:text-2xl md:text-3xl leading-relaxed sm:leading-loose font-poetic text-white max-w-2xl px-2 whitespace-pre-line drop-shadow-md select-text transition-all duration-300">
          {currentItem.text}
        </div>

        {/* English poetic translation / reflection toggle */}
        {currentItem.englishMeaning && (
          <div className="mt-4">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowEnglish(!showEnglish);
              }}
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 mx-auto cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>{showEnglish ? 'अनुवाद लुकाउनुहोस्' : 'English Meaning'}</span>
            </button>
            {showEnglish && (
              <p className="mt-2 text-xs sm:text-sm text-slate-300/80 italic max-w-lg mx-auto font-sans">
                "{currentItem.englishMeaning}"
              </p>
            )}
          </div>
        )}

        {/* Author signature */}
        <div className="mt-6 text-sm text-white/70 font-nepali italic">
          — {currentItem.author}
        </div>
      </div>

      {/* Bottom Controls & Interaction Toolbar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md transition-all cursor-pointer ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-white/15 active:scale-95 text-white'
            }`}
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/50 px-2">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === items.length - 1}
            className={`p-2.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md transition-all cursor-pointer ${
              currentIndex === items.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-white/15 active:scale-95 text-white'
            }`}
            aria-label="Next quote"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: Favorite, Studio, Share, Copy */}
        <div className="flex items-center gap-2">
          {/* Favorite button */}
          <button
            onClick={() => {
              soundEngine.playChime(isFav ? 440 : 880);
              onToggleFavorite(currentItem.id);
            }}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isFav
                ? 'bg-rose-500/30 border-rose-400 text-rose-300'
                : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            title="मन परेको सूचीमा राख्नुहोस्"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
          </button>

          {/* Open in Quote Studio */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenStudio(currentItem);
            }}
            className="px-3.5 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="कार्ड स्टुडियोमा खोल्नुहोस्"
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
            <span>कार्ड बनाउनुहोस्</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Copy text"
            title="कपी गर्नुहोस्"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Share text"
            title="साझा गर्नुहोस्"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
