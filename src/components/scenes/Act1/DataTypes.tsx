'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const DATA_TYPES = [
  { name: 'age', type: 'int', value: '21', color: 'var(--accent-blue)', examples: ['0', '-5', '100', '2024'], typeLabel: 'whole numbers' },
  { name: 'height', type: 'float', value: '5.9', color: 'var(--accent-green)', examples: ['3.14', '-0.5', '98.6'], typeLabel: 'decimals' },
  { name: 'grade', type: 'char', value: "'A'", color: 'var(--accent-red)', examples: ["'z'", "'7'", "'!'"], typeLabel: 'single character' },
  { name: 'passed', type: 'bool', value: 'true', color: 'var(--accent-purple)', examples: ['true', 'false'], typeLabel: 'true / false' },
];

const NARRATIONS: Record<number, string> = {
  0: 'A variable is a labeled box \u2014 it holds one piece of data.',
  1: 'An integer \u2014 a whole number. No decimals, no fractions.',
  2: 'A float \u2014 a number with a decimal point.',
  3: 'A char \u2014 one single character, always wrapped in single quotes.',
  4: 'A boolean \u2014 just true or false. On or off. One or zero.',
  5: 'Four core types. Each box only accepts the right kind of data.',
  6: 'Put the wrong data in the wrong box, and C will get confused \u2014 or silently break.',
  7: 'Put the wrong data in the wrong box, and C will get confused \u2014 or silently break.',
  8: 'Put the wrong data in the wrong box, and C will get confused \u2014 or silently break.',
  9: 'But how does printf know what type of data you\u2019re giving it? That\u2019s next.',
};

const WRONG_ASSIGNMENTS = [
  { code: 'int x = 3.14;', reason: 'truncates to 3!' },
  { code: 'char c = "hello";', reason: "that's a string, not a char!" },
  { code: "float f = 'A';", reason: 'weird implicit conversion!' },
];

const MAX_PHASE = 9;

