import React, { useState, useEffect } from 'react';
import { WorldId, LiteraryItem, DailyFeelingOption, UserCustomEntry } from './types';
import { WORLDS, NEPALI_LITERATURE } from './data/nepaliLiterature';
import { soundEngine } from './audio/SoundEngine';
import { Navbar } from './components/Navbar';
import { AtmosphericParticles } from './components/AtmosphericParticles';
import { EmotionalUniverse } from './components/EmotionalUniverse';
import { WorldView } from './components/WorldView';
import { DailyFeelingModal } from './components/DailyFeelingModal';
import { CategoryDirectoryModal } from './components/CategoryDirectoryModal';
import { QuoteCardStudio } from './components/QuoteCardStudio';
import { Compass, Sparkles, Image as ImageIcon, Heart } from 'lucide-react';

export default function App() {
  const [currentWorldId, setCurrentWorldId] = useState<WorldId>('love');
  const [currentView, setCurrentView] = useState<'universe' | 'reader'>('universe');
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  // Modals state
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeStudioItem, setActiveStudioItem] = useState<LiteraryItem | null>(null);

  // Persistence: Favorites & User Diary
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('manka_shabda_favorites');
      return saved ? JSON.parse(saved) : ['love-1', 'sad-1', 'motivation-1'];
    } catch {
      return ['love-1', 'sad-1', 'motivation-1'];
    }
  });

  const [userEntries, setUserEntries] = useState<UserCustomEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('manka_shabda_diary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily ritual popup on initial session if first time
  useEffect(() => {
    const hasSeenDaily = sessionStorage.getItem('manka_shabda_seen_daily');
    if (!hasSeenDaily) {
      setIsDailyModalOpen(true);
      sessionStorage.setItem('manka_shabda_seen_daily', 'true');
    }
  }, []);

  // Save favorites to localStorage
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('manka_shabda_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Save user diary entry
  const handleAddUserEntry = (entry: Omit<UserCustomEntry, 'id' | 'createdAt'>) => {
    const newEntry: UserCustomEntry = {
      ...entry,
      id: `user-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [newEntry, ...userEntries];
    setUserEntries(updated);
    localStorage.setItem('manka_shabda_diary', JSON.stringify(updated));
  };

  const handleDeleteUserEntry = (id: string) => {
    const updated = userEntries.filter((e) => e.id !== id);
    setUserEntries(updated);
    localStorage.setItem('manka_shabda_diary', JSON.stringify(updated));
  };

  // Change world with soundscape transition
  const handleSelectWorld = (worldId: WorldId) => {
    setCurrentWorldId(worldId);
    soundEngine.playWorldSoundscape(worldId);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  };

  // Select Daily Feeling
  const handleSelectDailyFeeling = (feeling: DailyFeelingOption) => {
    setCurrentWorldId(feeling.targetWorld);
    soundEngine.playWorldSoundscape(feeling.targetWorld);
    setIsDailyModalOpen(false);

    // If item exists, jump directly into reader
    const recommendedItem = NEPALI_LITERATURE.find((i) => i.id === feeling.recommendedQuoteId);
    if (recommendedItem) {
      setCurrentView('reader');
    }
  };

  // Open Studio with custom or current item
  const handleOpenStudio = (item?: LiteraryItem) => {
    setActiveStudioItem(item || null);
    setIsStudioOpen(true);
  };

  const currentWorld = WORLDS.find((w) => w.id === currentWorldId) || WORLDS[0];

  // Combine default literature with user creations for current world
  const combinedWorldItems: LiteraryItem[] = [
    ...NEPALI_LITERATURE.filter((item) => item.world === currentWorldId),
    ...userEntries
      .filter((u) => u.world === currentWorldId)
      .map((u) => ({
        id: u.id,
        title: u.title,
        text: u.text,
        author: u.author,
        world: u.world,
        category: u.category,
        subCategory: 'मेरो रचना',
        tags: ['डायरी'],
      })),
  ];

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col relative transition-colors duration-1000 ${currentWorld.gradient} bg-gradient-to-b overflow-x-hidden`}
    >
      {/* Real-time Dynamic Atmospheric Particle Canvas */}
      <AtmosphericParticles worldId={currentWorldId} />

      {/* Top Navbar Contract */}
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('universe')}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenDaily={() => setIsDailyModalOpen(true)}
        onOpenStudio={() => handleOpenStudio()}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentWorldId={currentWorldId}
        onSelectWorld={handleSelectWorld}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col relative z-10 pb-16 md:pb-4">
        {currentView === 'universe' ? (
          <EmotionalUniverse
            currentWorld={currentWorld}
            onSelectWorld={handleSelectWorld}
            onExploreWorld={(worldId) => {
              handleSelectWorld(worldId);
              setCurrentView('reader');
            }}
            onOpenDaily={() => setIsDailyModalOpen(true)}
          />
        ) : (
          <WorldView
            world={currentWorld}
            items={combinedWorldItems}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBackToUniverse={() => setCurrentView('universe')}
            onOpenStudio={(item) => handleOpenStudio(item)}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            soundEngine.playClick();
            setCurrentView('universe');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
            currentView === 'universe' ? 'text-rose-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-nepali mt-0.5">ब्रह्माण्ड</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsDirectoryOpen(true);
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px] font-nepali mt-0.5">विधा सङ्ग्रह</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsDailyModalOpen(true);
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-nepali mt-0.5">आजको भावना</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            handleOpenStudio();
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[10px] font-nepali mt-0.5">कार्ड स्टुडियो</span>
        </button>
      </div>

      {/* Modals */}
      <DailyFeelingModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        onSelectFeeling={handleSelectDailyFeeling}
        currentWorldId={currentWorldId}
      />

      <CategoryDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        items={NEPALI_LITERATURE}
        favorites={favorites}
        userEntries={userEntries}
        onAddUserEntry={handleAddUserEntry}
        onDeleteUserEntry={handleDeleteUserEntry}
        onSelectItem={(item) => {
          setCurrentWorldId(item.world);
          soundEngine.playWorldSoundscape(item.world);
          setCurrentView('reader');
          setIsDirectoryOpen(false);
        }}
        onOpenStudio={(item) => {
          setIsDirectoryOpen(false);
          handleOpenStudio(item);
        }}
      />

      {isStudioOpen && (
        <QuoteCardStudio
          initialItem={activeStudioItem}
          onClose={() => setIsStudioOpen(false)}
        />
      )}
    </div>
  );
}
