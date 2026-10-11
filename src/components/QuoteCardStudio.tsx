import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiteraryItem } from '../types';
import { soundEngine } from '../audio/SoundEngine';
import {
  Download,
  Share2,
  Copy,
  Sparkles,
  Check,
  Type,
  Palette,
  Maximize2,
  X,
} from 'lucide-react';

interface QuoteCardStudioProps {
  initialItem?: LiteraryItem | null;
  onClose?: () => void;
}

type AspectRatio = '1:1' | '9:16' | '4:3' | '16:9';
type ThemeStyle =
  | 'rose-romance'
  | 'midnight-rain'
  | 'celestial-sky'
  | 'golden-dawn'
  | 'faded-memory'
  | 'classic-parchment';
type FontStyle = 'poetic' | 'handwritten' | 'serif';

export const QuoteCardStudio: React.FC<QuoteCardStudioProps> = ({
  initialItem,
  onClose,
}) => {
  const [text, setText] = useState<string>(
    initialItem?.text || 'केही भावना शब्दमा होइन, अनुभूतिमा बाँच्छन्।'
  );
  const [author, setAuthor] = useState<string>(
    initialItem?.author || 'मनका शब्द'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<ThemeStyle>(
    initialItem?.world === 'sad'
      ? 'midnight-rain'
      : initialItem?.world === 'motivation'
      ? 'golden-dawn'
      : initialItem?.world === 'breakup'
      ? 'faded-memory'
      : initialItem?.world === 'life'
      ? 'celestial-sky'
      : 'rose-romance'
  );
  const [fontStyle, setFontStyle] = useState<FontStyle>('poetic');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(36);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resolution calculations
  const getCanvasDimensions = useCallback((ratio: AspectRatio) => {
    switch (ratio) {
      case '9:16':
        return { w: 1080, h: 1920 };
      case '4:3':
        return { w: 1200, h: 900 };
      case '16:9':
        return { w: 1280, h: 720 };
      case '1:1':
      default:
        return { w: 1080, h: 1080 };
    }
  }, []);

  // Canvas drawing routine
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = getCanvasDimensions(aspectRatio);
    canvas.width = w;
    canvas.height = h;

    // 1. Draw Background
    if (theme === 'rose-romance') {
      const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, '#4c0519');
      grad.addColorStop(0.5, '#1e050f');
      grad.addColorStop(1, '#090104');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Decorative rose petals floating in background
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(i * 1.7) * 0.45 + 0.5) * w;
        const py = (Math.cos(i * 2.3) * 0.45 + 0.5) * h;
        ctx.beginPath();
        ctx.ellipse(px, py, 18, 32, i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'midnight-rain') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.4, '#082f49');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) {
        const rx = (i * 19) % w;
        const ry = (i * 37) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 36);
        ctx.stroke();
      }
    } else if (theme === 'celestial-sky') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.6, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (let i = 0; i < 90; i++) {
        const sx = ((i * 31) % w);
        const sy = ((i * 47) % (h * 0.75));
        const r = (i % 3) + 1;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(199,210,254,0.5)';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant mountain silhouette at bottom
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 140);
      ctx.lineTo(w * 0.35, h - 220);
      ctx.lineTo(w * 0.65, h - 160);
      ctx.lineTo(w, h - 250);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    } else if (theme === 'golden-dawn') {
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.3, '#7c2d12');
      grad.addColorStop(0.7, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rising sun glow
      const sunGrad = ctx.createRadialGradient(w / 2, h, 20, w / 2, h, w * 0.6);
      sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (theme === 'faded-memory') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(0.5, '#2e1065');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Abstract geometric lines
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.2);
      ctx.lineTo(w * 0.9, h * 0.8);
      ctx.moveTo(w * 0.85, h * 0.15);
      ctx.lineTo(w * 0.15, h * 0.75);
      ctx.stroke();
    } else {
      // Classic parchment
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#fef3c7');
      grad.addColorStop(1, '#fde68a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Decorative Border Frame
    if (showBorder) {
      const margin = 48;
      ctx.strokeStyle =
        theme === 'classic-parchment'
          ? 'rgba(120, 53, 15, 0.4)'
          : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

      // Inner hairline accent
      ctx.strokeStyle =
        theme === 'classic-parchment'
          ? 'rgba(120, 53, 15, 0.15)'
          : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(margin + 12, margin + 12, w - (margin + 12) * 2, h - (margin + 12) * 2);

      // Corner accent flourishes
      const cornerSize = 24;
      const c = margin + 12;
      ctx.strokeStyle =
        theme === 'classic-parchment' ? '#b45309' : 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 3;
      // Top Left
      ctx.strokeRect(c - 4, c - 4, cornerSize, 2);
      ctx.strokeRect(c - 4, c - 4, 2, cornerSize);
      // Top Right
      ctx.strokeRect(w - c + 4 - cornerSize, c - 4, cornerSize, 2);
      ctx.strokeRect(w - c + 2, c - 4, 2, cornerSize);
    }

    // 3. Render Main Nepali Poetry Text
    ctx.fillStyle =
      theme === 'classic-parchment' ? '#451a03' : '#f8fafc';
    ctx.textAlign = 'center';

    let fontName = "'Noto Serif Devanagari', serif";
    if (fontStyle === 'poetic') {
      fontName = "'Rozha One', 'Noto Serif Devanagari', serif";
    } else if (fontStyle === 'handwritten') {
      fontName = "'Kalam', cursive";
    }
    const computedFontSize = Math.floor((w / 800) * fontSizeRatio);
    ctx.font = `500 ${computedFontSize}px ${fontName}`;

    // Split text by lines
    const lines = text.split('\n');
    const lineHeight = computedFontSize * 1.6;
    const totalBlockHeight = lines.length * lineHeight;
    let startY = (h - totalBlockHeight) / 2 + computedFontSize;

    // Subtle text shadow
    if (theme !== 'classic-parchment') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowBlur = 0;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), w / 2, startY + index * lineHeight);
    });

    ctx.shadowBlur = 0; // reset shadow

    // 4. Author Attribution
    const authorY = startY + lines.length * lineHeight + 36;
    ctx.font = `italic 400 ${Math.floor(computedFontSize * 0.48)}px 'Noto Serif Devanagari', serif`;
    ctx.fillStyle =
      theme === 'classic-parchment'
        ? 'rgba(120, 53, 15, 0.8)'
        : 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`— ${author}`, w / 2, authorY);

    // 5. Watermark Badge
    if (showWatermark) {
      const wmY = h - 72;
      ctx.font = `600 20px 'Noto Serif Devanagari', serif`;
      ctx.fillStyle =
        theme === 'classic-parchment'
          ? 'rgba(120, 53, 15, 0.6)'
          : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText('मनका शब्द · Man Ka Shabda', w / 2, wmY);
    }
  }, [text, author, aspectRatio, theme, fontStyle, showWatermark, showBorder, fontSizeRatio, getCanvasDimensions]);

  useEffect(() => {
    // Wait for fonts to load if possible, then draw
    document.fonts?.ready?.then(() => {
      drawCard();
    });
    drawCard();
  }, [drawCard]);

  // Download high-resolution PNG
  const handleDownload = () => {
    soundEngine.playChime(784);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `man-ka-shabda-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Web Share or Clipboard
  const handleShare = async () => {
    soundEngine.playChime(659);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'man-ka-shabda.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: 'मनका शब्द — Man Ka Shabda',
            text: text,
            files: [file],
          });
          setShared(true);
          setTimeout(() => setShared(false), 2500);
        } catch {
          // If native share dialog cancelled or failed, fallback to copy text
          await navigator.clipboard.writeText(`${text}\n\n— ${author}\n(मनका शब्द)`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      });
    } else {
      await navigator.clipboard.writeText(`${text}\n\n— ${author}\n(मनका शब्द)`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-semibold text-white font-nepali">
              शब्दावली स्टुडियो · Quote Card Studio
            </h2>
          </div>
          {onClose && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Text Input */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1 font-nepali">
                नेपाली साहित्य वा पङ्क्ति
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-slate-100 text-sm font-nepali focus:outline-none focus:border-rose-400 resize-none"
                placeholder="यहाँ आफ्ना भावना लेख्नुहोस्..."
              />
            </div>

            {/* Author Input */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1 font-nepali">
                सर्जक / नाम
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-100 text-sm font-nepali focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>साइज / Aspect Ratio</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '9:16', '4:3', '16:9'] as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      soundEngine.playClick();
                      setAspectRatio(r);
                    }}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      aspectRatio === r
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Atmosphere Theme */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Palette className="w-3.5 h-3.5" />
                <span>वातावरण / Atmosphere Theme</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rose-romance', label: 'गुलाबी प्रेम' },
                  { id: 'midnight-rain', label: 'रातको झरी' },
                  { id: 'celestial-sky', label: 'तारा र आकाश' },
                  { id: 'golden-dawn', label: 'सुनौलो बिहानी' },
                  { id: 'faded-memory', label: 'सिसा र सम्झना' },
                  { id: 'classic-parchment', label: 'कागजी पाना' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setTheme(th.id as ThemeStyle);
                    }}
                    className={`p-2 rounded-lg text-xs font-nepali border text-center transition-colors cursor-pointer ${
                      theme === th.id
                        ? 'bg-rose-500/20 border-rose-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Selection */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Type className="w-3.5 h-3.5" />
                <span>अक्षर शैली / Typography</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'poetic', label: 'रोझा (काव्यिक)' },
                  { id: 'handwritten', label: 'कलम (हातको)' },
                  { id: 'serif', label: 'देवनागरी क्लासिक' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setFontStyle(f.id as FontStyle);
                    }}
                    className={`py-2 px-1 text-[11px] font-nepali rounded-lg border transition-colors cursor-pointer ${
                      fontStyle === f.id
                        ? 'bg-rose-500/20 border-rose-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>अक्षरको आकार</span>
                <span className="font-mono">{fontSizeRatio}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={54}
                value={fontSizeRatio}
                onChange={(e) => setFontSizeRatio(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="rounded accent-rose-500 cursor-pointer"
                />
                <span>"मनका शब्द" वाटरमार्क</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                  className="rounded accent-rose-500 cursor-pointer"
                />
                <span>सुन्दर किनारा (Frame)</span>
              </label>
            </div>
          </div>

          {/* Canvas Live Preview (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-4 border border-white/5 relative min-h-[380px]">
            <div className="relative max-w-full max-h-[460px] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
              <canvas
                ref={canvasRef}
                className="max-h-[440px] max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>HD कार्ड डाउनलोड</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs flex items-center gap-2 transition-colors active:scale-95 cursor-pointer"
              >
                {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{shared ? 'साझा गरियो!' : 'साझा गर्नुहोस्'}</span>
              </button>

              <button
                onClick={async () => {
                  soundEngine.playClick();
                  await navigator.clipboard.writeText(`${text}\n\n— ${author}\n(मनका शब्द)`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs flex items-center gap-2 transition-colors active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कपी भयो!' : 'टेक्स्ट कपी'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
