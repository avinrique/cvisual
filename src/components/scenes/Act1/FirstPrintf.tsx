'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeTyper from '@/components/shared/CodeTyper';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const HELLO_WORLD_CODE = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;

export default function FirstPrintf() {
  const [phase, setPhase] = useState(0);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [braceOpen, setBraceOpen] = useState(false);
  const [printfGlow, setPrintfGlow] = useState(false);
  const [textFlying, setTextFlying] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [showNewline, setShowNewline] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  // 0: code typing, follows line callbacks
  // line 0: #include done -> tooltip
  // line 2: { typed -> brace animation
  // line 3: printf -> glow + megaphone
  // after complete: text flies to terminal

  const handleLineComplete = useCallback((lineIndex: number) => {
    if (lineIndex === 0) {
      setTooltip('stdio.h = Standard Input/Output library. Gives us printf and scanf.');
      scaledTimeout(() => setTooltip(null), 3000);
    }
    if (lineIndex === 2) {
      setBraceOpen(true);
    }
    if (lineIndex === 3) {
      setPrintfGlow(true);
      scaledTimeout(() => {
        setTextFlying(true);
        scaledTimeout(() => {
          setTerminalText('Hello, World!');
          setTextFlying(false);
          setShowNewline(true);
          scaledTimeout(() => setPhase(1), 1500);
        }, 1500);
      }, 1000);
    }
  }, [scaledTimeout]);

  const handleCodeComplete = useCallback(() => {
    // code is done typing
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-8 md:gap-16 px-8 max-w-5xl w-full">
        {/* Code editor side */}
        <div className="flex-1 relative">
          <CodeTyper
            code={HELLO_WORLD_CODE}
            language="c"
            speed={50}
            delay={500}
            onLineComplete={handleLineComplete}
            onComplete={handleCodeComplete}
            highlightLines={printfGlow ? [3] : []}
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
              className="absolute top-[88px] left-[108px] text-primary font-code text-sm origin-left pointer-events-none"
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

      {phase >= 1 && (
        <Narration text="printf is C's megaphone -- it shouts to the console whatever you put inside those quotes." />
      )}
    </div>
  );
}
