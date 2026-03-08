'use client';
import { useAppStore } from '@/lib/store';

const SPEEDS = [0.5, 1, 1.5, 2];

export default function SpeedControl() {
  const speed = useAppStore(s => s.animationSpeed);
  const setSpeed = useAppStore(s => s.setAnimationSpeed);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-1 bg-white/5 rounded-full px-1 py-1 backdrop-blur-sm border border-white/10">
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={(e) => { e.stopPropagation(); setSpeed(s); }}
          className="px-2.5 py-1 rounded-full text-xs font-code transition-all"
          style={{
            background: speed === s ? 'rgba(255,215,0,0.2)' : 'transparent',
            color: speed === s ? '#FFD700' : 'rgba(255,255,255,0.4)',
            fontWeight: speed === s ? 'bold' : 'normal',
          }}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
