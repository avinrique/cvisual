'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

export default function CalculatorDemo() {
  const [phase, setPhase] = useState(0);
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    const c = [
      scaledTimeout(() => setPhase(1), 1000),
      scaledTimeout(() => setPhase(2), 2500),
      scaledTimeout(() => setPhase(3), 4200),
      scaledTimeout(() => setPhase(4), 5500),
    ];
    return () => c.forEach(fn => fn());
  }, [scaledTimeout]);

  const pipelineStages = [
    { label: 'INPUT', color: 'var(--accent-blue)', active: phase >= 1 },
    { label: 'PROCESS', color: 'var(--accent-amber)', active: phase >= 2 },
    { label: 'OUTPUT', color: 'var(--accent-green)', active: phase >= 3 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void">
      {/* Calculator */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: phase === 2 ? [0, -8, 8, -5, 5, 0] : 0,
        }}
        transition={
          phase === 2
            ? { duration: 0.6, ease: 'easeInOut' }
            : { duration: 0.6 }
        }
      >
        {/* Calculator body */}
        <div
          className="w-52 h-72 rounded-2xl border border-white/15 flex flex-col items-center p-4 relative"
          style={{ background: 'rgba(17,22,51,0.9)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          {/* Display */}
          <div className="w-full h-14 rounded-lg bg-black/40 border border-white/10 flex items-center justify-end px-3 mb-3">
            <AnimatePresence mode="wait">
              {phase < 3 ? (
                <motion.span
                  key="input"
                  className="font-code text-lg text-primary"
                  exit={{ opacity: 0 }}
                >
                  {phase >= 2 ? '7 + 3' : phase >= 1 ? '7 + 3' : ''}
                </motion.span>
              ) : (
                <motion.span
                  key="output"
                  className="font-code text-2xl text-green"
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  = 10
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Button grid (decorative) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(
              (btn) => (
                <div
                  key={btn}
                  className={`h-9 rounded-md border border-white/10 flex items-center justify-center text-xs font-code ${
                    btn === '=' ? 'bg-amber/20 text-amber' : 'bg-white/5 text-dim'
                  }`}
                >
                  {btn}
                </div>
              )
            )}
          </div>

          {/* Spinning gear overlay during processing */}
          {phase === 2 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-amber)"
                strokeWidth="1.5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </motion.svg>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Floating numbers */}
      <AnimatePresence>
        {phase === 1 && (
          <>
            <motion.div
              className="absolute font-display text-4xl text-blue"
              style={{ textShadow: '0 0 15px var(--glow-blue)' }}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: -140, opacity: 1 }}
              exit={{ x: 0, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              7
            </motion.div>
            <motion.div
              className="absolute font-display text-4xl text-blue"
              style={{ textShadow: '0 0 15px var(--glow-blue)' }}
              initial={{ x: -250, y: 30, opacity: 0 }}
              animate={{ x: -140, y: 30, opacity: 1 }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            >
              3
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Result popping out right */}
      {phase >= 3 && (
        <motion.div
          className="absolute font-display text-5xl text-green"
          style={{ textShadow: '0 0 20px var(--glow-green)' }}
          initial={{ x: 0, opacity: 0, scale: 0 }}
          animate={{ x: 180, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          10
        </motion.div>
      )}

      {/* Pipeline HUD at bottom */}
      {phase >= 1 && (
        <motion.div
          className="absolute bottom-20 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-3">
              <motion.div
                className="px-4 py-2 rounded-md border font-display text-xs tracking-wider"
                style={{
                  borderColor: stage.active ? stage.color : 'rgba(255,255,255,0.1)',
                  color: stage.active ? stage.color : 'var(--text-dim)',
                  boxShadow: stage.active ? `0 0 15px ${stage.color}40` : 'none',
                  background: stage.active ? `${stage.color}10` : 'transparent',
                }}
                animate={
                  stage.active
                    ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                    : {}
                }
              >
                {stage.label}
              </motion.div>
              {i < 2 && (
                <motion.span
                  className="text-dim"
                  animate={{ opacity: pipelineStages[i + 1]?.active ? 1 : 0.3 }}
                >
                  &rarr;
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {phase >= 4 && (
        <Narration text="Input. Process. Output. Every program is a calculator at heart." />
      )}
    </div>
  );
}
