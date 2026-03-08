'use client';
import { useAppStore } from '@/lib/store';

const SPEEDS = [0.5, 1, 1.5, 2];

export default function SpeedControl() {
  const speed = useAppStore(s => s.animationSpeed);
  const setSpeed = useAppStore(s => s.setAnimationSpeed);
  const isPaused = useAppStore(s => s.isPaused);
  const togglePause = useAppStore(s => s.togglePause);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-1.5">
      {/* Pause button */}
      <button
        onClick={(e) => { e.stopPropagation(); togglePause(); }}
        className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
        style={{
          background: isPaused ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
          borderColor: isPaused ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)',
          color: isPaused ? '#EF4444' : 'rgba(255,255,255,0.5)',
        }}
        title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
      >
        {isPaused ? (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
            <path d="M0 0L12 7L0 14Z" />
          </svg>
        ) : (
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <rect x="0" y="0" width="3" height="14" />
            <rect x="7" y="0" width="3" height="14" />
          </svg>
        )}
      </button>

      {/* Speed pills */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-1 py-1 backdrop-blur-sm border border-white/10">
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
    </div>
  );
}
