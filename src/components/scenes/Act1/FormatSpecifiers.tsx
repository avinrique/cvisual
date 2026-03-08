'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConveyorBelt from '@/components/shared/ConveyorBelt';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const MAILBOXES = [
  { spec: '%d', color: 'var(--accent-blue)', label: 'integer', flag: '#00BFFF' },
  { spec: '%f', color: 'var(--accent-green)', label: 'float', flag: '#22C55E' },
  { spec: '%c', color: 'var(--accent-red)', label: 'char', flag: '#EF4444' },
  { spec: '%s', color: 'var(--accent-gold)', label: 'string', flag: '#FFD700' },
];

const VALUES = [21, 25, 30, 18, 42, 99];

export default function FormatSpecifiers() {
  const [phase, setPhase] = useState(0);
  const [valueIndex, setValueIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [valueLiftoff, setValueLiftoff] = useState(false);
  const [valueDropped, setValueDropped] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  const currentValue = VALUES[valueIndex % VALUES.length];

  useEffect(() => {
    const c = [
      scaledTimeout(() => setPhase(1), 1000),
      scaledTimeout(() => setPhase(2), 2500),
      scaledTimeout(() => setPhase(3), 3500),
    ];
    return () => c.forEach(fn => fn());
  }, [scaledTimeout]);

  useEffect(() => {
    if (phase === 3) {
      setValueLiftoff(true);
      const c1 = scaledTimeout(() => {
        setValueDropped(true);
        setValueLiftoff(false);
        const c2 = scaledTimeout(() => {
          setOutputVisible(true);
          scaledTimeout(() => setPhase(6), 1500);
        }, 800);
        return c2;
      }, 1200);
      return c1;
    }
  }, [phase, animKey, scaledTimeout]);

  const handleReplay = useCallback(() => {
    setValueIndex((i) => i + 1);
    setValueLiftoff(false);
    setValueDropped(false);
    setOutputVisible(false);
    setAnimKey((k) => k + 1);
    scaledTimeout(() => {
      setPhase(3);
    }, 300);
  }, [scaledTimeout]);

  const val = VALUES[(valueIndex + 1) % VALUES.length];

  return (
    <div data-interactive className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void gap-8">
      {/* Mailboxes row */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {MAILBOXES.map((mb, i) => (
          <motion.div
            key={mb.spec}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          >
            {/* Mailbox */}
            <div
              className="w-16 h-20 rounded-t-lg border-2 flex flex-col items-center justify-end pb-2 relative"
              style={{ borderColor: mb.color, background: `${mb.color}10` }}
            >
              {/* Flag */}
              <motion.div
                className="absolute -top-3 -right-1 w-4 h-8 rounded-sm origin-bottom"
                style={{ background: mb.flag }}
                animate={{ rotateZ: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-code text-lg font-bold" style={{ color: mb.color }}>
                {mb.spec}
              </span>
            </div>
            <span className="text-xs text-dim font-body">{mb.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Code line */}
      {phase >= 1 && (
        <motion.div
          className="font-code text-sm text-center space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-dim">
            <span className="text-blue">int</span> age = <span className="text-green">{currentValue}</span>;
          </div>
          <div className="text-dim">
            printf(<span className="text-gold">&quot;My age is <span className="text-blue font-bold">%d</span>\n&quot;</span>, <span className="text-green">age</span>);
          </div>
        </motion.div>
      )}

      {/* Age variable box + conveyor area */}
      {phase >= 2 && (
        <motion.div
          className="relative flex items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={animKey}
        >
          {/* Age box */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={valueLiftoff ? { y: -20, opacity: 0.3 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-lg border-2 border-green/50 flex items-center justify-center relative"
              style={{ background: 'rgba(34,197,94,0.1)' }}
            >
              <span className="font-code text-xl text-green">{currentValue}</span>
            </div>
            <span className="text-xs text-dim font-code">age</span>
          </motion.div>

          {/* Conveyor belt area */}
          <div className="relative w-80">
            <ConveyorBelt
              items={[
                { id: '1', content: <span className="text-primary">My age is </span> },
                {
                  id: '2',
                  content: valueDropped ? (
                    <motion.span
                      className="text-green font-bold"
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {currentValue}
                    </motion.span>
                  ) : (
                    ''
                  ),
                  slot: !valueDropped,
                },
              ]}
              speed={1.5}
            />

            {/* Floating value traveling to slot */}
            {valueLiftoff && (
              <motion.div
                className="absolute font-code text-lg text-green z-20"
                style={{ textShadow: '0 0 10px var(--glow-green)' }}
                initial={{ left: -20, top: -30 }}
                animate={{ left: 140, top: 8 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentValue}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Output */}
      <AnimatePresence>
        {outputVisible && (
          <motion.div
            className="px-6 py-3 rounded-lg border border-green/30 font-code text-green"
            style={{ background: 'rgba(17,22,51,0.9)', boxShadow: '0 0 20px var(--glow-green)' }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            My age is {currentValue}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive prompt */}
      {phase >= 6 && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="px-6 py-2 rounded-lg border border-blue/40 text-blue font-display text-sm tracking-wider hover:bg-blue/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleReplay(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Change value to {val} &amp; replay
          </motion.button>
          <InteractiveIndicator />
        </motion.div>
      )}

      {phase >= 2 && phase < 6 && (
        <Narration text="Format specifiers are placeholders. %d says: a number will go here." delay={0.5} />
      )}
    </div>
  );
}
