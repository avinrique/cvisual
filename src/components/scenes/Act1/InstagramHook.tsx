'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/components/hooks/useTypewriter';
import { useAppStore } from '@/lib/store';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const PARTICLE_COUNT = 12;

export default function InstagramHook() {
  const [phase, setPhase] = useState(0);
  const showPipelineHUD = useAppStore((s) => s.showPipelineHUD);
  const { scaledTimeout } = useAnimationSpeed();

  // Phase 0: phone appears, 1: typing username, 2: particles lift off,
  // 3: particles travel to PROGRAM box, 4: "Welcome back" emerges,
  // 5: three pipeline boxes, 6: boxes shrink + showPipelineHUD

  const username = useTypewriter({
    text: 'avin',
    speed: 180,
    delay: 1200,
    onComplete: () => scaledTimeout(() => setPhase(2), 800),
  });

  useEffect(() => {
    return scaledTimeout(() => setPhase(1), 500);
  }, [scaledTimeout]);

  useEffect(() => {
    if (phase === 2) return scaledTimeout(() => setPhase(3), 1200);
    if (phase === 3) return scaledTimeout(() => setPhase(4), 1500);
    if (phase === 4) return scaledTimeout(() => setPhase(5), 2000);
    if (phase === 5) {
      return scaledTimeout(() => {
        setPhase(6);
        showPipelineHUD();
      }, 3000);
    }
  }, [phase, showPipelineHUD, scaledTimeout]);

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    startX: -200 + Math.random() * 30 - 15,
    startY: 0,
    endX: 200,
    endY: Math.random() * 60 - 30,
    delay: i * 0.08,
  }));

  const pipelineBoxes = [
    { label: 'INPUT', color: 'var(--accent-blue)', shadow: 'var(--glow-blue)' },
    { label: 'PROCESS', color: 'var(--accent-amber)', shadow: 'var(--glow-amber)' },
    { label: 'OUTPUT', color: 'var(--accent-green)', shadow: 'var(--glow-green)' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Phone mockup - left side */}
      <AnimatePresence>
        {phase < 6 && (
          <motion.div
            className="absolute left-[15%] md:left-[25%]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: phase >= 2 ? 0.3 : 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            {/* Phone body */}
            <div
              className="w-56 h-96 rounded-3xl border-2 border-white/10 flex flex-col items-center justify-center p-6 relative"
              style={{ background: 'rgba(17,22,51,0.8)' }}
            >
              {/* Notch */}
              <div className="absolute top-3 w-20 h-5 rounded-full bg-black/50" />

              {/* App header */}
              <div className="text-dim text-xs font-display mb-6 tracking-wider">Instagram</div>

              {/* Login form */}
              <div className="w-full space-y-3">
                {/* Username field */}
                <div className="w-full h-9 rounded-md border border-white/15 bg-white/5 flex items-center px-3 relative overflow-hidden">
                  <span className="text-sm font-code text-green">
                    {phase >= 1 ? username.displayText : ''}
                  </span>
                  {phase >= 1 && !username.isComplete && (
                    <span className="inline-block w-1.5 h-4 bg-green cursor-blink ml-0.5" />
                  )}
                </div>

                {/* Password field */}
                <div className="w-full h-9 rounded-md border border-white/10 bg-white/5 flex items-center px-3">
                  <span className="text-dim text-xs">password</span>
                </div>

                {/* Login button */}
                <div className="w-full h-9 rounded-md bg-blue/20 flex items-center justify-center">
                  <span className="text-blue text-xs font-body">Log In</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glowing particles traveling from phone to program box */}
      {(phase === 2 || phase === 3) &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'var(--accent-blue)',
              boxShadow: '0 0 8px var(--accent-blue), 0 0 16px var(--accent-blue)',
            }}
            initial={{ x: p.startX, y: p.startY, opacity: 0, scale: 0 }}
            animate={{
              x: phase >= 3 ? p.endX : p.startX + 40,
              y: phase >= 3 ? p.endY : p.startY - 30 - Math.random() * 40,
              opacity: [0, 1, 1, phase >= 3 ? 0 : 1],
              scale: [0, 1.2, 1, phase >= 3 ? 0 : 1],
            }}
            transition={{
              duration: phase >= 3 ? 1.2 : 0.8,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* PROGRAM box - center right */}
      <AnimatePresence>
        {phase >= 3 && phase < 6 && (
          <motion.div
            className="absolute right-[15%] md:right-[25%] flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-48 h-32 rounded-xl border border-amber/30 flex flex-col items-center justify-center gap-2"
              style={{
                background: 'rgba(17,22,51,0.9)',
                boxShadow: '0 0 30px var(--glow-amber)',
              }}
            >
              <span className="text-amber font-display text-sm tracking-wider">PROGRAM</span>
              {/* Gear icon */}
              <motion.div
                className="text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </motion.div>
            </div>

            {/* Welcome message emerges */}
            {phase >= 4 && (
              <motion.div
                className="mt-4 px-4 py-2 rounded-lg border border-green/30 font-code text-green text-sm"
                style={{ boxShadow: '0 0 20px var(--glow-green)' }}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                Welcome back, Avin
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline boxes: INPUT -> PROCESS -> OUTPUT */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            className="flex items-center gap-3 md:gap-6"
            animate={phase >= 6 ? { scale: 0.6, y: -200, opacity: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {pipelineBoxes.map((box, i) => (
              <motion.div key={box.label} className="flex items-center gap-2 md:gap-4">
                <motion.div
                  className="px-5 py-3 rounded-lg border font-display text-sm tracking-wider text-center"
                  style={{
                    borderColor: box.color,
                    color: box.color,
                    boxShadow: `0 0 20px ${box.shadow}`,
                    background: 'rgba(17,22,51,0.9)',
                  }}
                  initial={{ opacity: 0, y: 60, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 18,
                    delay: i * 0.2,
                  }}
                >
                  {box.label}
                </motion.div>
                {i < 2 && (
                  <motion.span
                    className="text-dim text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.2 }}
                  >
                    &rarr;
                  </motion.span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration */}
      {phase >= 4 && phase < 5 && (
        <Narration text="Every app you use follows the same pattern: Input, Process, Output." />
      )}
    </div>
  );
}
