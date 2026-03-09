'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const BASE = 7;

const CODE_LINES = [
  { colored: [{ text: '#include <stdio.h>', color: 'var(--accent-purple)' }] },
  { colored: [] }, // blank
  { colored: [{ text: 'int', color: 'var(--accent-blue)' }, { text: ' main() {', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    ', color: '' }, { text: 'for', color: 'var(--accent-purple)' }, { text: ' (', color: 'var(--text-dim)' }, { text: 'int', color: 'var(--accent-blue)' }, { text: ' i=', color: 'var(--text-primary)' }, { text: '1', color: 'var(--accent-green)' }, { text: '; ', color: 'var(--text-dim)' }, { text: 'i<=10', color: 'var(--accent-green)' }, { text: '; ', color: 'var(--text-dim)' }, { text: 'i++', color: 'var(--accent-amber)' }, { text: ') {', color: 'var(--text-dim)' }] },
  { colored: [{ text: '        ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: `"${BASE} x %d = %d\\n"`, color: 'var(--accent-green)' }, { text: `, i, ${BASE}*i`, color: 'var(--text-dim)' }, { text: ');', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    }', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    ', color: '' }, { text: 'return', color: 'var(--accent-purple)' }, { text: ' 0;', color: 'var(--text-dim)' }] },
  { colored: [{ text: '}', color: 'var(--text-dim)' }] },
];

// Animation cycle per iteration:
// step 0: highlight line 3 (for — check condition)
// step 1: highlight line 4 (printf — execute body)
// step 2: highlight line 3 again (i++ — update, then check)
// After last iteration: highlight line 6 (return)

export default function MultiplicationFactory() {
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [products, setProducts] = useState<{ m: number; p: number }[]>([]);
  const [spark, setSpark] = useState(false);
  const [highlightLine, setHighlightLine] = useState(-1);
  const [codeStep, setCodeStep] = useState<'init' | 'check' | 'body' | 'update' | 'done'>('init');
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    if (currentMultiplier >= 10) {
      // Loop done — highlight return
      const c = scaledTimeout(() => {
        setHighlightLine(6);
        setCodeStep('done');
      }, 800);
      return c;
    }

    const cancelTimer = scaledTimeout(() => {
      const m = currentMultiplier + 1;
      setCurrentMultiplier(m);

      // Step 1: highlight for-line (check condition)
      setHighlightLine(3);
      setCodeStep('check');

      // Step 2: highlight printf (body)
      const c1 = scaledTimeout(() => {
        setHighlightLine(4);
        setCodeStep('body');
        setSpark(true);

        const c2 = scaledTimeout(() => {
          setSpark(false);
          setProducts(prev => [...prev, { m, p: BASE * m }]);

          // Step 3: highlight for-line again (i++ update)
          setHighlightLine(3);
          setCodeStep('update');
        }, 500);
        return c2;
      }, 600);

      return c1;
    }, 1400);

    return () => cancelTimer();
  }, [currentMultiplier, scaledTimeout]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-8 px-6 max-w-6xl w-full">
        {/* Left — Assembly line + table */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <motion.h2
            className="font-display text-xl md:text-2xl"
            style={{ color: '#FFD700' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            The Multiplication Factory
          </motion.h2>

          {/* Assembly line */}
          <div className="flex items-center gap-4">
            <GlowBox color="#00BFFF" intensity={0.5}>
              <span className="font-code text-3xl font-bold" style={{ color: '#00BFFF' }}>{BASE}</span>
            </GlowBox>

            <motion.span className="text-2xl text-dim font-code">&times;</motion.span>

            {/* Incoming multiplier */}
            <div className="relative w-20 h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentMultiplier > 0 && currentMultiplier <= 10 && (
                  <motion.div
                    key={currentMultiplier}
                    className="absolute"
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -80, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5 }}
                  >
                    <GlowBox color="#F59E0B" intensity={0.4}>
                      <span className="font-code text-2xl font-bold" style={{ color: '#F59E0B' }}>{currentMultiplier}</span>
                    </GlowBox>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.span className="text-2xl text-dim font-code">=</motion.span>

            {/* Spark & product */}
            <div className="relative w-20 h-16 flex items-center justify-center">
              {spark && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <motion.div
                      key={deg}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FFD700' }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((deg * Math.PI) / 180) * 25,
                        y: Math.sin((deg * Math.PI) / 180) * 25,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  ))}
                </motion.div>
              )}
              <AnimatePresence mode="wait">
                {products.length > 0 && (
                  <motion.div
                    key={products[products.length - 1].p}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <GlowBox color="#22C55E" intensity={0.4}>
                      <span className="font-code text-2xl font-bold" style={{ color: '#22C55E' }}>
                        {products[products.length - 1].p}
                      </span>
                    </GlowBox>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Conveyor belt */}
          <div className="w-full max-w-md h-4 rounded bg-surface border border-white/10 overflow-hidden">
            <motion.div
              className="flex gap-2 h-full items-center px-2"
              animate={{ x: [0, -16] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-3 h-0.5 bg-dim/30 flex-shrink-0" />
              ))}
            </motion.div>
          </div>

          {/* Multiplication table */}
          <div
            className="rounded-lg p-4 w-full max-w-md"
            style={{ background: 'rgba(17,22,51,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <div className="text-xs font-code text-dim mb-2 text-center">Multiplication Table of {BASE}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {products.map((p, i) => (
                <motion.div
                  key={i}
                  className="flex justify-between font-code text-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <span className="text-dim">{BASE} × {p.m}</span>
                  <span className="text-dim">=</span>
                  <span style={{ color: '#22C55E' }}>{p.p}</span>
                </motion.div>
              ))}
              {products.length === 0 && (
                <div className="text-dim text-xs text-center py-4 col-span-2">Building...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Code panel with flow */}
        <motion.div
          className="w-80 flex-shrink-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
              <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
              <span className="text-xs text-dim ml-2 font-code">multiply.c</span>
            </div>

            {/* Code lines */}
            <div className="px-3 py-3 font-code text-xs leading-relaxed">
              {CODE_LINES.map((line, i) => {
                const isHighlighted = highlightLine === i;
                const isPast = highlightLine > i && highlightLine !== -1;

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-1.5 py-0.5 rounded transition-colors duration-300"
                    style={{
                      background: isHighlighted ? 'rgba(255,215,0,0.1)' : 'transparent',
                      borderLeft: isHighlighted ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    }}
                    animate={{ opacity: isPast ? 0.4 : 1 }}
                  >
                    <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                      {line.colored && line.colored.length > 0 ? (
                        line.colored.map((seg, j) => (
                          <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                        ))
                      ) : (
                        <span>&nbsp;</span>
                      )}
                    </span>
                    {isHighlighted && (
                      <motion.span
                        className="text-[10px] font-bold flex-shrink-0 text-gold"
                        initial={{ opacity: 0, x: -3 }}
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
              key={`${codeStep}-${currentMultiplier}`}
              className="mt-3 text-center text-xs font-body text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              {codeStep === 'init' && 'Starting loop...'}
              {codeStep === 'check' && `Checking: i(${currentMultiplier}) <= 10? ${currentMultiplier <= 10 ? 'YES' : 'NO'}`}
              {codeStep === 'body' && `printf("${BASE} x %d = %d", ${currentMultiplier}, ${BASE * currentMultiplier})`}
              {codeStep === 'update' && `i++ → i = ${currentMultiplier + 1}`}
              {codeStep === 'done' && 'Loop complete — returning 0.'}
            </motion.div>
          </AnimatePresence>

          {/* Live output */}
          <div
            className="mt-4 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30">
              <span className="text-[10px] text-dim font-code">output</span>
            </div>
            <div className="px-3 py-2 font-code text-xs max-h-28 overflow-y-auto">
              {products.length === 0 && <span className="text-dim/40">waiting...</span>}
              {products.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green"
                >
                  {BASE} x {p.m} = {p.p}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
