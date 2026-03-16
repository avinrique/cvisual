'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';

const MAX_PHASE = 4;

const IF_ELSE_LINES = [
  'if (age >= 18) {',
  '  status = "Adult";',
  '} else {',
  '  status = "Minor";',
  '}',
];

const NARRATIONS = [
  'You already know if/else. Sometimes it\'s a lot of code for a simple choice.',
  'The ternary operator is if/else in one line.',
  'The ? asks the question. The : separates the two answers.',
  'Same logic, less typing. Use it when the choice is simple.',
  'But don\'t nest them. Readability matters more than cleverness.',
];

export default function TernaryExpress() {
  const [phase, setPhase] = useState(0);
  const [age, setAge] = useState(25);

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

  const isAdult = age >= 18;
  const result = isAdult ? 'Adult' : 'Minor';

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0a0c18 0%, #101428 50%, #0a0c18 100%)' }}
    >
      <div className="flex flex-col items-center gap-6 max-w-4xl w-full px-6">

        {/* Phase 0: If/else block taking 5 lines */}
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="phase0"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(17, 22, 51, 0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">verbose.c</span>
                </div>
                <div className="px-4 py-3 font-code text-sm leading-relaxed">
                  {IF_ELSE_LINES.map((line, i) => (
                    <motion.div
                      key={i}
                      className="whitespace-pre"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <span className="text-dim/30 text-[10px] w-4 inline-block text-right mr-3 select-none">
                        {i + 1}
                      </span>
                      <span style={{
                        color: line.includes('if') || line.includes('else')
                          ? 'var(--accent-purple, #8B5CF6)'
                          : line.includes('"')
                          ? 'var(--accent-green, #22C55E)'
                          : 'rgba(255,255,255,0.7)',
                      }}>
                        {line}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                className="font-display text-lg font-bold text-amber"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                5 lines.
              </motion.div>
            </motion.div>
          )}

          {/* Phase 1: Compress into 1 ternary line */}
          {phase === 1 && (
            <motion.div
              key="phase1"
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Compressed lines shrinking away */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(17, 22, 51, 0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">concise.c</span>
                </div>
                <div className="px-4 py-3 font-code text-sm leading-relaxed">
                  {/* Old lines squeezing out */}
                  {IF_ELSE_LINES.map((line, i) => (
                    <motion.div
                      key={`old-${i}`}
                      className="whitespace-pre overflow-hidden"
                      initial={{ height: 'auto', opacity: 0.6 }}
                      animate={{ height: 0, opacity: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <span className="text-dim/40 text-xs">{line}</span>
                    </motion.div>
                  ))}

                  {/* New ternary line appearing */}
                  <motion.div
                    className="whitespace-pre py-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <span className="text-dim/30 text-[10px] w-4 inline-block text-right mr-3 select-none">
                      1
                    </span>
                    <span style={{ color: 'var(--accent-blue, #06B6D4)' }}>char</span>
                    <span className="text-dim"> *status = </span>
                    <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>(age {'>'}= 18)</span>
                    <span style={{ color: '#FFD700' }}> ? </span>
                    <span style={{ color: 'var(--accent-green, #22C55E)' }}>&quot;Adult&quot;</span>
                    <span style={{ color: '#FFD700' }}> : </span>
                    <span style={{ color: 'var(--accent-green, #22C55E)' }}>&quot;Minor&quot;</span>
                    <span className="text-dim">;</span>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="font-display text-lg font-bold"
                style={{ color: '#22C55E' }}
                initial={{ opacity: 0, scale: 1.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                1 line.
              </motion.div>

              {/* GlowBox labeling parts */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <GlowBox color="#06B6D4" intensity={0.3}>
                  <div className="font-code text-sm flex items-center gap-2">
                    <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>condition</span>
                    <span style={{ color: '#FFD700' }}>?</span>
                    <span style={{ color: 'var(--accent-green, #22C55E)' }}>if_true</span>
                    <span style={{ color: '#FFD700' }}>:</span>
                    <span style={{ color: '#EF4444' }}>if_false</span>
                  </div>
                </GlowBox>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 2: Interactive age slider */}
          {phase === 2 && (
            <motion.div
              key="phase2"
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Ternary expression with live evaluation */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(17, 22, 51, 0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">ternary.c</span>
                </div>
                <div className="px-4 py-4 font-code text-base leading-relaxed">
                  <span style={{ color: 'var(--accent-blue, #06B6D4)' }}>char</span>
                  <span className="text-dim"> *status = </span>

                  {/* Condition */}
                  <motion.span
                    style={{
                      color: 'var(--accent-purple, #8B5CF6)',
                      background: 'rgba(139,92,246,0.1)',
                      padding: '1px 4px',
                      borderRadius: '4px',
                    }}
                  >
                    ({age} {'>'}= 18)
                  </motion.span>

                  {/* Question mark */}
                  <motion.span
                    style={{ color: '#FFD700', fontWeight: 'bold' }}
                    animate={{
                      textShadow: ['0 0 4px #FFD700', '0 0 16px #FFD700', '0 0 4px #FFD700'],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {' ? '}
                  </motion.span>

                  {/* True value */}
                  <motion.span
                    animate={{ opacity: isAdult ? 1 : 0.3, scale: isAdult ? 1.05 : 0.95 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      color: 'var(--accent-green, #22C55E)',
                      background: isAdult ? 'rgba(34,197,94,0.15)' : 'transparent',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontWeight: isAdult ? 'bold' : 'normal',
                    }}
                  >
                    &quot;Adult&quot;
                  </motion.span>

                  {/* Colon */}
                  <motion.span
                    style={{ color: '#FFD700', fontWeight: 'bold' }}
                    animate={{
                      textShadow: ['0 0 4px #FFD700', '0 0 16px #FFD700', '0 0 4px #FFD700'],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {' : '}
                  </motion.span>

                  {/* False value */}
                  <motion.span
                    animate={{ opacity: !isAdult ? 1 : 0.3, scale: !isAdult ? 1.05 : 0.95 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      color: '#F59E0B',
                      background: !isAdult ? 'rgba(245,158,11,0.15)' : 'transparent',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontWeight: !isAdult ? 'bold' : 'normal',
                    }}
                  >
                    &quot;Minor&quot;
                  </motion.span>

                  <span className="text-dim">;</span>
                </div>
              </div>

              {/* Condition result badge */}
              <motion.span
                key={`${isAdult}`}
                className="font-code text-xs px-3 py-1 rounded"
                style={{
                  background: isAdult ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                  color: isAdult ? '#22C55E' : '#F59E0B',
                  border: `1px solid ${isAdult ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                ({age} {'>'}= 18) is {isAdult ? 'TRUE' : 'FALSE'} — status = &quot;{result}&quot;
              </motion.span>

              {/* Age slider */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="font-code text-sm text-dim">age =</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value))}
                  className="w-48 accent-blue-500"
                />
                <motion.span
                  key={age}
                  className="font-display text-2xl font-bold w-12 text-center"
                  style={{ color: isAdult ? '#22C55E' : '#F59E0B' }}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                >
                  {age}
                </motion.span>
              </motion.div>

              <InteractiveIndicator />
            </motion.div>
          )}

          {/* Phase 3: Side-by-side comparison */}
          {phase === 3 && (
            <motion.div
              key="phase3"
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-6">
                {/* Left: if/else */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className="rounded-lg overflow-hidden w-72"
                    style={{
                      background: 'rgba(17, 22, 51, 0.95)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                      <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                      <span className="text-xs text-dim ml-2 font-code">if_else.c</span>
                    </div>
                    <div className="px-3 py-3 font-code text-xs leading-relaxed">
                      {[
                        { text: `if (${age} >= 18) {`, highlight: false },
                        { text: `  status = "Adult";`, highlight: isAdult },
                        { text: '} else {', highlight: false },
                        { text: '  status = "Minor";', highlight: !isAdult },
                        { text: '}', highlight: false },
                      ].map((line, i) => (
                        <motion.div
                          key={i}
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            background: line.highlight
                              ? isAdult ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'
                              : 'transparent',
                            borderLeft: line.highlight
                              ? `3px solid ${isAdult ? '#22C55E' : '#F59E0B'}`
                              : '3px solid transparent',
                          }}
                          animate={{ opacity: line.highlight ? 1 : 0.5 }}
                        >
                          <span style={{
                            color: line.highlight
                              ? (isAdult ? '#22C55E' : '#F59E0B')
                              : 'rgba(255,255,255,0.6)',
                            fontWeight: line.highlight ? 600 : 400,
                          }}>
                            {line.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="px-3 py-2 border-t border-white/5">
                      <span className="font-code text-xs text-dim">result: </span>
                      <motion.span
                        key={`ifelse-${result}`}
                        className="font-code text-xs font-bold"
                        style={{ color: isAdult ? '#22C55E' : '#F59E0B' }}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                      >
                        &quot;{result}&quot;
                      </motion.span>
                    </div>
                  </div>
                </motion.div>

                {/* Equals sign */}
                <motion.div
                  className="flex items-center h-full mt-16"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <span className="font-display text-2xl font-bold text-gold">=</span>
                </motion.div>

                {/* Right: ternary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className="rounded-lg overflow-hidden w-72"
                    style={{
                      background: 'rgba(17, 22, 51, 0.95)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                      <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                      <span className="text-xs text-dim ml-2 font-code">ternary.c</span>
                    </div>
                    <div className="px-3 py-3 font-code text-xs leading-relaxed">
                      <div
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          background: isAdult ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                          borderLeft: `3px solid ${isAdult ? '#22C55E' : '#F59E0B'}`,
                        }}
                      >
                        <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>({age} {'>'}= 18)</span>
                        <span style={{ color: '#FFD700' }}> ? </span>
                        <motion.span
                          animate={{ opacity: isAdult ? 1 : 0.3 }}
                          style={{ color: 'var(--accent-green, #22C55E)', fontWeight: isAdult ? 600 : 400 }}
                        >
                          &quot;Adult&quot;
                        </motion.span>
                        <span style={{ color: '#FFD700' }}> : </span>
                        <motion.span
                          animate={{ opacity: !isAdult ? 1 : 0.3 }}
                          style={{ color: '#F59E0B', fontWeight: !isAdult ? 600 : 400 }}
                        >
                          &quot;Minor&quot;
                        </motion.span>
                      </div>
                    </div>

                    <div className="px-3 py-2 border-t border-white/5">
                      <span className="font-code text-xs text-dim">result: </span>
                      <motion.span
                        key={`ternary-${result}`}
                        className="font-code text-xs font-bold"
                        style={{ color: isAdult ? '#22C55E' : '#F59E0B' }}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                      >
                        &quot;{result}&quot;
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Age slider */}
              <motion.div
                className="flex items-center gap-4 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="font-code text-sm text-dim">age =</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value))}
                  className="w-48 accent-blue-500"
                />
                <motion.span
                  key={age}
                  className="font-display text-2xl font-bold w-12 text-center"
                  style={{ color: isAdult ? '#22C55E' : '#F59E0B' }}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                >
                  {age}
                </motion.span>
              </motion.div>

              <InteractiveIndicator />
            </motion.div>
          )}

          {/* Phase 4: Nested ternary warning */}
          {phase === 4 && (
            <motion.div
              key="phase4"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded-lg overflow-hidden relative"
                style={{
                  background: 'rgba(17, 22, 51, 0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.2)',
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">dont_do_this.c</span>
                </div>
                <div className="px-4 py-4 font-code text-sm leading-relaxed">
                  <span className="text-dim">result = </span>
                  <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>a</span>
                  <span style={{ color: '#FFD700' }}> ? </span>
                  <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>b</span>
                  <span style={{ color: '#FFD700' }}> ? </span>
                  <span style={{ color: 'var(--accent-green, #22C55E)' }}>c</span>
                  <span style={{ color: '#FFD700' }}> : </span>
                  <span style={{ color: '#F59E0B' }}>d</span>
                  <span style={{ color: '#FFD700' }}> : </span>
                  <span style={{ color: '#EF4444' }}>e</span>
                  <span className="text-dim">;</span>
                </div>

                {/* Red X overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                >
                  <span
                    className="font-display font-bold"
                    style={{
                      fontSize: '120px',
                      color: 'rgba(239, 68, 68, 0.3)',
                      lineHeight: 1,
                    }}
                  >
                    X
                  </span>
                </motion.div>
              </div>

              {/* Warning label */}
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="font-code text-sm" style={{ color: '#EF4444' }}>
                  WARNING: Nested ternaries are unreadable
                </span>
              </motion.div>

              {/* BitCharacter confused */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <BitCharacter mood="scared" size={45} color="#EF4444" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Narration text={NARRATIONS[phase]} delay={0.5} />
    </div>
  );
}
