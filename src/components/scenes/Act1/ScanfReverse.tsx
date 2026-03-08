'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConveyorBelt from '@/components/shared/ConveyorBelt';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useTypewriter } from '@/components/hooks/useTypewriter';

export default function ScanfReverse() {
  const [phase, setPhase] = useState(0);
  // 0: conveyor + scanf label, 1: prompt prints, 2: keyboard types,
  // 3: blue particle travels, 4: address zoom, 5: value drops in box

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4200),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 6500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const typedValue = useTypewriter({
    text: '21',
    speed: 300,
    delay: phase >= 2 ? 0 : 99999,
    onComplete: () => {},
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void gap-6">
      {/* scanf label with microphone */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="px-5 py-2 rounded-lg border-2 border-blue/50 font-code text-xl text-blue flex items-center gap-2"
          style={{ background: 'rgba(0,191,255,0.08)', boxShadow: '0 0 25px var(--glow-blue)' }}
        >
          {/* Microphone icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
          scanf
        </motion.div>
        <motion.span
          className="text-dim text-sm font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5 }}
        >
          reads from the keyboard
        </motion.span>
      </motion.div>

      {/* Reversed conveyor belt */}
      <motion.div
        className="w-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ConveyorBelt
          items={[
            { id: 'prompt', content: <span className="text-dim">Enter age:</span> },
            {
              id: 'value',
              content: phase >= 5 ? (
                <span className="text-blue font-bold">21</span>
              ) : (
                ''
              ),
              slot: phase < 5,
            },
          ]}
          direction="left"
          speed={1.5}
        />
      </motion.div>

      {/* Main visualization area */}
      <div className="flex items-start gap-12 mt-4">
        {/* Terminal with prompt */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Terminal title="input" showCursor={phase < 3} width="w-64">
            {phase >= 1 && (
              <div className="text-dim text-sm">
                <span className="text-green">Enter your age: </span>
                {phase >= 2 && (
                  <span className="text-primary">
                    {typedValue.displayText}
                    {!typedValue.isComplete && (
                      <span className="inline-block w-1.5 h-3 bg-primary cursor-blink ml-0.5" />
                    )}
                  </span>
                )}
              </div>
            )}
          </Terminal>

          {/* Keyboard hint */}
          {phase >= 2 && (
            <motion.div
              className="mt-3 flex justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {['2', '1', 'Enter'].map((key, i) => (
                <motion.div
                  key={key}
                  className="px-2 py-1 rounded border border-white/20 text-xs font-code text-dim bg-surface"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: phase >= 2 ? 1 : 0 }}
                  transition={{ delay: i * 0.4 }}
                >
                  {key}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Blue particle traveling */}
        {phase === 3 && (
          <motion.div
            className="absolute w-4 h-4 rounded-full z-20"
            style={{
              background: 'var(--accent-blue)',
              boxShadow: '0 0 12px var(--accent-blue), 0 0 24px var(--accent-blue)',
            }}
            initial={{ left: '30%', top: '55%' }}
            animate={{ left: '62%', top: '52%' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* Variable box with address */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Address label */}
          <motion.div
            className="font-code text-xs text-purple px-2 py-0.5 rounded border border-purple/30"
            style={{ background: 'rgba(139,92,246,0.1)' }}
            animate={
              phase === 4
                ? { scale: [1, 1.8, 1], transition: { duration: 0.8 } }
                : {}
            }
          >
            0x7FFF
          </motion.div>

          {/* Variable box */}
          <motion.div
            className="w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 relative"
            style={{
              borderColor: phase >= 5 ? 'var(--accent-green)' : 'var(--accent-blue)',
              background: phase >= 5 ? 'rgba(34,197,94,0.1)' : 'rgba(0,191,255,0.05)',
              boxShadow: phase >= 5 ? '0 0 20px var(--glow-green)' : '0 0 10px var(--glow-blue)',
            }}
            animate={phase === 5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {phase >= 5 ? (
              <motion.span
                className="font-code text-2xl text-green"
                initial={{ scale: 2, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                21
              </motion.span>
            ) : (
              <span className="text-dim text-xs">empty</span>
            )}
          </motion.div>

          <span className="font-code text-sm text-dim">age</span>

          {/* & symbol zoom moment */}
          <AnimatePresence>
            {phase === 4 && (
              <motion.div
                className="absolute -top-8 font-code text-4xl text-amber font-bold"
                style={{ textShadow: '0 0 20px var(--glow-amber)' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 1.2], opacity: [0, 1, 1] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                &amp;
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Explanation of & */}
      {phase >= 4 && (
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-amber font-code text-sm">
            &amp;age = &quot;the <em>address</em> of age&quot;
          </p>
          <p className="text-dim text-xs font-body mt-1">
            scanf needs to know <em>where</em> to put the value, not the value itself
          </p>
        </motion.div>
      )}

      {/* Code snippet at bottom */}
      <motion.div
        className="font-code text-xs text-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        scanf(<span className="text-gold">&quot;%d&quot;</span>, <span className="text-amber">&amp;</span><span className="text-green">age</span>);
      </motion.div>

      {phase >= 5 && (
        <Narration text="scanf is the reverse of printf -- it listens, reads, and stores the answer in a variable's address." />
      )}
    </div>
  );
}
