'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

export default function DebuggingMind() {
  const [choice, setChoice] = useState<null | 1 | 2>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  const handlePick = (door: 1 | 2) => {
    setChoice(door);
    scaledTimeout(() => setShowExplanation(true), 1500);
  };

  const reset = () => {
    setChoice(null);
    setShowExplanation(false);
  };

  return (
    <div data-interactive className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void px-4">
      <motion.h2
        className="font-display text-xl mb-8"
        style={{ color: '#FFD700' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Spot the Bug
      </motion.h2>

      {!choice && (
        <motion.p
          className="text-dim font-body text-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Which door has the correct code?
        </motion.p>
      )}

      <div className="flex gap-8 md:gap-16 items-end">
        {/* Door 1: Bug (assignment) */}
        <motion.div
          className="flex flex-col items-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); if (!choice) handlePick(1); }}
          whileHover={!choice ? { scale: 1.05 } : {}}
          whileTap={!choice ? { scale: 0.95 } : {}}
        >
          <motion.div
            className="w-32 h-48 md:w-40 md:h-56 rounded-t-lg border-2 flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-colors"
            style={{
              borderColor: choice === 1 ? '#EF4444' : 'rgba(255,255,255,0.2)',
              background: choice === 1 ? 'rgba(239,68,68,0.1)' : 'rgba(17,22,51,0.9)',
            }}
          >
            {/* Door knob */}
            <div className="absolute right-3 top-1/2 w-3 h-5 rounded bg-amber/40" />

            {/* Code on door */}
            <div className="font-code text-sm md:text-base text-center px-2">
              <span style={{ color: '#EF4444' }}>if(a = 5)</span>
            </div>

            {/* Result after picking */}
            <AnimatePresence>
              {choice === 1 && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
                  style={{ background: 'rgba(239,68,68,0.15)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="text-3xl font-display"
                    style={{ color: '#EF4444' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    BUG!
                  </motion.div>
                  <div className="text-xs font-code text-dim text-center">
                    ASSIGNMENT<br />a becomes 5<br />Always true!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-xs font-code text-dim mt-2">Door 1</span>
        </motion.div>

        {/* Door 2: Correct (comparison) */}
        <motion.div
          className="flex flex-col items-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); if (!choice) handlePick(2); }}
          whileHover={!choice ? { scale: 1.05 } : {}}
          whileTap={!choice ? { scale: 0.95 } : {}}
        >
          <motion.div
            className="w-32 h-48 md:w-40 md:h-56 rounded-t-lg border-2 flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-colors"
            style={{
              borderColor: choice === 2 ? '#22C55E' : 'rgba(255,255,255,0.2)',
              background: choice === 2 ? 'rgba(34,197,94,0.1)' : 'rgba(17,22,51,0.9)',
            }}
          >
            <div className="absolute right-3 top-1/2 w-3 h-5 rounded bg-amber/40" />

            <div className="font-code text-sm md:text-base text-center px-2">
              <span style={{ color: '#22C55E' }}>if(a == 5)</span>
            </div>

            <AnimatePresence>
              {choice === 2 && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="text-3xl font-display"
                    style={{ color: '#22C55E' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    CORRECT
                  </motion.div>
                  <div className="text-xs font-code text-dim text-center">
                    COMPARISON<br />Checks if a is 5<br />Proper logic!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-xs font-code text-dim mt-2">Door 2</span>
        </motion.div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            className="mt-8 flex flex-col items-center gap-4 max-w-lg w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Giant = vs == */}
            <motion.div
              className="flex items-center gap-6 font-code text-4xl md:text-6xl font-bold"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  '0 0 0px transparent',
                  '0 0 20px rgba(255,215,0,0.5)',
                  '0 0 0px transparent',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span style={{ color: '#EF4444' }}>=</span>
              <span className="text-dim text-2xl">vs</span>
              <span style={{ color: '#22C55E' }}>==</span>
            </motion.div>

            <div className="flex gap-4 w-full">
              <GlowBox color="#EF4444" intensity={0.3} className="flex-1">
                <div className="text-xs font-code text-center">
                  <div style={{ color: '#EF4444' }} className="font-bold text-sm mb-1">=</div>
                  <div className="text-dim">Assignment</div>
                  <div className="text-dim">Sets a value</div>
                  <div className="text-red mt-1">a = 5 makes a become 5</div>
                </div>
              </GlowBox>
              <GlowBox color="#22C55E" intensity={0.3} className="flex-1">
                <div className="text-xs font-code text-center">
                  <div style={{ color: '#22C55E' }} className="font-bold text-sm mb-1">==</div>
                  <div className="text-dim">Comparison</div>
                  <div className="text-dim">Checks equality</div>
                  <div className="text-green mt-1">a == 5 asks &quot;is a 5?&quot;</div>
                </div>
              </GlowBox>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="px-4 py-1.5 rounded text-xs font-code bg-surface border border-white/10 text-dim hover:text-primary transition"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <InteractiveIndicator className="absolute top-4 right-4" />
    </div>
  );
}
