'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

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
  codeLines: { text: string; colored?: { text: string; color: string }[] }[];
}

const makeCodeLines = (type: string, typeColor: string, varName: string, value: string, spec: string, specColor: string, printfTemplate: string) => [
  { text: '#include <stdio.h>', colored: [{ text: '#include <stdio.h>', color: 'var(--accent-purple)' }] },
  { text: '' },
  { text: 'int main() {', colored: [{ text: 'int', color: 'var(--accent-blue)' }, { text: ' main() {', color: 'var(--text-dim)' }] },
  {
    text: `    ${type} ${varName} = ${value};`,
    colored: [
      { text: '    ', color: 'var(--text-dim)' },
      { text: type, color: typeColor },
      { text: ` ${varName}`, color: 'var(--text-primary)' },
      { text: ' = ', color: 'var(--text-dim)' },
      { text: value, color: 'var(--accent-green)' },
      { text: ';', color: 'var(--text-dim)' },
    ],
  },
  {
    text: `    printf("${printfTemplate}\\n", ${varName});`,
    colored: [
      { text: '    ', color: 'var(--text-dim)' },
      { text: 'printf', color: 'var(--accent-gold)' },
      { text: '("', color: 'var(--text-dim)' },
      { text: printfTemplate.split(spec)[0], color: 'var(--accent-green)' },
      { text: spec, color: specColor },
      { text: '\\n"', color: 'var(--accent-green)' },
      { text: ', ', color: 'var(--text-dim)' },
      { text: varName, color: 'var(--text-primary)' },
      { text: ');', color: 'var(--text-dim)' },
    ],
  },
  { text: '    return 0;', colored: [{ text: '    ', color: 'var(--text-dim)' }, { text: 'return', color: 'var(--accent-purple)' }, { text: ' 0;', color: 'var(--text-dim)' }] },
  { text: '}', colored: [{ text: '}', color: 'var(--text-dim)' }] },
];

const EXAMPLES: Example[] = [
  {
    type: 'int', typeColor: 'var(--accent-blue)', varName: 'age', value: '25', displayValue: '25',
    spec: '%d', specColor: 'var(--accent-blue)', printfTemplate: 'My age is %d', output: 'My age is 25',
    codeLines: makeCodeLines('int', 'var(--accent-blue)', 'age', '25', '%d', 'var(--accent-blue)', 'My age is %d'),
  },
  {
    type: 'float', typeColor: 'var(--accent-green)', varName: 'gpa', value: '3.85', displayValue: '3.85',
    spec: '%f', specColor: 'var(--accent-green)', printfTemplate: 'GPA: %f', output: 'GPA: 3.850000',
    codeLines: makeCodeLines('float', 'var(--accent-green)', 'gpa', '3.85', '%f', 'var(--accent-green)', 'GPA: %f'),
  },
  {
    type: 'char', typeColor: 'var(--accent-red)', varName: 'grade', value: "'A'", displayValue: 'A',
    spec: '%c', specColor: 'var(--accent-red)', printfTemplate: 'Grade: %c', output: 'Grade: A',
    codeLines: makeCodeLines('char', 'var(--accent-red)', 'grade', "'A'", '%c', 'var(--accent-red)', 'Grade: %c'),
  },
  {
    type: 'float', typeColor: 'var(--accent-green)', varName: 'price', value: '9.99', displayValue: '9.99',
    spec: '%f', specColor: 'var(--accent-green)', printfTemplate: 'Price: %f', output: 'Price: 9.990000',
    codeLines: makeCodeLines('float', 'var(--accent-green)', 'price', '9.99', '%f', 'var(--accent-green)', 'Price: %f'),
  },
  {
    type: 'int', typeColor: 'var(--accent-blue)', varName: 'score', value: '100', displayValue: '100',
    spec: '%d', specColor: 'var(--accent-blue)', printfTemplate: 'Score: %d', output: 'Score: 100',
    codeLines: makeCodeLines('int', 'var(--accent-blue)', 'score', '100', '%d', 'var(--accent-blue)', 'Score: %d'),
  },
  {
    type: 'char', typeColor: 'var(--accent-red)', varName: 'initial', value: "'Z'", displayValue: 'Z',
    spec: '%c', specColor: 'var(--accent-red)', printfTemplate: 'Initial: %c', output: 'Initial: Z',
    codeLines: makeCodeLines('char', 'var(--accent-red)', 'initial', "'Z'", '%c', 'var(--accent-red)', 'Initial: %c'),
  },
];

