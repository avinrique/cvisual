import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';

export function useAnimationSpeed() {
  const speed = useAppStore(s => s.animationSpeed);
  const isPaused = useAppStore(s => s.isPaused);

  // Track active timers so we can conceptually "respect" pause on new timers
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  /** Scale a duration in ms by the current speed */
  const duration = useCallback((ms: number) => ms / speed, [speed]);

  /** Scale a framer-motion transition object */
  const transition = useCallback(<T extends { duration?: number; delay?: number }>(t: T): T => ({
    ...t,
    ...(t.duration !== undefined ? { duration: t.duration / speed } : {}),
    ...(t.delay !== undefined ? { delay: t.delay / speed } : {}),
  }), [speed]);

  /** A speed-aware setTimeout. Returns a clear function. Won't fire if paused. */
  const scaledTimeout = useCallback((fn: () => void, ms: number) => {
    const scaledMs = ms / speed;
    const check = () => {
      const paused = useAppStore.getState().isPaused;
      if (paused) {
        // Re-check every 100ms while paused
        const retryId = setTimeout(check, 100);
        timersRef.current.add(retryId);
        return;
      }
      fn();
    };
    const id = setTimeout(check, scaledMs);
    timersRef.current.add(id);
    return () => {
      clearTimeout(id);
      timersRef.current.delete(id);
    };
  }, [speed]);

  /** A speed-aware setInterval. Returns a clear function. Skips ticks while paused. */
  const scaledInterval = useCallback((fn: () => void, ms: number) => {
    const scaledMs = ms / speed;
    const id = setInterval(() => {
      const paused = useAppStore.getState().isPaused;
      if (!paused) fn();
    }, scaledMs);
    return () => clearInterval(id);
  }, [speed]);

  return { speed, isPaused, duration, transition, scaledTimeout, scaledInterval };
}
