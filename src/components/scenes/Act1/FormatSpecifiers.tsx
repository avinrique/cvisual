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

interface Example {
  type: string;
  typeColor: string;
  varName: string;
  value: string;
  displayValue: string;
  spec: string;
  specColor: string;
  printfTemplate: string;
  output: string;
}

const EXAMPLES: Example[] = [
  { type: 'int', typeColor: 'var(--accent-blue)', varName: 'age', value: '25', displayValue: '25', spec: '%d', specColor: 'var(--accent-blue)', printfTemplate: 'My age is %d', output: 'My age is 25' },
  { type: 'float', typeColor: 'var(--accent-green)', varName: 'gpa', value: '3.85', displayValue: '3.85', spec: '%f', specColor: 'var(--accent-green)', printfTemplate: 'GPA: %f', output: 'GPA: 3.850000' },
  { type: 'char', typeColor: 'var(--accent-red)', varName: 'grade', value: "'A'", displayValue: 'A', spec: '%c', specColor: 'var(--accent-red)', printfTemplate: 'Grade: %c', output: 'Grade: A' },
  { type: 'float', typeColor: 'var(--accent-green)', varName: 'price', value: '9.99', displayValue: '9.99', spec: '%f', specColor: 'var(--accent-green)', printfTemplate: 'Price: %f', output: 'Price: 9.990000' },
  { type: 'int', typeColor: 'var(--accent-blue)', varName: 'score', value: '100', displayValue: '100', spec: '%d', specColor: 'var(--accent-blue)', printfTemplate: 'Score: %d', output: 'Score: 100' },
  { type: 'char', typeColor: 'var(--accent-red)', varName: 'initial', value: "'Z'", displayValue: 'Z', spec: '%c', specColor: 'var(--accent-red)', printfTemplate: 'Initial: %c', output: 'Initial: Z' },
];

