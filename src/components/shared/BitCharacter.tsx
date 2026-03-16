'use client';
import { motion } from 'framer-motion';

interface BitCharacterProps {
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'scared';
  size?: number;
  color?: string;
  lookAt?: { x: number; y: number };
  label?: string;
}

export default function BitCharacter({
  mood = 'neutral',
  size = 60,
  color = '#00BFFF',
  lookAt,
  label,
}: BitCharacterProps) {
  const eyeOffsetX = lookAt ? Math.min(Math.max(lookAt.x * 3, -3), 3) : 0;
  const eyeOffsetY = lookAt ? Math.min(Math.max(lookAt.y * 3, -3), 3) : 0;

  const moodEyes = {
    happy: { leftY: -4, rightY: -4, mouthArc: true },
    sad: { leftY: 2, rightY: 2, mouthArc: false },
    neutral: { leftY: 0, rightY: 0, mouthArc: false },
    excited: { leftY: -2, rightY: -2, mouthArc: true },
    scared: { leftY: 0, rightY: 0, mouthArc: false },
  };

  const eyes = moodEyes[mood];
  const r = size / 2;

  return (
    <motion.div
      className="relative inline-flex flex-col items-center"
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow */}
        <defs>
          <radialGradient id={`glow-${color.replace('#', '')}`}>
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="70%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={r} cy={r} r={r} fill={`url(#glow-${color.replace('#', '')})`} />
        <circle cx={r} cy={r} r={r * 0.7} fill={color} opacity={0.3} />
        <circle cx={r} cy={r} r={r * 0.5} fill={color} opacity={0.7} />

        {/* Eyes */}
        <circle
          cx={r - size * 0.12 + eyeOffsetX}
          cy={r - size * 0.05 + eyes.leftY + eyeOffsetY}
          r={size * 0.06}
          fill="white"
        />
        <circle
          cx={r + size * 0.12 + eyeOffsetX}
          cy={r - size * 0.05 + eyes.rightY + eyeOffsetY}
          r={size * 0.06}
          fill="white"
        />

        {/* Mouth */}
        {mood === 'happy' || mood === 'excited' ? (
          <path
            d={`M ${r - size * 0.1} ${r + size * 0.1} Q ${r} ${r + size * 0.2} ${r + size * 0.1} ${r + size * 0.1}`}
            stroke="white"
            strokeWidth={1.5}
            fill="none"
          />
        ) : mood === 'sad' ? (
          <path
            d={`M ${r - size * 0.1} ${r + size * 0.15} Q ${r} ${r + size * 0.05} ${r + size * 0.1} ${r + size * 0.15}`}
            stroke="white"
            strokeWidth={1.5}
            fill="none"
          />
        ) : (
          <line
            x1={r - size * 0.08}
            y1={r + size * 0.12}
            x2={r + size * 0.08}
            y2={r + size * 0.12}
            stroke="white"
            strokeWidth={1.5}
          />
        )}
      </svg>
      {label && (
        <span className="text-xs font-display mt-1 opacity-70">{label}</span>
      )}
    </motion.div>
  );
}
