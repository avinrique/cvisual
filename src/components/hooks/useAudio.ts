'use client';
import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';

export function useAudio() {
  const audioEnabled = useAppStore(s => s.audioEnabled);

  const play = useCallback((type: 'click' | 'whoosh' | 'chime' | 'thump') => {
    if (!audioEnabled) return;
    // Tone.js would be lazy-loaded here
    // For now, use Web Audio API for simple sounds
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const freqs: Record<string, number> = {
        click: 800,
        whoosh: 400,
        chime: 1200,
        thump: 150,
      };

      osc.frequency.value = freqs[type] || 440;
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio not available
    }
  }, [audioEnabled]);

  return { play };
}
