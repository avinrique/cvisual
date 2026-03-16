'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
const recapLines = [
  { text: 'I can listen.', icon: 'scanf', color: '#00BFFF' },
  { text: 'I can speak.', icon: 'printf', color: '#22C55E' },
  { text: 'I can decide.', icon: 'if/else', color: '#F59E0B' },
  { text: 'I can repeat.', icon: 'for/while', color: '#8B5CF6' },
  { text: 'I can stop.', icon: 'break', color: '#EF4444' },
];

export default function Closing() {
  const [phase, setPhase] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showZoomOut, setShowZoomOut] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    return scaledTimeout(() => setPhase(1), 2000);
  }, [scaledTimeout]);

  useEffect(() => {
    if (phase !== 1) return;
    if (visibleLines >= recapLines.length) {
      return scaledTimeout(() => setPhase(2), 2000);
    }
    return scaledTimeout(() => setVisibleLines(v => v + 1), 1200);
  }, [phase, visibleLines, scaledTimeout]);

  useEffect(() => {
    if (phase === 2) {
      const c1 = scaledTimeout(() => setShowZoomOut(true), 500);
      const c2 = scaledTimeout(() => setPhase(3), 4000);
      return () => { c1(); c2(); };
    }
    if (phase === 3) {
      return scaledTimeout(() => setShowEndCard(true), 1500);
    }
  }, [phase, scaledTimeout]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Phase 0-1: Terminal with recap */}
      <AnimatePresence>
        {phase < 2 && (
          <motion.div
            className="flex flex-col items-center"
            exit={{ scale: 0.15, opacity: 0, transition: { duration: 2, ease: 'easeInOut' } }}
          >
            <Terminal title="the_machine" showCursor={visibleLines < recapLines.length} width="w-full max-w-md">
              <div className="space-y-2">
                {recapLines.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span
                      className="font-code text-xs px-1.5 py-0.5 rounded border"
                      style={{ color: line.color, borderColor: `${line.color}40` }}
                    >
                      {line.icon}
                    </span>
                    <span style={{ color: line.color }} className="font-body">
                      {line.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Terminal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Zoom out to globe with many terminals */}
      <AnimatePresence>
        {showZoomOut && phase >= 2 && phase < 3 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Globe circle */}
            <motion.div
              className="relative"
              style={{ width: 300, height: 300 }}
            >
              <svg width="300" height="300" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(0,191,255,0.15)" strokeWidth="1" />
                <ellipse cx="150" cy="150" rx="140" ry="50" fill="none" stroke="rgba(0,191,255,0.08)" strokeWidth="1" />
                <ellipse cx="150" cy="150" rx="50" ry="140" fill="none" stroke="rgba(0,191,255,0.08)" strokeWidth="1" />
              </svg>

              {/* Tiny terminals scattered */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const r = 60 + Math.random() * 70;
                const x = 150 + r * Math.cos(angle) - 10;
                const y = 150 + r * Math.sin(angle) - 6;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-5 h-3 rounded-sm border"
                    style={{
                      left: x,
                      top: y,
                      borderColor: 'rgba(0,191,255,0.3)',
                      background: 'rgba(17,22,51,0.8)',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 2, repeat: Infinity, repeatDelay: Math.random() * 2 }}
                  >
                    <div className="w-1 h-0.5 bg-green/50 mt-0.5 ml-0.5" />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Fade to black + End card */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            className="absolute inset-0 bg-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            {showEndCard && (
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="font-display text-3xl md:text-5xl tracking-wider text-center"
                  style={{ color: '#FFD700' }}
                >
                  {'MODULE 2'.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      className={char === ' ' ? 'inline-block w-3' : ''}
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="h-px w-12 bg-dim/30" />
                  <span className="font-display text-lg tracking-widest text-dim uppercase">Complete</span>
                  <div className="h-px w-12 bg-dim/30" />
                </motion.div>

                <motion.div
                  className="mt-8 px-6 py-3 rounded-full border border-blue/30 bg-blue/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                >
                  <span className="font-code text-sm" style={{ color: '#00BFFF' }}>
                    Next: Arrays &amp; Strings &rarr;
                  </span>
                </motion.div>

                {/* Recap icons row */}
                <motion.div
                  className="flex gap-4 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 2 }}
                >
                  {recapLines.map((line, i) => (
                    <motion.span
                      key={i}
                      className="font-code text-xs px-2 py-1 rounded border"
                      style={{ color: line.color, borderColor: `${line.color}30` }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 + i * 0.15 }}
                    >
                      {line.icon}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blinking cursor in void (phase 0) */}
      {phase === 0 && (
        <motion.span
          className="inline-block w-3 h-6 bg-green cursor-blink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}
    </div>
  );
}
