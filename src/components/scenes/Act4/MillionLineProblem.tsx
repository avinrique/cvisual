'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';
import GlowBox from '@/components/shared/GlowBox';
import { useAppStore } from '@/lib/store';

const printfLines = Array.from({ length: 40 }, (_, i) =>
  `printf("Line ${i + 1}\\n");`
);

export default function MillionLineProblem() {
  const [phase, setPhase] = useState(0);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 4) return false;
    setPhase(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (phaseRef.current <= 0) return false;
    setPhase(prev => prev - 1);
    return true;
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    setSceneStepBackHandler(stableStepBackHandler);
    return () => {
      setSceneStepHandler(null);
      setSceneStepBackHandler(null);
    };
  }, [setSceneStepHandler, stableStepHandler, setSceneStepBackHandler, stableStepBackHandler]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void">
      {/* Stick figure programmer */}
      <AnimatePresence>
        {phase < 3 && (
          <motion.div
            className="absolute left-[15%] top-[30%] flex flex-col items-center"
            exit={{ opacity: 0, x: -100 }}
          >
            <svg width="80" height="120" viewBox="0 0 80 120">
              <circle cx="40" cy="15" r="12" stroke="#00BFFF" strokeWidth="2" fill="none" />
              <line x1="40" y1="27" x2="40" y2="70" stroke="#00BFFF" strokeWidth="2" />
              <line x1="40" y1="40" x2="20" y2="55" stroke="#00BFFF" strokeWidth="2" />
              <motion.line
                x1="40" y1="40" x2="60" y2="55"
                stroke="#00BFFF" strokeWidth="2"
                animate={{ x2: [58, 62, 58], y2: [53, 57, 53] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <line x1="40" y1="70" x2="25" y2="100" stroke="#00BFFF" strokeWidth="2" />
              <line x1="40" y1="70" x2="55" y2="100" stroke="#00BFFF" strokeWidth="2" />
            </svg>
            {phase >= 1 && (
              <motion.div
                className="mt-2 px-3 py-1 bg-red/20 border border-red/40 rounded text-xs font-code text-red"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Exhausted...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrolling code */}
      <AnimatePresence>
        {phase < 3 && (
          <motion.div
            className="absolute right-[10%] top-0 w-[45%] max-w-md overflow-hidden"
            style={{ height: '100%' }}
            exit={{ opacity: 0 }}
          >
            <div
              className="rounded-lg p-4 font-code text-xs"
              style={{ background: 'rgba(17,22,51,0.9)' }}
            >
              <div className="text-dim text-xs mb-2">main.c - 1,000,000 lines</div>
              <motion.div
                animate={{ y: [0, -800] }}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
              >
                {printfLines.map((line, i) => (
                  <div key={i} className="text-blue/70 py-0.5 whitespace-nowrap">
                    <span className="text-dim mr-3 inline-block w-8 text-right">{i + 1}</span>
                    {line}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Progress bar */}
            {phase >= 1 && (
              <motion.div
                className="mt-4 mx-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between text-xs font-code text-dim mb-1">
                  <span>Progress</span>
                  <span className="text-red">0.0003% complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-white/10">
                  <div className="h-full rounded-full bg-red/50" style={{ width: '0.3%' }} />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMASH CUT: for loop */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <GlowBox color="#FFD700" intensity={0.8} pulse>
              <pre className="font-code text-lg md:text-2xl text-center px-6 py-2">
                <span style={{ color: '#8B5CF6' }}>for</span>
                <span className="text-dim">(</span>
                <span style={{ color: '#00BFFF' }}>int i=1</span>
                <span className="text-dim">; </span>
                <span style={{ color: '#22C55E' }}>i&lt;=1000000</span>
                <span className="text-dim">; </span>
                <span style={{ color: '#F59E0B' }}>i++</span>
                <span className="text-dim">)</span>
              </pre>
            </GlowBox>

            {/* Falling domino lines */}
            {phase >= 4 && (
              <motion.div
                className="flex gap-1 mt-4 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Array.from({ length: 25 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-8 bg-blue/40 rounded-sm origin-bottom"
                    initial={{ rotateX: 0, opacity: 1 }}
                    animate={{ rotateX: 90, opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  />
                ))}
              </motion.div>
            )}

            <motion.p
              className="text-dim font-body text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              One line replaces a million.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase < 3 && (
        <Narration text="There has to be a better way." delay={2} />
      )}
    </div>
  );
}
