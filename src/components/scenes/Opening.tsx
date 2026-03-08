'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useTypewriter } from '@/components/hooks/useTypewriter';
import { useAppStore } from '@/lib/store';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

export default function Opening() {
  const [phase, setPhase] = useState(0);
  const nextScene = useAppStore((s) => s.nextScene);
  const { scaledTimeout } = useAnimationSpeed();

  // Phase 0: black, Phase 1: cursor, Phase 2: "Hello?", Phase 3: "Is anyone there?",
  // Phase 4: zoom out, Phase 5: narration, Phase 6: title, Phase 7: subtitle

  useEffect(() => {
    const c1 = scaledTimeout(() => setPhase(1), 1000);
    const c2 = scaledTimeout(() => setPhase(2), 2000);
    return () => { c1(); c2(); };
  }, [scaledTimeout]);

  const hello = useTypewriter({
    text: 'Hello?',
    speed: 200,
    delay: 0,
    onComplete: () => scaledTimeout(() => setPhase(3), 600),
  });

  const question = useTypewriter({
    text: 'Is anyone there?',
    speed: 150,
    delay: 0,
    onComplete: () => scaledTimeout(() => setPhase(4), 1200),
  });

  useEffect(() => {
    if (phase === 4) {
      return scaledTimeout(() => setPhase(5), 1500);
    }
    if (phase === 5) {
      return scaledTimeout(() => setPhase(6), 2000);
    }
    if (phase === 6) {
      return scaledTimeout(() => setPhase(7), 1500);
    }
  }, [phase, scaledTimeout]);

  const titleText = 'THE MACHINE THAT LISTENS';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void">
      {/* Phases 1-3: raw text in center before zoom out */}
      <AnimatePresence>
        {phase >= 1 && phase < 4 && (
          <motion.div
            className="flex flex-col items-start font-code text-lg"
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
          >
            {phase < 2 && (
              <span className="inline-block w-2.5 h-5 bg-green cursor-blink" />
            )}
            {phase >= 2 && (
              <span className="text-green">
                {hello.displayText}
                {!hello.isComplete && (
                  <span className="inline-block w-2.5 h-5 bg-green cursor-blink align-middle ml-0.5" />
                )}
              </span>
            )}
            {phase >= 3 && (
              <span className="text-dim mt-2">
                {question.displayText}
                {!question.isComplete && (
                  <span className="inline-block w-2.5 h-5 bg-dim cursor-blink align-middle ml-0.5" />
                )}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4+: Terminal zooms in from tiny center */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Terminal title="the_machine" showCursor={false} width="w-full max-w-md">
              <div className="text-green">Hello?</div>
              <div className="text-dim mt-1">Is anyone there?</div>
              <span className="inline-block w-2.5 h-5 bg-dim cursor-blink mt-2" />
            </Terminal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 5: Narration */}
      {phase >= 5 && (
        <Narration
          text="Every program ever written... starts with a question."
          delay={0}
          className="bottom-32"
        />
      )}

      {/* Phase 6: Title drops in letter by letter */}
      {phase >= 6 && (
        <motion.div
          className="absolute top-[15%] flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex gap-[2px] font-display text-3xl md:text-5xl tracking-wider">
            {titleText.split('').map((char, i) => (
              <motion.span
                key={i}
                className={char === ' ' ? 'w-3' : 'text-glow-gold'}
                style={{ color: 'var(--accent-gold)' }}
                initial={{ opacity: 0, y: -80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: i * 0.05,
                }}
              >
                {char === ' ' ? '' : char}
              </motion.span>
            ))}
          </div>

          {/* Phase 7: Subtitle */}
          {phase >= 7 && (
            <motion.p
              className="text-dim font-body text-sm md:text-base tracking-widest uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Console I/O &amp; Statements in C
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Pulsing advance indicator */}
      {phase >= 7 && (
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2 cursor-pointer"
          onClick={nextScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-dim/50 flex items-start justify-center p-1.5"
            whileHover={{ borderColor: 'var(--accent-gold)' }}
          >
            <motion.div
              className="w-1.5 h-2.5 rounded-full bg-dim"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <span className="text-dim text-xs font-body tracking-wider uppercase">scroll</span>
        </motion.div>
      )}
    </div>
  );
}
