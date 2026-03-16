'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import Narration from '@/components/shared/Narration';
import Terminal from '@/components/shared/Terminal';
import BitCharacter from '@/components/shared/BitCharacter';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';

const NARRATIONS: Record<number, string> = {
  0: 'Division has a leftover. The % operator catches it.',
  1: '% gives you what division leaves behind.',
  2: 'The most common use: if number % 2 is 0, it\'s even.',
  3: 'Modulo wraps numbers around — like a clock.',
  4: 'Remainder isn\'t just leftovers — it\'s a pattern maker.',
};

const MAX_PHASE = 4;

const BLOCK_COLORS = [
  '#60A5FA', '#818CF8', '#F472B6', '#34D399',
  '#FBBF24', '#FB923C', '#A78BFA',
];

export default function ModuloMachine() {
  const [phase, setPhase] = useState(0);
  const [dividend, setDividend] = useState(7);
  const [divisor, setDivisor] = useState(3);
  const [sortIndex, setSortIndex] = useState(-1);
  const [clockHour, setClockHour] = useState<number | null>(null);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= MAX_PHASE) return false;
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

  // Phase 2: auto-sort numbers 1-10
  useEffect(() => {
    if (phase !== 2) {
      setSortIndex(-1);
      return;
    }
    setSortIndex(0);
    const interval = setInterval(() => {
      setSortIndex(prev => {
        if (prev >= 9) {
          clearInterval(interval);
          return 9;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 3: cycle through clock hours
  useEffect(() => {
    if (phase !== 3) {
      setClockHour(null);
      return;
    }
    const hours = [13, 14, 15, 25, 0, 6, 12, 24];
    let i = 0;
    setClockHour(hours[0]);
    const interval = setInterval(() => {
      i++;
      if (i >= hours.length) {
        clearInterval(interval);
        return;
      }
      setClockHour(hours[i]);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const remainder = dividend % divisor;
  const quotient = Math.floor(dividend / divisor);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Phase 0: Division with remainder visualization */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            className="flex flex-col items-center gap-8 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Expression */}
            <motion.div
              className="font-code text-2xl md:text-3xl flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary">7</span>
              <span className="text-dim">/</span>
              <span className="text-primary">3</span>
              <span className="text-dim">=</span>
              <span className="text-blue">2</span>
              <span className="text-dim ml-2">remainder</span>
              <motion.span
                className="text-amber font-bold"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(245,158,11,0.4)',
                    '0 0 25px rgba(245,158,11,0.8)',
                    '0 0 10px rgba(245,158,11,0.4)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                1
              </motion.span>
            </motion.div>

            {/* Blocks visualization */}
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Group 1 */}
              <div className="flex gap-1.5 px-3 py-2 rounded-lg border border-blue/30 bg-blue/5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={`g1-${i}`}
                    className="w-8 h-8 rounded"
                    style={{ background: BLOCK_COLORS[i] }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>

              {/* Group 2 */}
              <div className="flex gap-1.5 px-3 py-2 rounded-lg border border-blue/30 bg-blue/5">
                {[3, 4, 5].map(i => (
                  <motion.div
                    key={`g2-${i}`}
                    className="w-8 h-8 rounded"
                    style={{ background: BLOCK_COLORS[i] }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + (i - 3) * 0.1, type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>

              {/* Remainder block */}
              <motion.div
                className="flex gap-1.5 px-3 py-2 rounded-lg border border-amber/50 bg-amber/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="w-8 h-8 rounded"
                  style={{ background: BLOCK_COLORS[6] }}
                  animate={{
                    boxShadow: [
                      '0 0 8px rgba(245,158,11,0.3)',
                      '0 0 20px rgba(245,158,11,0.7)',
                      '0 0 8px rgba(245,158,11,0.3)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* % operator glow */}
            <motion.div
              className="font-code text-3xl font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, type: 'spring', stiffness: 200 }}
            >
              <motion.span
                className="text-amber"
                animate={{
                  textShadow: [
                    '0 0 15px rgba(245,158,11,0.5)',
                    '0 0 35px rgba(245,158,11,0.9)',
                    '0 0 15px rgba(245,158,11,0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                7 % 3 = 1
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 1: Interactive modulo explorer */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InteractiveIndicator className="absolute top-6 right-8" />

            {/* Inputs */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-code text-dim">dividend</label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={dividend}
                  onChange={e => setDividend(Number(e.target.value))}
                  className="w-32 accent-blue"
                />
                <span className="font-code text-lg text-blue">{dividend}</span>
              </div>
              <span className="font-code text-2xl text-amber font-bold mt-4">%</span>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-code text-dim">divisor</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={divisor}
                  onChange={e => setDivisor(Number(e.target.value))}
                  className="w-32 accent-green"
                />
                <span className="font-code text-lg text-green">{divisor}</span>
              </div>
            </div>

            {/* Blocks visualization */}
            <div className="flex flex-wrap items-center gap-3 justify-center max-w-md">
              {Array.from({ length: quotient }).map((_, gi) => (
                <motion.div
                  key={`group-${gi}`}
                  className="flex gap-1 px-2 py-1.5 rounded-lg border border-blue/30 bg-blue/5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: gi * 0.05, type: 'spring', stiffness: 400 }}
                >
                  {Array.from({ length: divisor }).map((_, bi) => (
                    <div
                      key={`b-${gi}-${bi}`}
                      className="w-5 h-5 rounded-sm"
                      style={{ background: BLOCK_COLORS[(gi * divisor + bi) % BLOCK_COLORS.length] }}
                    />
                  ))}
                </motion.div>
              ))}
              {remainder > 0 && (
                <motion.div
                  className="flex gap-1 px-2 py-1.5 rounded-lg border border-amber/50 bg-amber/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {Array.from({ length: remainder }).map((_, bi) => (
                    <motion.div
                      key={`r-${bi}`}
                      className="w-5 h-5 rounded-sm"
                      style={{ background: BLOCK_COLORS[(quotient * divisor + bi) % BLOCK_COLORS.length] }}
                      animate={{
                        boxShadow: [
                          '0 0 5px rgba(245,158,11,0.3)',
                          '0 0 15px rgba(245,158,11,0.7)',
                          '0 0 5px rgba(245,158,11,0.3)',
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Result expression */}
            <motion.div
              className="font-code text-xl md:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-blue">{dividend}</span>
              <span className="text-amber font-bold"> % </span>
              <span className="text-green">{divisor}</span>
              <span className="text-dim"> = </span>
              <motion.span
                key={remainder}
                className="text-amber font-bold text-2xl md:text-3xl"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {remainder}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Even/Odd sorter */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Code expression */}
            <motion.div
              className="font-code text-lg md:text-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-purple">if</span>
              <span className="text-dim"> (</span>
              <span className="text-primary">n</span>
              <span className="text-amber font-bold"> % </span>
              <span className="text-primary">2</span>
              <span className="text-dim"> == </span>
              <span className="text-primary">0</span>
              <span className="text-dim">)</span>
            </motion.div>

            {/* Sorting visualization */}
            <div className="flex items-center gap-8">
              {/* BitCharacter as sorter */}
              <BitCharacter
                mood={sortIndex >= 0 ? 'excited' : 'neutral'}
                size={50}
                color="#00BFFF"
                label="Sorter"
              />

              {/* Numbers flowing through */}
              <div className="flex flex-col gap-3">
                {Array.from({ length: 10 }).map((_, i) => {
                  const num = i + 1;
                  const isEven = num % 2 === 0;
                  const isVisible = i <= sortIndex;

                  return (
                    <AnimatePresence key={num}>
                      {isVisible && (
                        <motion.div
                          className="flex items-center gap-3"
                          initial={{ x: -60, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="font-code text-lg text-primary w-6 text-right">{num}</span>
                          <motion.span
                            className="text-dim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                          >
                            &rarr;
                          </motion.span>
                          <motion.span
                            className={`font-code text-sm font-bold px-3 py-1 rounded ${
                              isEven
                                ? 'text-green border border-green/30 bg-green/10'
                                : 'text-amber border border-amber/30 bg-amber/10'
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                          >
                            {isEven ? 'EVEN' : 'ODD'}
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Clock wrapping */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Expression */}
            <motion.div
              className="font-code text-xl md:text-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-primary">hour</span>
              <span className="text-amber font-bold"> % </span>
              <span className="text-primary">12</span>
            </motion.div>

            {/* Clock face */}
            <div className="relative w-56 h-56">
              {/* Circle outline */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dim/30"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.05)' }}
              />

              {/* 12 positions */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = 50 + 42 * Math.cos(angle);
                const y = 50 + 42 * Math.sin(angle);
                const displayNum = i === 0 ? 12 : i;
                const isActive = clockHour !== null && (clockHour % 12 || 12) === displayNum;

                return (
                  <motion.div
                    key={i}
                    className="absolute font-code text-sm"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: isActive ? 'var(--accent-amber)' : 'var(--text-dim)',
                    }}
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.6, 1.3],
                            textShadow: '0 0 15px rgba(245,158,11,0.8)',
                          }
                        : { scale: 1, textShadow: 'none' }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {displayNum}
                  </motion.div>
                );
              })}

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {clockHour !== null && (
                    <motion.div
                      key={clockHour}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="font-code text-2xl text-blue">{clockHour}</span>
                      <span className="text-dim text-xs">&darr;</span>
                      <span className="font-code text-2xl text-amber font-bold">
                        {clockHour % 12 || 12}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Examples below */}
            <motion.div
              className="flex gap-6 font-code text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span>
                <span className="text-blue">13</span>
                <span className="text-dim"> &rarr; </span>
                <span className="text-amber">1</span>
              </span>
              <span>
                <span className="text-blue">25</span>
                <span className="text-dim"> &rarr; </span>
                <span className="text-amber">1</span>
              </span>
              <span>
                <span className="text-blue">24</span>
                <span className="text-dim"> &rarr; </span>
                <span className="text-amber">12</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Summary terminal */}
      <AnimatePresence>
        {phase === 4 && (
          <motion.div
            className="z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Terminal title="modulo_uses.c" showCursor={false} width="w-96">
              <div className="flex flex-col gap-3 font-code text-sm">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-dim">// Even or odd?</span>
                  <br />
                  <span className="text-primary">n</span>
                  <span className="text-amber"> % </span>
                  <span className="text-primary">2</span>
                  <span className="text-dim"> == 0 &rarr; </span>
                  <span className="text-green">EVEN</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="text-dim">// Wrapping around</span>
                  <br />
                  <span className="text-primary">hour</span>
                  <span className="text-amber"> % </span>
                  <span className="text-primary">12</span>
                  <span className="text-dim"> &rarr; keeps in range </span>
                  <span className="text-blue">0-11</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <span className="text-dim">// Last digit</span>
                  <br />
                  <span className="text-primary">n</span>
                  <span className="text-amber"> % </span>
                  <span className="text-primary">10</span>
                  <span className="text-dim"> &rarr; extracts </span>
                  <span className="text-purple">ones place</span>
                </motion.div>

                <motion.div
                  className="border-t border-white/10 pt-2 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  <span className="text-amber font-bold">%</span>
                  <span className="text-dim"> = remainder = patterns</span>
                </motion.div>
              </div>
            </Terminal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration */}
      <AnimatePresence mode="wait">
        {NARRATIONS[phase] && (
          <Narration key={phase} text={NARRATIONS[phase]} delay={0.5} />
        )}
      </AnimatePresence>
    </div>
  );
}
