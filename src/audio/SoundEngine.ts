import { WorldId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterVolume: number = 0.5;
  private masterGain: GainNode | null = null;
  private currentWorld: WorldId | null = null;

  // Active voice nodes
  private currentWorldGain: GainNode | null = null;
  private activeIntervals: number[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private activeAudioNodes: AudioNode[] = [];

  constructor() {
    // Read persisted preferences
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('manka_shabda_muted');
      const savedVol = localStorage.getItem('manka_shabda_volume');
      this.isMuted = savedMute !== null ? savedMute === 'true' : true; // Default muted for browser courtesy
      if (savedVol !== null) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }

      // Handle visibility change (pause in background)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.suspend();
        } else if (!this.isMuted) {
          this.resume();
        }
      });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('manka_shabda_muted', String(this.isMuted));

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }

    if (!this.isMuted && this.currentWorld) {
      this.playWorldSoundscape(this.currentWorld);
    }
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('manka_shabda_volume', String(this.masterVolume));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, this.ctx.currentTime + 0.1);
    }
  }

  public suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- Sound FX ---
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // safe fallback
    }
  }

  public playChime(freq = 659.25) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {
      // safe fallback
    }
  }

  public playDissolveGlass() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const frequencies = [880, 1174, 1318, 1760, 2093];
      frequencies.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.04);

        const startTime = this.ctx.currentTime + idx * 0.04;
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {
      // safe fallback
    }
  }

  // --- World Ambient Soundscapes with Crossfade ---
  public playWorldSoundscape(world: WorldId) {
    this.currentWorld = world;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Smoothly fade out old world gain
    this.cleanupActiveWorldNodes();

    const worldGain = this.ctx.createGain();
    worldGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    worldGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 1.2);
    worldGain.connect(this.masterGain);
    this.currentWorldGain = worldGain;

    switch (world) {
      case 'love':
        this.startLoveSoundscape(worldGain);
        break;
      case 'sad':
        this.startSadSoundscape(worldGain);
        break;
      case 'breakup':
        this.startBreakupSoundscape(worldGain);
        break;
      case 'life':
        this.startLifeSoundscape(worldGain);
        break;
      case 'motivation':
        this.startMotivationSoundscape(worldGain);
        break;
      case 'loneliness':
        this.startLonelinessSoundscape(worldGain);
        break;
      case 'friendship':
        this.startFriendshipSoundscape(worldGain);
        break;
      case 'dreams':
        this.startDreamsSoundscape(worldGain);
        break;
    }
  }

  private cleanupActiveWorldNodes() {
    this.activeIntervals.forEach((id) => clearInterval(id));
    this.activeIntervals = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    this.activeAudioNodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {}
    });
    this.activeAudioNodes = [];

    if (this.currentWorldGain && this.ctx) {
      try {
        this.currentWorldGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.currentWorldGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        const oldGain = this.currentWorldGain;
        setTimeout(() => {
          try {
            oldGain.disconnect();
          } catch {}
        }, 700);
      } catch {}
      this.currentWorldGain = null;
    }
  }

  // World 1: Love (Warm Rhodes/Harp arpeggios & gentle heartbeat sub-thud)
  private startLoveSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G
    ];

    // Sub heartbeat oscillator (gentle, organic)
    const beatOsc = this.ctx.createOscillator();
    const beatFilter = this.ctx.createBiquadFilter();
    const beatGain = this.ctx.createGain();
    beatOsc.type = 'sine';
    beatOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    beatFilter.type = 'lowpass';
    beatFilter.frequency.setValueAtTime(90, this.ctx.currentTime);
    beatGain.gain.setValueAtTime(0, this.ctx.currentTime);

    beatOsc.connect(beatFilter);
    beatFilter.connect(beatGain);
    beatGain.connect(targetGain);
    beatOsc.start();
    this.activeOscillators.push(beatOsc);

    let beatCounter = 0;
    const beatInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      // Heartbeat pattern: lub-dub
      beatGain.gain.setValueAtTime(0.001, now);
      beatGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
      beatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      beatGain.gain.setValueAtTime(0.001, now + 0.28);
      beatGain.gain.exponentialRampToValueAtTime(0.12, now + 0.36);
      beatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    }, 2800);
    this.activeIntervals.push(beatInterval);

    // Warm chord notes
    let chordIdx = 0;
    const chordInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const noteTime = this.ctx.currentTime + i * 0.3;
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.06, noteTime + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.4);

        noteOsc.connect(noteGain);
        noteGain.connect(targetGain);
        noteOsc.start(noteTime);
        noteOsc.stop(noteTime + 2.5);
      });
    }, 4200);
    this.activeIntervals.push(chordInterval);
  }

  // World 2: Sad (Rain generator + gentle minor flute/piano)
  private startSadSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;

    // Rain synthesis via filtered white noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.14, this.ctx.currentTime);

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(targetGain);
    whiteNoise.start();
    this.activeAudioNodes.push(whiteNoise, rainFilter, rainGain);

    // Minor flute/piano melody notes in D minor
    const minorNotes = [293.66, 349.23, 440.0, 523.25, 440.0, 392.0];
    let noteCounter = 0;
    const melInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const freq = minorNotes[noteCounter % minorNotes.length];
      noteCounter++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.3);
    }, 3600);
    this.activeIntervals.push(melInterval);
  }

  // World 3: Breakup (Drifting crystalline pad with subtle wind sweep)
  private startBreakupSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const baseFreqs = [174.61, 261.63, 311.13]; // F minor chord pad
    baseFreqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      this.activeOscillators.push(osc);
    });

    // Glass chime interval
    const glassInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880 + Math.random() * 400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.9);
    }, 4500);
    this.activeIntervals.push(glassInterval);
  }

  // World 4: Life (Celestial fifths drone with cosmos shimmer)
  private startLifeSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const droneFreqs = [110.0, 164.81, 220.0];
    droneFreqs.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      this.activeOscillators.push(osc);
    });

    // Cosmic sparkle notes
    const sparkleInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    }, 2900);
    this.activeIntervals.push(sparkleInterval);
  }

  // World 5: Motivation (Uplifting golden dawn chord swell)
  private startMotivationSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const dawnChords = [
      [196.0, 246.94, 293.66], // G maj
      [220.0, 261.63, 329.63], // Am
      [261.63, 329.63, 392.0], // C maj
      [293.66, 369.99, 440.0], // D maj
    ];

    let chordStep = 0;
    const swellInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const chord = dawnChords[chordStep % dawnChords.length];
      chordStep++;
      chord.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.4);

        osc.connect(gain);
        gain.connect(targetGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.5);
      });
    }, 3800);
    this.activeIntervals.push(swellInterval);
  }

  // World 6: Loneliness (Sub drone with deep resonance)
  private startLonelinessSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(98.0, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(targetGain);
    osc.start();
    this.activeOscillators.push(osc);
  }

  // World 7: Friendship (Warm marimba/kalimba notes)
  private startFriendshipSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const notes = [329.63, 392.0, 440.0, 493.88, 587.33];
    let step = 0;
    const kalimbaInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const f = notes[step % notes.length];
      step++;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    }, 2200);
    this.activeIntervals.push(kalimbaInterval);
  }

  // World 8: Dreams (Nebula frequency shimmer)
  private startDreamsSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(220.0, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(329.63, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(targetGain);
    osc1.start();
    osc2.start();
    this.activeOscillators.push(osc1, osc2);
  }
}

export const soundEngine = new SoundEngine();