export default function DataTypes() {
  const [phase, setPhase] = useState(0);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= MAX_PHASE) return false;
    setPhase(prev => prev + 1);
    return true;
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    return () => setSceneStepHandler(null);
  }, [setSceneStepHandler, stableStepHandler]);

  const activeTypeIndex = phase >= 1 && phase <= 4 ? phase - 1 : -1;
  // How many wrong assignments to show (phases 6=1, 7=2, 8=3)
  const wrongCount = phase >= 6 && phase <= 8 ? phase - 5 : 0;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Narration */}
      <AnimatePresence mode="wait">
        <motion.p
          key={NARRATIONS[phase]}
          className="absolute top-10 left-0 right-0 text-center text-2xl md:text-3xl font-body text-primary/90 px-8 z-20 leading-snug"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
        >
          {NARRATIONS[phase]}
        </motion.p>
      </AnimatePresence>

      {/* Code declaration above boxes (phases 1-4) */}
      <AnimatePresence mode="wait">
        {phase >= 1 && phase <= 4 && (
          <motion.div
            key={`code-${phase}`}
            className="absolute top-28 left-0 right-0 text-center z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-code text-lg md:text-xl">
              <CodeDeclaration index={activeTypeIndex} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phases 0-4: variable boxes in a row */}
      {phase <= 4 && (
        <div className="flex gap-5 z-10">
          {DATA_TYPES.map((dt, i) => {
            const isFilled = phase > i;
            const isActive = activeTypeIndex === i;

            return (
              <motion.div
                key={dt.name}
                layout
                className="flex flex-col items-center gap-2"
                transition={{ layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              >
                <motion.div
                  className="w-28 h-28 md:w-36 md:h-36 rounded-xl flex flex-col items-center justify-center relative"
                  style={{
                    border: isFilled
                      ? `2px solid ${dt.color}`
                      : '2px dashed rgba(255,255,255,0.2)',
                    boxShadow: isActive ? `0 0 25px ${dt.color}40` : 'none',
                    background: isFilled ? `${dt.color}10` : 'transparent',
                  }}
                  animate={{
                    borderColor: isFilled ? dt.color : 'rgba(255,255,255,0.2)',
                    boxShadow: isActive ? `0 0 25px ${dt.color}40` : '0 0 0px transparent',
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="absolute -top-3 px-2 text-sm font-code text-dim bg-void">
                    {dt.name}
                  </span>
                  <AnimatePresence>
                    {isFilled && (
                      <motion.span
                        className="font-code text-2xl md:text-3xl font-bold"
                        style={{ color: dt.color }}
                        initial={{ y: -80, opacity: 0, scale: 1.3 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        {dt.value}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {isFilled && (
                      <motion.span
                        className="text-xs font-code mt-1 opacity-60"
                        style={{ color: dt.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.3 }}
                      >
                        {dt.type}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="flex gap-2 text-sm text-dim font-code"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ delay: 0.4 }}
                    >
                      {dt.examples.map((ex, j) => (
                        <motion.span
                          key={ex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + j * 0.1 }}
                        >
                          {ex}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Phase 5: 2x2 grid + cheat sheet in a single centered column */}
      <AnimatePresence>
        {phase === 5 && (
          <motion.div
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 2x2 grid of filled boxes */}
            <div className="grid grid-cols-2 gap-4">
              {DATA_TYPES.map((dt) => (
                <motion.div
                  key={dt.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-xl flex flex-col items-center justify-center relative"
                  style={{
                    border: `2px solid ${dt.color}`,
                    background: `${dt.color}10`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="absolute -top-3 px-2 text-xs font-code text-dim bg-void">
                    {dt.name}
                  </span>
                  <span className="font-code text-xl md:text-2xl font-bold" style={{ color: dt.color }}>
                    {dt.value}
                  </span>
                  <span className="text-xs font-code mt-1 opacity-60" style={{ color: dt.color }}>
                    {dt.type}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Cheat sheet */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg font-display tracking-wider text-primary/70">Type Cheat Sheet</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {DATA_TYPES.map((dt, i) => (
                  <motion.div
                    key={dt.type}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span
                      className="px-3 py-1 rounded-full text-sm font-code font-bold"
                      style={{ backgroundColor: `${dt.color}20`, color: dt.color }}
                    >
                      {dt.type}
                    </span>
                    <span className="text-sm text-dim font-body">{dt.typeLabel}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                className="text-sm text-dim italic font-body mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Strings (text) are arrays of chars &mdash; more on that later.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phases 6-8: Wrong type demo, one per press */}
      <AnimatePresence>
        {phase >= 6 && phase <= 8 && (
          <motion.div
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {WRONG_ASSIGNMENTS.slice(0, wrongCount).map((wa, i) => {
              const isNew = i === wrongCount - 1;
              return (
                <motion.div
                  key={wa.code}
                  className="flex items-center gap-4"
                  initial={isNew ? { opacity: 0, x: -30 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="font-code text-lg md:text-xl text-primary/80 line-through decoration-red/60">
                    {wa.code}
                  </span>
                  <motion.span
                    className="text-red text-2xl font-bold"
                    initial={isNew ? { opacity: 0, scale: 0 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={isNew ? { delay: 0.15, type: 'spring', stiffness: 300 } : {}}
                  >
                    ✗
                  </motion.span>
                  <motion.span
                    className="text-sm text-dim font-body italic"
                    initial={isNew ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={isNew ? { delay: 0.3 } : {}}
                  >
                    {wa.reason}
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 9: Bridge to format specifiers */}
      <AnimatePresence>
        {phase === 9 && (
          <motion.div
            className="flex flex-col items-center gap-8 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-code text-lg md:text-xl text-primary/80">
              <span className="text-gold">printf</span>
              <span className="text-dim">(</span>
              <span className="text-green">&quot;Age: </span>
              <SpecifierWithPulse text="%d" color="var(--accent-blue)" />
              <span className="text-green">, GPA: </span>
              <SpecifierWithPulse text="%f" color="var(--accent-green)" />
              <span className="text-green">, Grade: </span>
              <SpecifierWithPulse text="%c" color="var(--accent-red)" />
              <span className="text-green">&quot;</span>
              <span className="text-dim">, age, gpa, grade);</span>
            </div>
            <motion.p
              className="text-dim font-body text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Each <span className="text-blue font-code">%d</span>,{' '}
              <span className="text-green font-code">%f</span>,{' '}
              <span className="text-red font-code">%c</span> tells printf the type of data coming next.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle for phase 0 */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.p
            className="absolute bottom-20 text-dim text-lg font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            Variables are containers for data.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeDeclaration({ index }: { index: number }) {
  if (index < 0 || index >= DATA_TYPES.length) return null;
  const dt = DATA_TYPES[index];

  return (
    <>
      <span style={{ color: dt.color }}>{dt.type}</span>
      <span className="text-primary"> {dt.name}</span>
      <span className="text-dim"> = </span>
      <span className={dt.type === 'char' ? 'text-green' : dt.type === 'bool' ? 'text-purple' : 'text-primary'}>
        {dt.value}
      </span>
      <span className="text-dim">;</span>
    </>
  );
}

function SpecifierWithPulse({ text, color }: { text: string; color: string }) {
  return (
    <span className="relative inline-flex items-center">
      <span className="font-bold" style={{ color }}>
        {text}
      </span>
      <motion.span
        className="ml-1 text-sm font-bold"
        style={{ color }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        ?
      </motion.span>
    </span>
  );
}
