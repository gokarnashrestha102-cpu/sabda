import React, { useState } from 'react';
import { LiteraryCategory, LiteraryItem, WorldId, UserCustomEntry } from '../types';
import { WORLDS } from '../data/nepaliLiterature';
import { soundEngine } from '../audio/SoundEngine';
import {
  Search,
  X,
  Heart,
  Feather,
  Plus,
  Trash2,
  Image as ImageIcon,
  BookMarked,
} from 'lucide-react';

interface CategoryDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LiteraryItem[];
  favorites: string[];
  userEntries: UserCustomEntry[];
  onAddUserEntry: (entry: Omit<UserCustomEntry, 'id' | 'createdAt'>) => void;
  onDeleteUserEntry: (id: string) => void;
  onSelectItem: (item: LiteraryItem) => void;
  onOpenStudio: (item: LiteraryItem) => void;
}

export const CategoryDirectoryModal: React.FC<CategoryDirectoryModalProps> = ({
  isOpen,
  onClose,
  items,
  favorites,
  userEntries,
  onAddUserEntry,
  onDeleteUserEntry,
  onSelectItem,
  onOpenStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'diary'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LiteraryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Diary Entry Form
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<LiteraryCategory>('shayari');
  const [newWorld, setNewWorld] = useState<WorldId>('love');

  if (!isOpen) return null;

  // Filter items
  const filteredItems = items.filter((item) => {
    // Favorites tab check
    if (activeTab === 'favorites' && !favorites.includes(item.id)) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = item.text.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      const matchRoman = item.romanizedText?.toLowerCase().includes(q) || false;
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchText || matchTitle || matchAuthor || matchRoman || matchTags;
    }

    return true;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    soundEngine.playChime(784);
    onAddUserEntry({
      title: newTitle.trim() || 'मेरो रचना',
      text: newText.trim(),
      author: newAuthor.trim() || 'म',
      category: newCategory,
      world: newWorld,
    });

    setNewTitle('');
    setNewText('');
    setNewAuthor('');
  };

  const categoriesList: { id: LiteraryCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'सबै (All)' },
    { id: 'shayari', label: 'शायरी' },
    { id: 'ghazal', label: 'गजल' },
    { id: 'poem', label: 'कविता' },
    { id: 'pickup', label: 'पिकअप लाइन्स' },
    { id: 'quote', label: 'भनाइहरू' },
    { id: 'letter', label: 'प्रेमपत्र' },
    { id: 'story', label: 'कथा/मुक्तक' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold font-nepali text-white">
              साहित्य सङ्ग्रह र डायरी · Nepali Literature
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 pb-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-nepali transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            साहित्य अन्वेषण ({items.length})
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('favorites');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-nepali transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>मन परेका शब्द ({favorites.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('diary');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-nepali transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'diary'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>मेरो डायरी ({userEntries.length})</span>
          </button>
        </div>

        {activeTab !== 'diary' ? (
          <>
            {/* Search and Category Filter Toolbar */}
            <div className="space-y-3 pb-4 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खोज्नुहोस्: 'माया', 'sad', 'गजल', 'आँसु', 'life'..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-nepali whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-white/20 text-white font-medium'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-nepali">
                  कुनै पनि पङ्क्ति भेटिएन।
                </div>
              ) : (
                filteredItems.map((item) => {
                  const world = WORLDS.find((w) => w.id === item.world);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div
                        onClick={() => {
                          soundEngine.playClick();
                          onSelectItem(item);
                        }}
                        className="cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: world?.accentColor || '#f43f5e' }}
                          />
                          <span className="font-nepali">{world?.nameNepali}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.subCategory}</span>
                        </div>
                        <div className="text-sm font-poetic text-white line-clamp-2">
                          {item.text}
                        </div>
                        <div className="text-xs text-slate-400 font-nepali mt-1 italic">
                          — {item.author}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onOpenStudio(item);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="कार्ड बनाउनुहोस्"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
                          <span>कार्ड</span>
                        </button>
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectItem(item);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-nepali transition-colors cursor-pointer"
                        >
                          पढ्नुहोस् →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* DIARY / MY CREATIONS TAB */
          <div className="overflow-y-auto space-y-6 pr-1 flex-1">
            {/* Create form */}
            <form
              onSubmit={handleCreateEntry}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
            >
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium font-nepali">
                <Plus className="w-4 h-4" />
                <span>नयाँ रचना कोर्नुहोस् · Pen Your Thoughts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="शीर्षक (जस्तै: मनको कुरा)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                />
                <input
                  type="text"
                  placeholder="सर्जकको नाम"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <textarea
                placeholder="यहाँ आफ्ना कविता, शायरी, गजल वा मुक्तक लेख्नुहोस्..."
                rows={4}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400 resize-none font-nepali"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LiteraryCategory)}
                    className="p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200"
                  >
                    <option value="shayari">शायरी</option>
                    <option value="ghazal">गजल</option>
                    <option value="poem">कविता</option>
                    <option value="pickup">पिकअप लाइन्स</option>
                    <option value="quote">भनाइ</option>
                    <option value="letter">प्रेमपत्र</option>
                  </select>

                  <select
                    value={newWorld}
                    onChange={(e) => setNewWorld(e.target.value as WorldId)}
                    className="p-2 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200"
                  >
                    {WORLDS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameNepali} ({w.nameEnglish})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  डायरीमा सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>

            {/* List of user entries */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 font-nepali">
                तपाईंका रचनाहरू ({userEntries.length})
              </h4>
              {userEntries.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-nepali">
                  अहिलेसम्म कुनै रचना लेखिएको छैन। माथिको फारमबाट आफ्ना शब्दहरू थप्नुहोस्!
                </div>
              ) : (
                userEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs text-slate-400">
                        {entry.title} · <span className="font-nepali">{entry.author}</span>
                      </div>
                      <div className="text-sm font-poetic text-white whitespace-pre-line mt-1">
                        {entry.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onOpenStudio({
                            id: entry.id,
                            title: entry.title,
                            text: entry.text,
                            author: entry.author,
                            category: entry.category,
                            world: entry.world,
                            subCategory: 'मेरो रचना',
                            tags: ['डायरी'],
                          });
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title="कार्ड बनाउनुहोस्"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onDeleteUserEntry(entry.id);
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                        title="हटाउनुहोस्"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