export default function FormatSpecifiers() {
  const [phase, setPhase] = useState(0);
  const [exIndex, setExIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [codeGlow, setCodeGlow] = useState(false);
  const [valueLiftoff, setValueLiftoff] = useState(false);
  const [valueDropped, setValueDropped] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  const ex = EXAMPLES[exIndex % EXAMPLES.length];

  // Initial auto-play for first example
  useEffect(() => {
    const c = [
      scaledTimeout(() => setPhase(1), 1000),
      scaledTimeout(() => setPhase(2), 2500),
      scaledTimeout(() => setPhase(3), 3500),
    ];
    return () => c.forEach(fn => fn());
  }, [scaledTimeout]);

  // Flow animation: glow → liftoff → drop → output
  useEffect(() => {
    if (phase === 3) {
      // Glow the code line first
      setCodeGlow(true);
      const c1 = scaledTimeout(() => {
        setCodeGlow(false);
        setValueLiftoff(true);
        const c2 = scaledTimeout(() => {
          setValueDropped(true);
          setValueLiftoff(false);
          const c3 = scaledTimeout(() => {
            setOutputVisible(true);
            scaledTimeout(() => setPhase(6), 1500);
          }, 800);
          return c3;
        }, 1200);
        return c2;
      }, 800);
      return c1;
    }
  }, [phase, animKey, scaledTimeout]);

  const handleReplay = useCallback(() => {
    setExIndex((i) => i + 1);
    setCodeGlow(false);
    setValueLiftoff(false);
    setValueDropped(false);
    setOutputVisible(false);
    setAnimKey((k) => k + 1);
    scaledTimeout(() => {
      setPhase(3);
    }, 300);
  }, [scaledTimeout]);

  const nextEx = EXAMPLES[(exIndex + 1) % EXAMPLES.length];

  return (
    <div data-interactive className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void gap-8">
      {/* Mailboxes row */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {MAILBOXES.map((mb, i) => {
          const isActive = phase >= 2 && mb.spec === ex.spec;
          return (
            <motion.div
              key={mb.spec}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div
                className="w-16 h-20 rounded-t-lg border-2 flex flex-col items-center justify-end pb-2 relative transition-all duration-300"
                style={{
                  borderColor: isActive ? mb.color : `${mb.color}60`,
                  background: isActive ? `${mb.color}20` : `${mb.color}10`,
                  boxShadow: isActive ? `0 0 20px ${mb.color}40` : 'none',
                }}
              >
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
          );
        })}
      </motion.div>

      {/* Code line with glow effect */}
      <AnimatePresence mode="wait">
        {phase >= 1 && (
          <motion.div
            key={`code-${animKey}`}
            className="font-code text-sm text-center space-y-1 relative rounded-lg px-4 py-2"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: codeGlow ? 1.15 : 1,
              boxShadow: codeGlow ? `0 0 30px ${ex.typeColor}50, 0 0 60px ${ex.typeColor}20` : '0 0 0px transparent',
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.4, type: 'spring', stiffness: 300, damping: 15 },
              boxShadow: { duration: 0.4 },
            }}
            style={{
              background: codeGlow ? `${ex.typeColor}08` : 'transparent',
              border: codeGlow ? `1px solid ${ex.typeColor}30` : '1px solid transparent',
            }}
          >
            <div className="text-dim">
              <span style={{ color: ex.typeColor }}>{ex.type}</span> {ex.varName} = <span className="text-green">{ex.value}</span>;
            </div>
            <div className="text-dim">
              printf(<span className="text-gold">&quot;{ex.printfTemplate.split(ex.spec)[0]}<span className="font-bold" style={{ color: ex.specColor }}>{ex.spec}</span>\n&quot;</span>, <span className="text-green">{ex.varName}</span>);
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variable box + conveyor area */}
      {phase >= 2 && (
        <motion.div
          className="relative flex items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={animKey}
        >
          {/* Variable box */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={valueLiftoff ? { y: -20, opacity: 0.3 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-lg border-2 flex items-center justify-center relative"
              style={{ borderColor: `${ex.typeColor}50`, background: `${ex.typeColor}10` }}
            >
              <span className="font-code text-xl" style={{ color: ex.typeColor }}>{ex.displayValue}</span>
            </div>
            <span className="text-xs text-dim font-code">{ex.varName}</span>
          </motion.div>

          {/* Conveyor belt area */}
          <div className="relative w-80">
            <ConveyorBelt
              items={[
                { id: '1', content: <span className="text-primary">{ex.printfTemplate.split(ex.spec)[0]}</span> },
                {
                  id: '2',
                  content: valueDropped ? (
                    <motion.span
                      className="font-bold"
                      style={{ color: ex.typeColor }}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {ex.displayValue}
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
                className="absolute font-code text-lg z-20"
                style={{ color: ex.typeColor, textShadow: `0 0 10px ${ex.typeColor}` }}
                initial={{ left: -20, top: -30 }}
                animate={{ left: 140, top: 8 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {ex.displayValue}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Output */}
      <AnimatePresence>
        {outputVisible && (
          <motion.div
            className="px-6 py-3 rounded-lg border font-code"
            style={{
              borderColor: `${ex.typeColor}30`,
              color: ex.typeColor,
              background: 'rgba(17,22,51,0.9)',
              boxShadow: `0 0 20px ${ex.typeColor}30`,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {ex.output}
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
            className="px-6 py-2 rounded-lg border font-display text-sm tracking-wider transition-colors"
            style={{
              borderColor: `${nextEx.typeColor}40`,
              color: nextEx.typeColor,
            }}
            onClick={(e) => { e.stopPropagation(); handleReplay(); }}
            whileHover={{ scale: 1.05, backgroundColor: `${nextEx.typeColor}10` }}
            whileTap={{ scale: 0.95 }}
          >
            Try {nextEx.type} {nextEx.varName} = {nextEx.value} →
          </motion.button>
          <InteractiveIndicator />
        </motion.div>
      )}

      {phase >= 2 && phase < 6 && (
        <Narration text={`Format specifiers are placeholders. ${ex.spec} says: a ${MAILBOXES.find(m => m.spec === ex.spec)?.label} will go here.`} delay={0.5} />
      )}
    </div>
  );
}