// Phase 0: mailboxes appear
// Phase 1: code appears on right, line 0 (#include) highlights
// Phase 2: line 2 (int main) highlights
// Phase 3: line 3 (variable declaration) highlights — variable box glows in center
// Phase 4: line 4 (printf) highlights — value flies to specifier slot
// Phase 5: output appears in terminal
// Phase 6: interactive — try next example

export default function FormatSpecifiers() {
  const [phase, setPhase] = useState(0);
  const [exIndex, setExIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [highlightLine, setHighlightLine] = useState(-1);
  const [varBoxGlow, setVarBoxGlow] = useState(false);
  const [valueLiftoff, setValueLiftoff] = useState(false);
  const [valueDropped, setValueDropped] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const ex = EXAMPLES[exIndex % EXAMPLES.length];

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 6) return false;
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

  // Phase-based side effects
  useEffect(() => {
    if (phase === 1) {
      setHighlightLine(0); // #include
    }
    if (phase === 2) {
      setHighlightLine(2); // int main()
    }
    if (phase === 3) {
      setHighlightLine(3); // variable declaration
      setVarBoxGlow(true);
      const c = scaledTimeout(() => setVarBoxGlow(false), 1500);
      return c;
    }
    if (phase === 4) {
      setHighlightLine(4); // printf line
      const c1 = scaledTimeout(() => {
        setValueLiftoff(true);
        const c2 = scaledTimeout(() => {
          setValueDropped(true);
          setValueLiftoff(false);
        }, 1000);
        return c2;
      }, 600);
      return c1;
    }
    if (phase === 5) {
      setHighlightLine(5); // return 0
      const c = scaledTimeout(() => {
        setOutputVisible(true);
        const c2 = scaledTimeout(() => setPhase(6), 1500);
        return c2;
      }, 500);
      return c;
    }
  }, [phase, animKey, scaledTimeout]);

  const handleReplay = useCallback(() => {
    setExIndex((i) => i + 1);
    setHighlightLine(-1);
    setVarBoxGlow(false);
    setValueLiftoff(false);
    setValueDropped(false);
    setOutputVisible(false);
    setAnimKey((k) => k + 1);
    setPhase(1);
  }, []);

  const nextEx = EXAMPLES[(exIndex + 1) % EXAMPLES.length];

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-10 px-6 max-w-7xl w-full h-full py-6">
        {/* Left / center area — visual flow */}
        <div className="flex-[1.2] flex flex-col items-center justify-center gap-5">
          {/* Mailboxes row */}
          <motion.div
            className="flex gap-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {MAILBOXES.map((mb, i) => {
              const isActive = phase >= 3 && mb.spec === ex.spec;
              return (
                <motion.div
                  key={mb.spec}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div
                    className="w-20 h-24 rounded-t-lg border-2 flex flex-col items-center justify-end pb-3 relative transition-all duration-300"
                    style={{
                      borderColor: isActive ? mb.color : `${mb.color}60`,
                      background: isActive ? `${mb.color}20` : `${mb.color}10`,
                      boxShadow: isActive ? `0 0 20px ${mb.color}40` : 'none',
                    }}
                  >
                    <motion.div
                      className="absolute -top-3 -right-1 w-3 h-6 rounded-sm origin-bottom"
                      style={{ background: mb.flag }}
                      animate={{ rotateZ: [-10, 10, -10] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-code text-lg font-bold" style={{ color: mb.color }}>
                      {mb.spec}
                    </span>
                  </div>
                  <span className="text-sm text-dim font-body">{mb.label}</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Variable box — appears at phase 3 */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                key={`var-${animKey}`}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className="w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center relative"
                  style={{
                    borderColor: `${ex.typeColor}60`,
                    background: `${ex.typeColor}10`,
                  }}
                  animate={{
                    boxShadow: varBoxGlow
                      ? `0 0 30px ${ex.typeColor}50, 0 0 60px ${ex.typeColor}20`
                      : `0 0 0px transparent`,
                    borderColor: varBoxGlow ? ex.typeColor : `${ex.typeColor}60`,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.span
                    className="font-code text-3xl font-bold"
                    style={{ color: ex.typeColor }}
                    animate={valueLiftoff ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {ex.displayValue}
                  </motion.span>
                  <span className="text-sm font-code mt-1 opacity-50" style={{ color: ex.typeColor }}>
                    {ex.type}
                  </span>
                </motion.div>
                <span className="text-base text-dim font-code">{ex.varName}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Printf flow visualization — specifier slot */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                key={`flow-${animKey}`}
                className="flex items-center gap-2 font-code text-lg relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-dim">&quot;</span>
                <span className="text-green">{ex.printfTemplate.split(ex.spec)[0]}</span>
                <motion.span
                  className="px-2 py-0.5 rounded border-2 border-dashed min-w-[40px] text-center font-bold"
                  style={{
                    borderColor: valueDropped ? ex.specColor : `${ex.specColor}50`,
                    color: valueDropped ? ex.typeColor : ex.specColor,
                    background: valueDropped ? `${ex.typeColor}15` : `${ex.specColor}10`,
                  }}
                  animate={valueDropped ? { scale: [1.2, 1], borderStyle: 'solid' as const } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {valueDropped ? ex.displayValue : ex.spec}
                </motion.span>
                <span className="text-dim">&quot;</span>

                {/* Flying value */}
                {valueLiftoff && (
                  <motion.span
                    className="absolute font-code text-lg font-bold z-20"
                    style={{
                      color: ex.typeColor,
                      textShadow: `0 0 15px ${ex.typeColor}`,
                    }}
                    initial={{ left: '50%', top: -60, opacity: 1 }}
                    animate={{ left: '50%', top: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ex.displayValue}
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output terminal */}
          <AnimatePresence>
            {outputVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Terminal title="output" width="w-full max-w-md" showCursor>
                  <motion.span
                    className="text-green"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {ex.output}
                  </motion.span>
                </Terminal>
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
                className="px-5 py-2 rounded-lg border font-display text-sm tracking-wider transition-colors"
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

          {/* Narration */}
          {phase >= 3 && phase < 6 && (
            <Narration text={`Format specifiers are placeholders. ${ex.spec} says: a ${MAILBOXES.find(m => m.spec === ex.spec)?.label} will go here.`} delay={0.3} />
          )}
        </div>

        {/* Right side — code panel */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              key={`code-panel-${animKey}`}
              className="w-[420px] flex-shrink-0 flex flex-col"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(17, 22, 51, 0.9)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                {/* Editor title bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-black/30">
                  <div className="w-3 h-3 rounded-full bg-red/80" />
                  <div className="w-3 h-3 rounded-full bg-amber/80" />
                  <div className="w-3 h-3 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">main.c</span>
                </div>

                {/* Code lines */}
                <div className="p-5 font-code text-base leading-relaxed">
                  {ex.codeLines.map((line, i) => {
                    const isHighlighted = highlightLine === i;
                    const isPast = highlightLine > i;

                    return (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 px-2 py-0.5 rounded transition-colors duration-300 relative"
                        style={{
                          background: isHighlighted ? `${ex.typeColor}15` : 'transparent',
                          borderLeft: isHighlighted ? `3px solid ${ex.typeColor}` : '3px solid transparent',
                        }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{
                          opacity: isPast ? 0.5 : 1,
                          x: 0,
                        }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                      >
                        {/* Line number */}
                        <span className="text-dim/40 text-xs w-4 text-right select-none flex-shrink-0">
                          {i + 1}
                        </span>

                        {/* Code content */}
                        <span className="flex-1">
                          {line.colored ? (
                            line.colored.map((seg, j) => (
                              <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                            ))
                          ) : (
                            <span className="text-dim">{line.text}</span>
                          )}
                        </span>

                        {/* Execution arrow */}
                        {isHighlighted && (
                          <motion.span
                            className="text-xs font-bold flex-shrink-0"
                            style={{ color: ex.typeColor }}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            ◀
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Execution status below code */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`status-${phase}`}
                  className="mt-3 text-center text-xs font-body text-dim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase === 1 && 'Loading standard I/O library...'}
                  {phase === 2 && 'Entering main function...'}
                  {phase === 3 && `Declaring ${ex.type} ${ex.varName} = ${ex.value}`}
                  {phase === 4 && `Calling printf — replacing ${ex.spec} with ${ex.displayValue}`}
                  {phase === 5 && 'Returning 0 — program complete.'}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
