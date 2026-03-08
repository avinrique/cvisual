'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowBoxProps {
  children: ReactNode;
  color?: string;
  intensity?: number;
  pulse?: boolean;
  className?: string;
}

export default function GlowBox({
  children,
  color = '#FFD700',
  intensity = 0.3,
  pulse = false,
  className = '',
}: GlowBoxProps) {
  const shadow = `0 0 ${20 * intensity}px ${color}${Math.round(intensity * 80).toString(16).padStart(2, '0')}, 0 0 ${40 * intensity}px ${color}${Math.round(intensity * 40).toString(16).padStart(2, '0')}`;

  return (
    <motion.div
      className={`rounded-lg border border-white/10 p-4 ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(17,22,51,0.9), rgba(17,22,51,0.7))`,
        boxShadow: shadow,
      }}
      animate={
        pulse
          ? {
              boxShadow: [
                shadow,
                `0 0 ${30 * intensity}px ${color}80, 0 0 ${60 * intensity}px ${color}40`,
                shadow,
              ],
            }
          : undefined
      }
      transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {children}
    </motion.div>
  );
}
