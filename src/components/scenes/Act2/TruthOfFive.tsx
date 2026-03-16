'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

const PARADE_NUMBERS = [
  { value: '5', color: '#00BFFF', delay: 0 },
  { value: '42', color: '#22C55E', delay: 3 },
  { value: '-7', color: '#F59E0B', delay: 5.5 },
  { value: '100', color: '#8B5CF6', delay: 8 },
  { value: '0.5', color: '#06B6D4', delay: 10.5 },
  { value: '0', color: '#EF4444', delay: 13, isZero: true },
];

type Phase = 'approach' | 'check' | 'result' | 'done';

interface NumberEntry {
  value: string;
  color: string;
  isZero?: boolean;
  phase: Phase;
}

export default function TruthOfFive() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [entries, setEntries] = useState<NumberEntry[]>([]);
  const [passedNumbers, setPassedNumbers] = useState<string[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Arrow key handler — advance to next number
  const stableStepHandler = useCallback(() => {
    if (currentIndexRef.current >= PARADE_NUMBERS.length) return false;
    setCurrentIndex(i => i + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (currentIndexRef.current <= 0) return false;
    setCurrentIndex(i => i - 1);
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

  useEffect(() => {
    if (currentIndex >= PARADE_NUMBERS.length) return;

    const item = PARADE_NUMBERS[currentIndex];
    const entry: NumberEntry = {
      value: item.value,
      color: item.color,
      isZero: item.isZero,
      phase: 'approach',
    };

    setEntries(prev => [...prev.slice(-1), entry]);
    setGateOpen(false);

    const c1 = scaledTimeout(() => {
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'check' } : e)));
    }, 800);

    const c2 = scaledTimeout(() => {
      if (!item.isZero) setGateOpen(true);
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'result' } : e)));
    }, 1600);

    const c3 = scaledTimeout(() => {
      if (!item.isZero) {
        setPassedNumbers(prev => [...prev, item.value]);
      }
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'done' } : e)));
      setGateOpen(false);
    }, 2800);

    return () => { c1(); c2(); c3(); };
  }, [currentIndex, scaledTimeout]);

  const currentEntry = entries[entries.length - 1];
  const showFinalZero = currentIndex >= PARADE_NUMBERS.length;

  // Determine which code line to highlight based on current phase
  // Line 0: int x = VALUE;
  // Line 1: (blank)
  // Line 2: if (x) {            ← 'approach'/'check'
  // Line 3:     printf("True");  ← 'result' (only if non-zero)
  // Line 4: }
  const currentVal = currentEntry?.value ?? '?';
  const isZero = currentEntry?.isZero;
  const entryPhase = currentEntry?.phase;

  const getHighlightLine = (): number => {
    if (!entryPhase || entryPhase === 'done') return -1;
    if (entryPhase === 'approach') return 0; // assigning value
    if (entryPhase === 'check') return 2;    // if check
    if (entryPhase === 'result') return isZero ? 2 : 3; // printf if truthy, stays on if-line if falsy
    return -1;
  };
  const highlightLine = getHighlightLine();

  // Code lines for the panel
  const CODE_LINES = [
    {
      segments: [
        { text: 'int', color: 'var(--accent-blue)' },
        { text: ' x = ', color: 'var(--text-dim)' },
        { text: currentVal, color: currentEntry?.color ?? 'var(--text-primary)' },
        { text: ';', color: 'var(--text-dim)' },
      ],
    },
    { segments: [] }, // blank
    {
      segments: [
        { text: 'if', color: 'var(--accent-purple)' },
        { text: ' (x) {', color: 'var(--text-dim)' },
      ],
    },
    {
      segments: [
        { text: '    ', color: '' },
        { text: 'printf', color: 'var(--accent-gold)' },
        { text: '(', color: 'var(--text-dim)' },
        { text: '"True\\n"', color: 'var(--accent-green)' },
        { text: ');', color: 'var(--text-dim)' },
      ],
    },
    {
      segments: [{ text: '}', color: 'var(--text-dim)' }],
    },
  ];

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0a0e1a 0%, #111633 50%, #0a0e1a 100%)',
      }}
    >
      {/* Gate structure */}
      <div className="relative flex flex-col items-center">
        {/* Bouncer sign */}
        <motion.div
          className="mb-4 px-6 py-2 rounded-lg border-2 font-display text-sm text-center"
          style={{
            borderColor: '#FFD700',
            background: 'rgba(255,215,0,0.1)',
            color: '#FFD700',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ONLY NON-ZERO MAY ENTER
        </motion.div>

        {/* Gate */}
        <div className="relative w-64 h-48 flex items-end justify-center">
          {/* Gate posts */}
          <div className="absolute left-4 top-0 w-4 h-full rounded-t-sm" style={{ background: 'linear-gradient(180deg, #8B7355, #6B5435)' }} />
          <div className="absolute right-4 top-0 w-4 h-full rounded-t-sm" style={{ background: 'linear-gradient(180deg, #8B7355, #6B5435)' }} />

          {/* Gate arch */}
          <div className="absolute top-0 left-4 right-4 h-6 rounded-t-xl" style={{ background: 'linear-gradient(180deg, #9B8365, #7B6345)' }} />

          {/* Gate doors */}
          <motion.div
            className="absolute left-8 top-6 bottom-0 w-[calc(50%-16px)] origin-left"
            style={{ background: 'linear-gradient(90deg, #5a4a2a, #4a3a1a)', borderRight: '1px solid #3a2a0a' }}
            animate={{ rotateY: gateOpen ? -80 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          <motion.div
            className="absolute right-8 top-6 bottom-0 w-[calc(50%-16px)] origin-right"
            style={{ background: 'linear-gradient(90deg, #4a3a1a, #5a4a2a)', borderLeft: '1px solid #3a2a0a' }}
            animate={{ rotateY: gateOpen ? 80 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />

          {/* Approaching character */}
          <AnimatePresence mode="wait">
            {currentEntry && currentEntry.phase !== 'done' && (
              <motion.div
                key={currentEntry.value}
                className="absolute bottom-2 flex flex-col items-center z-10"
                initial={{ x: -120, opacity: 0 }}
                animate={{
                  x:
                    currentEntry.phase === 'approach' ? -40 :
                    currentEntry.phase === 'check' ? 0 :
                    currentEntry.isZero ? -40 : 120,
                  opacity: currentEntry.phase === 'result' && !currentEntry.isZero ? 0 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <motion.span
                  className="font-display font-bold text-2xl mb-1"
                  style={{ color: currentEntry.color }}
                >
                  {currentEntry.value}
                </motion.span>
                <BitCharacter
                  mood={
                    currentEntry.phase === 'check' ? 'neutral' :
                    currentEntry.isZero && currentEntry.phase === 'result' ? 'sad' : 'happy'
                  }
                  size={40}
                  color={currentEntry.color}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Check indicator */}
          <AnimatePresence>
            {currentEntry && currentEntry.phase === 'check' && (
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 font-code text-xs px-3 py-1 rounded"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: currentEntry.isZero ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                  color: currentEntry.isZero ? '#EF4444' : '#22C55E',
                  border: `1px solid ${currentEntry.isZero ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                }}
              >
                {currentEntry.value} != 0 ? {currentEntry.isZero ? 'NO' : 'YES'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Passed numbers */}
        <motion.div className="flex gap-3 mt-6">
          {passedNumbers.map((num, i) => (
            <motion.span
              key={`${num}-${i}`}
              className="font-code text-sm px-2 py-1 rounded"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {num} passed
            </motion.span>
          ))}
        </motion.div>

        {/* Sad zero at end */}
        <AnimatePresence>
          {showFinalZero && (
            <motion.div
              className="flex flex-col items-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <BitCharacter mood="sad" size={50} color="#EF4444" label="0 (rejected)" />
              <motion.p
                className="text-red-400/70 font-body text-xs mt-2 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Zero stands alone...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Code panel — top right */}
      <motion.div
        className="absolute top-6 right-6 w-80"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'rgba(17, 22, 51, 0.95)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
            <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
            <span className="text-xs text-dim ml-2 font-code">truth.c</span>
          </div>

          {/* Code lines */}
          <div className="px-3 py-3 font-code text-sm leading-relaxed">
            {CODE_LINES.map((line, i) => {
              const isHighlighted = highlightLine === i;
              // printf line dims red when zero is being checked
              const isBlockedLine = i === 3 && isZero && (entryPhase === 'result' || entryPhase === 'check');

              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-2 py-0.5 rounded"
                  style={{
                    background: isHighlighted
                      ? isBlockedLine
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(255,215,0,0.1)'
                      : 'transparent',
                    borderLeft: isHighlighted
                      ? `3px solid ${isBlockedLine ? '#EF4444' : 'var(--accent-gold)'}`
                      : '3px solid transparent',
                  }}
                  animate={{
                    opacity: highlightLine >= 0 && !isHighlighted ? 0.4 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                    {line.segments.length > 0 ? i + 1 : ''}
                  </span>
                  <span className="flex-1 whitespace-pre">
                    {line.segments.length > 0 ? (
                      line.segments.map((seg, j) => (
                        <span
                          key={j}
                          style={{
                            color: isBlockedLine && i === 3 ? '#EF4444' : seg.color,
                            textDecoration: isBlockedLine && i === 3 ? 'line-through' : 'none',
                          }}
                        >
                          {seg.text}
                        </span>
                      ))
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </span>
                  {isHighlighted && (
                    <motion.span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: isBlockedLine ? '#EF4444' : 'var(--accent-gold)' }}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      ◀
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Execution status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`status-${currentIndex}-${entryPhase}`}
            className="mt-2 text-center text-xs font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
          >
            {entryPhase === 'approach' && (
              <span className="text-dim">
                Testing <span style={{ color: currentEntry?.color }}>{currentVal}</span>...
              </span>
            )}
            {entryPhase === 'check' && !isZero && (
              <span style={{ color: '#22C55E' }}>
                {currentVal} != 0 → <span className="font-bold">TRUE</span> → enters if block
              </span>
            )}
            {entryPhase === 'check' && isZero && (
              <span style={{ color: '#EF4444' }}>
                {currentVal} == 0 → <span className="font-bold">FALSE</span> → skips if block
              </span>
            )}
            {entryPhase === 'result' && !isZero && (
              <span style={{ color: '#22C55E' }}>
                printf executes! ✓ Output: &quot;True&quot;
              </span>
            )}
            {entryPhase === 'result' && isZero && (
              <span style={{ color: '#EF4444' }}>
                printf SKIPPED ✗ — body never runs
              </span>
            )}
            {(entryPhase === 'done' || !entryPhase) && !showFinalZero && (
              <span className="text-dim">Press → for next number</span>
            )}
            {showFinalZero && (
              <span className="text-dim">All numbers tested</span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Output terminal */}
        {passedNumbers.length > 0 && (
          <motion.div
            className="mt-3 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30">
              <span className="text-[10px] text-dim font-code">output</span>
            </div>
            <div className="px-3 py-2 font-code text-xs">
              {passedNumbers.map((num, i) => (
                <motion.div
                  key={`${num}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green"
                >
                  if({num}) → True
                </motion.div>
              ))}
              {showFinalZero && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red"
                >
                  if(0) → <span className="line-through">True</span> (skipped)
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <Narration
        text={
          showFinalZero
            ? 'In C, every non-zero value is truthy. Only zero is false.'
            : 'The bouncer checks: are you non-zero? Then you may pass.'
        }
      />
    </div>
  );
}
