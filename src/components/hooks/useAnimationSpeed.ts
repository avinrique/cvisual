import { useAppStore } from '@/lib/store';

export function useAnimationSpeed() {
  const speed = useAppStore(s => s.animationSpeed);

  return {
    speed,
    /** Scale a duration in ms by the current speed */
    duration: (ms: number) => ms / speed,
    /** Scale a framer-motion transition object */
    transition: <T extends { duration?: number; delay?: number }>(t: T): T => ({
      ...t,
      ...(t.duration !== undefined ? { duration: t.duration / speed } : {}),
      ...(t.delay !== undefined ? { delay: t.delay / speed } : {}),
    }),
  };
}
