'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import { useAppStore } from '@/lib/store';

const VIGNETTES = [
  { label: 'Linux Terminal', icon: '$_', color: 'var(--accent-green)', from: { x: -350, y: -180 } },
  { label: 'ATM Machine', icon: '[$]', color: 'var(--accent-gold)', from: { x: 350, y: -180 } },
  { label: 'Chatbot', icon: '<>', color: 'var(--accent-blue)', from: { x: -350, y: 180 } },
  { label: 'CMD / PowerShell', icon: 'C:\\>', color: 'var(--accent-purple)', from: { x: 350, y: 180 } },
];

// Steps:
// 0 — Terminal appears (empty prompt)
// 1 — #include <stdio.h>
// 2 — int main() {
// 3 — printf("Hello, World!");  }
// 4 — Linux Terminal vignette
// 5 — + ATM Machine
// 6 — + Chatbot
// 7 — + CMD / PowerShell
// 8 — Vignettes collapse → CONSOLE text

const NARRATIONS = [
  "Where does printf actually send text? To the console.",
  "First, we include the standard I/O library.",
  "Then we write the main function — the entry point of every C program.",
  "printf sends text to the console. This is the output.",
  "You've seen it before — the terminal on Linux...",
  "Even an ATM is a console — input and output, text on a screen.",
  "A chatbot? That's a console too.",
  "CMD, PowerShell — all consoles. All text-based interfaces.",
  "The console is the simplest, most universal interface between human and machine.",
];

export default function ConsoleExplained() {
  const [phase, setPhase] = useState(0);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 8) return false;
    setPhase(prev => prev + 1);
    return true;
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    return () => setSceneStepHandler(null);
  }, [setSceneStepHandler, stableStepHandler]);

  const showingCode = phase >= 0 && phase <= 3;
  const showingVignettes = phase >= 4 && phase < 8;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Top narration — big for projector */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          className="absolute top-10 left-0 right-0 text-center text-2xl md:text-4xl font-body text-primary/90 px-8 z-20 leading-snug"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
        >
          {NARRATIONS[phase]}
        </motion.p>
      </AnimatePresence>

      {/* Terminal with C code that builds up step by step */}
      <motion.div
        className="absolute z-0"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: showingCode ? 1 : showingVignettes ? 0.6 : 0.4,
          opacity: showingCode ? 1 : 0.15,
        }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Terminal title="hello.c" showCursor={phase <= 3} width="w-[620px]">
          <div className="font-code text-base md:text-lg space-y-1 min-h-[160px] leading-relaxed">
            {phase >= 1 && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-blue">#include</span>{' '}
                <span className="text-green">&lt;stdio.h&gt;</span>
              </motion.p>
            )}
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="mt-2">
                  <span className="text-blue">int</span>{' '}
                  <span className="text-gold">main</span>
                  <span className="text-dim">() {'{'}</span>
                </p>
              </motion.div>
            )}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="ml-6">
                  <span className="text-gold">printf</span>
                  <span className="text-dim">(</span>
                  <span className="text-green">&quot;Hello, World!&quot;</span>
                  <span className="text-dim">);</span>
                </p>
                <p className="text-dim">{'}'}</p>
              </motion.div>
            )}
            {phase === 0 && (
              <p className="text-dim">
                <span className="text-green">$</span> _
              </p>
            )}
          </div>
        </Terminal>
      </motion.div>

      {/* Blur overlay on terminal when vignettes are active */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={{
          backdropFilter: showingVignettes ? 'blur(4px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Four vignettes — revealed one at a time, BIGGER for projector */}
      <AnimatePresence>
        {showingVignettes && (
          <>
            {VIGNETTES.map((v, i) => (
              phase >= i + 4 && (
                <motion.div
                  key={v.label}
                  className="absolute flex flex-col items-center gap-3 z-10"
                  initial={{ x: v.from.x, y: v.from.y, opacity: 0, scale: 0.5 }}
                  animate={{
                    x: v.from.x * 0.5,
                    y: v.from.y * 0.5,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="w-48 h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2"
                    style={{
                      borderColor: `${v.color}60`,
                      background: 'rgba(17,22,51,0.95)',
                      boxShadow: `0 0 30px ${v.color}40`,
                    }}
                  >
                    {/* Mini terminal header */}
                    <div className="flex gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red/60" />
                      <div className="w-2 h-2 rounded-full bg-amber/60" />
                      <div className="w-2 h-2 rounded-full bg-green/60" />
                    </div>
                    <span className="font-code text-2xl" style={{ color: v.color }}>
                      {v.icon}
                    </span>
                  </div>
                  <span
                    className="text-sm md:text-base font-display tracking-wider"
                    style={{ color: v.color }}
                  >
                    {v.label}
                  </span>
                </motion.div>
              )
            ))}
          </>
        )}
      </AnimatePresence>

      {/* CONSOLE text */}
      {phase >= 8 && (
        <motion.div
          className="flex flex-col items-center gap-6 z-10"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 15 }}
        >
          <div className="flex gap-2">
            {'CONSOLE'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="font-display text-6xl md:text-8xl tracking-wider text-primary"
                style={{ textShadow: '0 0 30px rgba(232,236,244,0.4)' }}
                initial={{ opacity: 0, y: 50, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 12,
                  delay: i * 0.08,
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          <motion.p
            className="text-dim font-body text-2xl md:text-3xl max-w-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            A text-based window where programs talk to humans.
            <br />
            <span className="text-primary/70">printf writes to it. scanf reads from it.</span>
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
