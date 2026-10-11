import React, { useState } from 'react';
import { WorldDefinition, LiteraryItem } from '../types';
import { ImmersiveReader } from './ImmersiveReader';
import { LetItGoExperience } from './LetItGoExperience';
import { soundEngine } from '../audio/SoundEngine';
import {
  ArrowLeft,
  Sparkles,
  HeartHandshake,
  Image as ImageIcon,
  Heart,
} from 'lucide-react';

interface WorldViewProps {
  world: WorldDefinition;
  items: LiteraryItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onBackToUniverse: () => void;
  onOpenStudio: (item: LiteraryItem) => void;
}

export const WorldView: React.FC<WorldViewProps> = ({
  world,
  items,
  favorites,
  onToggleFavorite,
  onBackToUniverse,
  onOpenStudio,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListView, setIsListView] = useState(false);
  const [showLetItGo, setShowLetItGo] = useState(false);

  // Subcategories present in this world
  const subCategories = Array.from(
    new Set(items.map((i) => i.subCategory || i.category))
  );

  const filteredItems =
    selectedSubCategory === 'all'
      ? items
      : items.filter(
          (i) => (i.subCategory || i.category) === selectedSubCategory
        );

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Navigation Strip */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 z-10 pb-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            onBackToUniverse();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ब्रह्माण्ड फर्कनुहोस् (Universe)</span>
        </button>

        {/* Breakup world has dedicated "Let It Go" experience button */}
        {world.id === 'breakup' && (
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowLetItGo(!showLetItGo);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
              showLetItGo
                ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                : 'bg-white/10 border-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
            <span>मन हल्का गरौँ (Let It Go)</span>
          </button>
        )}
      </div>

      {/* Main World Content */}
      <div className="w-full max-w-4xl mx-auto z-10 flex-1 flex flex-col justify-center">
        {showLetItGo && world.id === 'breakup' ? (
          <div className="my-auto py-6">
            <LetItGoExperience />
          </div>
        ) : isListView ? (
          /* Grid Browse Mode */
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg font-semibold font-nepali text-white">
                {world.nameNepali}का रचनाहरू ({filteredItems.length})
              </h2>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsListView(false);
                }}
                className="text-xs text-rose-300 hover:text-rose-200 font-nepali cursor-pointer"
              >
                ← एकल पठन (Immersive Mode)
              </button>
            </div>

            {/* Subcategory filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedSubCategory('all');
                }}
                className={`px-3 py-1 rounded-full text-xs font-nepali whitespace-nowrap cursor-pointer transition-colors ${
                  selectedSubCategory === 'all'
                    ? 'bg-white/20 text-white font-medium'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                सबै विधा
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedSubCategory(sub);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-nepali whitespace-nowrap cursor-pointer transition-colors ${
                    selectedSubCategory === sub
                      ? 'bg-white/20 text-white font-medium'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {filteredItems.map((item, idx) => {
                const isFav = favorites.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                        <span className="font-nepali">{item.subCategory}</span>
                        <span>{item.author}</span>
                      </div>
                      <p className="text-base font-poetic text-white whitespace-pre-line leading-relaxed">
                        {item.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            soundEngine.playChime(isFav ? 440 : 880);
                            onToggleFavorite(item.id);
                          }}
                          className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
                            isFav ? 'text-rose-400' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onOpenStudio(item);
                          }}
                          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                          title="कार्ड बनाउनुहोस्"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setCurrentIndex(idx);
                          setIsListView(false);
                        }}
                        className="text-xs text-rose-300 hover:text-rose-200 font-nepali cursor-pointer"
                      >
                        गहन पठन →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Immersive Single Focused Reading Mode */
          <ImmersiveReader
            items={filteredItems}
            world={world}
            currentIndex={currentIndex}
            onNavigate={(newIdx) => setCurrentIndex(newIdx)}
            onOpenStudio={onOpenStudio}
            onToggleViewMode={() => setIsListView(true)}
            isListView={false}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </div>

      {/* Bottom Footer Info */}
      <footer className="w-full text-center text-[11px] text-white/30 py-2 z-10">
        मनका शब्द · {world.nameNepali} · {world.subtitle}
      </footer>
    </div>
  );
};
