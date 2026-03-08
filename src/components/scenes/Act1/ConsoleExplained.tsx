'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const VIGNETTES = [
  { label: 'Linux Terminal', icon: '$_', color: 'var(--accent-green)', from: { x: -300, y: -200 } },
  { label: 'ATM Machine', icon: '[$]', color: 'var(--accent-gold)', from: { x: 300, y: -200 } },
  { label: 'Chatbot', icon: '<>', color: 'var(--accent-blue)', from: { x: -300, y: 200 } },
  { label: 'CMD / PowerShell', icon: 'C:\\>', color: 'var(--accent-purple)', from: { x: 300, y: 200 } },
];

export default function ConsoleExplained() {
  const [phase, setPhase] = useState(0);
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    const c = [
      scaledTimeout(() => setPhase(1), 1500),
      scaledTimeout(() => setPhase(2), 4000),
      scaledTimeout(() => setPhase(3), 5500),
    ];
    return () => c.forEach(fn => fn());
  }, [scaledTimeout]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Growing terminal background */}
      <motion.div
        className="absolute"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: phase >= 2 ? 0.4 : phase >= 0 ? 1 : 0.3,
          opacity: phase >= 2 ? 0.15 : 1,
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Terminal title="console" showCursor={true} width="w-[500px]">
          <div className="text-dim text-xs space-y-1 min-h-[120px]">
            <p className="text-green">$ echo &quot;I am the console&quot;</p>
            <p>I am the console</p>
            <p className="text-green">$ _</p>
          </div>
        </Terminal>
      </motion.div>

      {/* Four vignettes */}
      <AnimatePresence>
        {phase >= 1 && phase < 3 && (
          <>
            {VIGNETTES.map((v, i) => (
              <motion.div
                key={v.label}
                className="absolute flex flex-col items-center gap-2"
                initial={{ x: v.from.x, y: v.from.y, opacity: 0, scale: 0.6 }}
                animate={{
                  x: phase >= 2 ? 0 : v.from.x * 0.4,
                  y: phase >= 2 ? 0 : v.from.y * 0.4,
                  opacity: phase >= 2 ? 0 : 1,
                  scale: phase >= 2 ? 0.1 : 0.9,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: phase >= 2 ? 1 : 0.8,
                  delay: phase >= 2 ? i * 0.1 : i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="w-36 h-24 rounded-lg border flex flex-col items-center justify-center gap-1"
                  style={{
                    borderColor: `${v.color}50`,
                    background: 'rgba(17,22,51,0.95)',
                    boxShadow: `0 0 20px ${v.color}30`,
                  }}
                >
                  {/* Mini terminal header */}
                  <div className="flex gap-1 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green/60" />
                  </div>
                  <span className="font-code text-lg" style={{ color: v.color }}>
                    {v.icon}
                  </span>
                </div>
                <span
                  className="text-xs font-display tracking-wider"
                  style={{ color: v.color }}
                >
                  {v.label}
                </span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* CONSOLE text merges from center */}
      {phase >= 3 && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 15 }}
        >
          <div className="flex gap-1">
            {'CONSOLE'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="font-display text-5xl md:text-7xl tracking-wider text-primary"
                style={{ textShadow: '0 0 20px rgba(232,236,244,0.3)' }}
                initial={{ opacity: 0, y: 40, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 12,
                  delay: i * 0.08,
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          <motion.p
            className="text-dim font-body text-sm max-w-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            A text-based window where programs talk to humans.
            <br />
            <span className="text-primary/70">printf writes to it. scanf reads from it.</span>
          </motion.p>
        </motion.div>
      )}

      {phase >= 3 && (
        <Narration
          text="The console is the simplest, most universal interface between human and machine."
          delay={1}
        />
      )}
    </div>
  );
}
