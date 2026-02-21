import { useRef, useCallback } from 'react';
import { useQuizPreferences } from '@/contexts/QuizPreferencesContext';

function getAudioCtx(ref: React.MutableRefObject<AudioContext | null>): AudioContext {
  if (!ref.current) {
    ref.current = new AudioContext();
  }
  if (ref.current.state === 'suspended') {
    ref.current.resume();
  }
  return ref.current;
}

function playTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useQuizSounds() {
  const { soundEnabled, hapticEnabled } = useQuizPreferences();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioCtx(audioCtxRef);
    playTone(ctx, 800, 0.06, 'sine', 0.12);

    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [soundEnabled, hapticEnabled]);

  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioCtx(audioCtxRef);
    // Two-note ascending chime: C5 (523Hz) then E5 (659Hz)
    playTone(ctx, 523, 0.15, 'sine', 0.18);
    setTimeout(() => playTone(ctx, 659, 0.25, 'sine', 0.18), 120);

    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  }, [soundEnabled, hapticEnabled]);

  const playTimerWarning = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioCtx(audioCtxRef);
    playTone(ctx, 440, 0.2, 'triangle', 0.15);
    setTimeout(() => playTone(ctx, 440, 0.2, 'triangle', 0.15), 300);

    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate([50, 80, 50]);
    }
  }, [soundEnabled, hapticEnabled]);

  return { playClickSound, playCompletionSound, playTimerWarning };
}
