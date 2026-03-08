'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';

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

    // Approach -> Check
    const t1 = setTimeout(() => {
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'check' } : e)));
    }, 800);

    // Check -> Result
    const t2 = setTimeout(() => {
      if (!item.isZero) setGateOpen(true);
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'result' } : e)));
    }, 1600);

    // Done, next
    const t3 = setTimeout(() => {
      if (!item.isZero) {
        setPassedNumbers(prev => [...prev, item.value]);
      }
      setEntries(prev => prev.map((e, i) => (i === prev.length - 1 ? { ...e, phase: 'done' } : e)));
      setGateOpen(false);
      setCurrentIndex(i => i + 1);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentIndex]);

  const currentEntry = entries[entries.length - 1];
  const isZeroCurrent = currentEntry?.isZero && currentEntry.phase !== 'done';
  const showFinalZero = currentIndex >= PARADE_NUMBERS.length;

  const codeText = currentEntry
    ? `if (${currentEntry.value}) {
  printf("True");  ${currentEntry.isZero ? '// NEVER runs!' : '// Runs!'}
}`
    : `if (5) {
  printf("True");  // 5 != 0, so TRUE
}`;

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

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Terminal title="truth.c" width="w-72" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed">
            <code style={{ color: isZeroCurrent ? '#EF4444' : '#22C55E' }}>
              {codeText}
            </code>
          </pre>
        </Terminal>
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
