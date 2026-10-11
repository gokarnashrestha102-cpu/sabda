import React, { useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { Sparkles, RefreshCw, HeartHandshake } from 'lucide-react';

interface ShardItem {
  id: string;
  labelNepali: string;
  labelEnglish: string;
  dissolved: boolean;
}

const INITIAL_SHARDS: ShardItem[] = [
  { id: '1', labelNepali: 'अधुरो बाचा', labelEnglish: 'Broken Promise', dissolved: false },
  { id: '2', labelNepali: 'विश्वासघात', labelEnglish: 'Betrayal', dissolved: false },
  { id: '3', labelNepali: 'अपमानित पलहरू', labelEnglish: 'Disrespect', dissolved: false },
  { id: '4', labelNepali: 'छोडेर गएका सम्झना', labelEnglish: 'Fading Memories', dissolved: false },
  { id: '5', labelNepali: 'अनावश्यक अपेक्षा', labelEnglish: 'Unspoken Expectations', dissolved: false },
  { id: '6', labelNepali: 'आफैंप्रतिको शङ्का', labelEnglish: 'Self Doubt', dissolved: false },
];

export const LetItGoExperience: React.FC = () => {
  const [shards, setShards] = useState<ShardItem[]>(INITIAL_SHARDS);
  const [healingQuote, setHealingQuote] = useState<string | null>(null);

  const handleDissolve = (id: string, label: string) => {
    soundEngine.playDissolveGlass();
    setShards((prev) =>
      prev.map((s) => (s.id === id ? { ...s, dissolved: true } : s))
    );

    const healingLines = [
      `"${label}" अब तपाईंसँग छैन, यो प्रकाशमा विलीन भइसक्यो।`,
      'मन हलुका भयो, किनकि तपाईंले छोड्न सक्ने हिम्मत गर्नुभयो।',
      'विगत अन्त्य भयो, अब तपाईंको आफ्नै शान्तिको समय सुरु भयो।',
      'स्वाभिमान फर्कियो, हृदयमा पुनः न्यानो घाम लाग्नेछ।',
    ];
    const picked = healingLines[Math.floor(Math.random() * healingLines.length)];
    setHealingQuote(picked);
  };

  const handleReset = () => {
    soundEngine.playChime(523.25);
    setShards(INITIAL_SHARDS);
    setHealingQuote(null);
  };

  const allDissolved = shards.every((s) => s.dissolved);

  return (
    <div className="relative w-full max-w-2xl mx-auto p-6 rounded-3xl glass-panel border border-purple-500/20 text-center overflow-hidden">
      {/* Background ambient radiance */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 text-purple-300 text-xs tracking-wider uppercase font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>मन हल्का गरौँ · Let It Go Ritual</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-nepali font-semibold text-white mt-2">
          पीडालाई प्रकाशमा विलीन गर्नुहोस्
        </h3>
        <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-md mx-auto">
          जुन कुराले मन भारी बनाएको छ, त्यसलाई छुनुहोस् र मुस्कुराएर बिदा गर्नुहोस्।
        </p>

        {/* Shard fragments buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
          {shards.map((shard) => (
            <button
              key={shard.id}
              onClick={() => !shard.dissolved && handleDissolve(shard.id, shard.labelNepali)}
              disabled={shard.dissolved}
              className={`p-3.5 rounded-xl border text-left transition-all duration-700 relative overflow-hidden group cursor-pointer ${
                shard.dissolved
                  ? 'border-purple-500/10 bg-purple-950/10 opacity-30 scale-95 pointer-events-none'
                  : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-purple-400/40 active:scale-95 shadow-lg'
              }`}
            >
              {shard.dissolved ? (
                <div className="flex items-center justify-center py-2 text-xs text-purple-300/60 font-nepali">
                  विलीन भयो ✨
                </div>
              ) : (
                <>
                  <div className="text-sm font-nepali font-medium text-slate-100 group-hover:text-purple-200">
                    {shard.labelNepali}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {shard.labelEnglish}
                  </div>
                  <span className="text-[10px] text-purple-400/80 mt-2 block tracking-tight">
                    छुनुहोस् र छोड्नुहोस् →
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Healing Reflection Message */}
        {healingQuote && (
          <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-400/20 text-purple-200 font-nepali text-sm animate-fade-in my-3">
            {healingQuote}
          </div>
        )}

        {allDissolved && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400/30 text-emerald-200 font-nepali text-sm my-3 flex flex-col items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-emerald-400" />
            <span>सबै भारी मन विलीन भयो। तपाईं अब स्वतन्त्र हुनुहुन्छ।</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>पुनः सुरु गर्नुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
};
