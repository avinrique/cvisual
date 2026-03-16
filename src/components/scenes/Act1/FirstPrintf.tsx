'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeTyper from '@/components/shared/CodeTyper';
import Terminal from '@/components/shared/Terminal';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

const HELLO_WORLD_CODE = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;

// Phase 0: code auto-types (no arrow keys until done)
// Phase 1: highlight #include + narration about stdio.h + tooltip
// Phase 2: highlight int main() + narration
// Phase 3: highlight printf + glow + narration
// Phase 4: text flies to terminal + final narration

const NARRATIONS: Record<number, string> = {
  0: "Let's see what that looks like in real C code...",
  1: 'First, we import the tools we need — stdio.h gives us printf.',
  2: 'Every C program starts here — inside main.',
  3: 'printf sends text from our code to the screen.',
  4: "printf is C's megaphone — it shouts to the console whatever you put inside those quotes.",
};

export default function FirstPrintf() {
  const [phase, setPhase] = useState(0);
  const [codeComplete, setCodeComplete] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [braceOpen, setBraceOpen] = useState(false);
  const [printfGlow, setPrintfGlow] = useState(false);
  const [textFlying, setTextFlying] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [showNewline, setShowNewline] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<number[]>([]);
  const { scaledTimeout } = useAnimationSpeed();
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const codeCompleteRef = useRef(codeComplete);
  codeCompleteRef.current = codeComplete;

  // Arrow key handler — if code is still typing, skip to end; otherwise advance phase
  const stableStepHandler = useCallback(() => {
    if (!codeCompleteRef.current) {
      setCodeComplete(true); // skip typing animation
      setPhase(1);           // jump to first explanation phase
      return true;
    }
    if (phaseRef.current >= 4) return false;   // let scene advance
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

  // When CodeTyper finishes, mark code as complete
  const handleCodeComplete = useCallback(() => {
    setCodeComplete(true);
  }, []);

  // Phase-based side effects (triggered by arrow keys after typing done)
  useEffect(() => {
    if (phase === 1) {
      setTooltip('stdio.h = Standard Input/Output library. Gives us printf and scanf.');
      const cancelTooltip = scaledTimeout(() => setTooltip(null), 3000);
      setActiveHighlight([0]);
      return cancelTooltip;
    }
    if (phase === 2) {
      setActiveHighlight([2]);
      setBraceOpen(true);
    }
    if (phase === 3) {
      setActiveHighlight([3]);
      setPrintfGlow(true);
    }
    if (phase === 4) {
      setTextFlying(true);
      const cancelFlying = scaledTimeout(() => {
        setTerminalText('Hello, World!');
        setTextFlying(false);
        setShowNewline(true);
      }, 1500);
      return cancelFlying;
    }
  }, [phase, scaledTimeout]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-8 md:gap-16 px-8 max-w-5xl w-full">
        {/* Code editor side */}
        <div className="flex-1 relative">
          <CodeTyper
            code={HELLO_WORLD_CODE}
            language="c"
            speed={80}
            delay={1500}
            onComplete={handleCodeComplete}
            highlightLines={activeHighlight}
            className="text-base"
            skipAnimation={codeComplete}
          />

          {/* stdio.h tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                className="absolute -top-2 left-0 right-0 px-4 py-2 rounded-lg border border-blue/30 text-xs font-body text-blue bg-void/90 z-10"
                style={{ boxShadow: '0 0 15px var(--glow-blue)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -40 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.4 }}
              >
                {tooltip}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brace animation overlay */}
          {braceOpen && (
            <motion.div
              className="absolute top-[88px] left-[108px] text-primary font-code text-base origin-left pointer-events-none"
              initial={{ rotateZ: -90, opacity: 0.5 }}
              animate={{ rotateZ: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            />
          )}

          {/* Printf glow + megaphone */}
          {printfGlow && (
            <motion.div
              className="absolute top-[110px] left-[60px] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="flex items-center gap-1"
                animate={{
                  filter: [
                    'drop-shadow(0 0 5px #FFD700)',
                    'drop-shadow(0 0 15px #FFD700)',
                    'drop-shadow(0 0 5px #FFD700)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                  <path d="M12 6v12M6 12l6-6 6 6" />
                  <path d="M2 16l4-4 4 4M14 16l4-4 4 4" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Golden path + flying text */}
        {textFlying && (
          <motion.div
            className="absolute font-code text-lg z-20"
            style={{
              color: 'var(--accent-gold)',
              textShadow: '0 0 15px var(--glow-gold)',
            }}
            initial={{ left: '35%', top: '45%', opacity: 1, scale: 1 }}
            animate={{ left: '62%', top: '42%', opacity: 1, scale: 0.9 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            &quot;Hello, World!&quot;
            {/* Golden trail */}
            <motion.div
              className="absolute -z-10 inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
                filter: 'blur(8px)',
              }}
              animate={{ scaleX: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Terminal side */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Terminal title="output" showCursor={terminalText.length > 0}>
            {terminalText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green font-code"
              >
                {terminalText}
              </motion.div>
            )}
            {showNewline && (
              <motion.div
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="flex items-center gap-1 text-amber text-xs font-code border border-amber/30 rounded px-2 py-0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.8 }}
                >
                  <span>\n</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2">
                    <path d="M17 6v6H5M5 12l4-4M5 12l4 4" />
                  </svg>
                </motion.div>
                <span className="text-dim text-xs font-body">pushes cursor to next line</span>
              </motion.div>
            )}
          </Terminal>
        </div>
      </div>

      {/* Narration text — bigger for projector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="absolute top-12 left-0 right-0 flex justify-center px-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.p
            className="text-center text-2xl md:text-3xl font-body italic max-w-2xl leading-relaxed"
            style={{
              color: 'var(--accent-gold)',
              textShadow: '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
                '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.5)',
                '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            &ldquo;{NARRATIONS[phase]}&rdquo;
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
