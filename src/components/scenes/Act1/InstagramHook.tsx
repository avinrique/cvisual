'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/components/hooks/useTypewriter';
import { useAppStore } from '@/lib/store';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const PARTICLE_COUNT = 12;

export default function InstagramHook() {
  const [phase, setPhase] = useState(0);
  const [passwordDots, setPasswordDots] = useState('');
  const [loginPressed, setLoginPressed] = useState(false);
  const showPipelineHUD = useAppStore((s) => s.showPipelineHUD);
  const setSceneStepHandler = useAppStore((s) => s.setSceneStepHandler);
  const { scaledTimeout } = useAnimationSpeed();
  const passwordTimers = useRef<(() => void)[]>([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Phase 0: BIG narration text center screen — waits for arrow key
  // Phase 1: text shrinks + moves to bottom, phone fades in
  // Phase 2: typing username
  // Phase 3: typing password (dots)
  // Phase 4: login button press
  // Phase 5: particles lift off & travel to server
  // Phase 6: server appears & processes
  // Phase 7: output + phone shows logged-in state
  // Phase 8: all glow
  // Phase 9: exit + showPipelineHUD

  // Register step handler: intercept first arrow press when phase === 0
  const handleStep = useCallback(() => {
    if (phaseRef.current === 0) {
      setPhase(1);
      return true; // intercepted — don't navigate
    }
    return false; // let navigation happen
  }, []);

  useEffect(() => {
    setSceneStepHandler(handleStep);
    return () => setSceneStepHandler(null);
  }, [setSceneStepHandler, handleStep]);

  const username = useTypewriter({
    text: 'avin',
    speed: 180,
    delay: 300,
    enabled: phase >= 2, // only start typing once phone is visible
    onComplete: () => scaledTimeout(() => setPhase(3), 400),
  });

  // Phase 1 → 2: after text shrinks, start typing
  useEffect(() => {
    if (phase !== 1) return;
    return scaledTimeout(() => setPhase(2), 800);
  }, [phase, scaledTimeout]);

  // Password typing (phase 3)
  useEffect(() => {
    if (phase !== 3) return;
    const password = '••••••';
    const timers: (() => void)[] = [];
    for (let i = 0; i < password.length; i++) {
      timers.push(
        scaledTimeout(() => {
          setPasswordDots(password.slice(0, i + 1));
        }, i * 150)
      );
    }
    timers.push(scaledTimeout(() => setPhase(4), password.length * 150 + 300));
    passwordTimers.current = timers;
    return () => timers.forEach(fn => fn());
  }, [phase, scaledTimeout]);

  // Login button press (phase 4)
  useEffect(() => {
    if (phase !== 4) return;
    setLoginPressed(true);
    const t1 = scaledTimeout(() => setLoginPressed(false), 300);
    const t2 = scaledTimeout(() => setPhase(5), 600);
    return () => { t1(); t2(); };
  }, [phase, scaledTimeout]);

  // Remaining phase transitions
  useEffect(() => {
    if (phase === 5) return scaledTimeout(() => setPhase(6), 1200);
    if (phase === 6) return scaledTimeout(() => setPhase(7), 1500);
    if (phase === 7) return scaledTimeout(() => setPhase(8), 2500);
    if (phase === 8) {
      return scaledTimeout(() => {
        setPhase(9);
        showPipelineHUD();
      }, 2000);
    }
  }, [phase, showPipelineHUD, scaledTimeout]);

  // Pipeline glow: INPUT during typing/login, PROCESS during server, OUTPUT when result shows
  const glowIndex = phase >= 2 && phase <= 4 ? 0 : phase === 5 || phase === 6 ? 1 : phase >= 7 ? 2 : -1;
  const allGlow = phase === 8;

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

  const showLoggedIn = phase >= 7;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Big narration at phase 0 */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 text-center z-10 px-8"
            style={{ top: '42%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <span className="font-display text-3xl md:text-4xl text-primary tracking-wide leading-relaxed">
              Every app you use follows the same pattern:
              <br />
              <span className="text-blue">Input</span>
              {' → '}
              <span className="text-amber">Process</span>
              {' → '}
              <span className="text-green">Output</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small narration during animation */}
      <AnimatePresence>
        {phase >= 1 && phase < 9 && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="font-body text-sm text-dim">
              Every app you use follows the same pattern: Input → Process → Output
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone mockup - left side, shifted up */}
      <AnimatePresence>
        {phase >= 1 && phase < 9 && (
          <div className="absolute left-[15%] md:left-[25%] top-[40%] -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: phase >= 5 && phase < 7 ? 0.3 : 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            {/* Phone body */}
            <div
              className="w-56 h-72 rounded-3xl border-2 border-white/10 flex flex-col items-center justify-center p-6 relative"
              style={{ background: 'rgba(17,22,51,0.8)' }}
            >
              {/* Notch */}
              <div className="absolute top-3 w-20 h-5 rounded-full bg-black/50" />

              <AnimatePresence mode="wait">
                {!showLoggedIn ? (
                  <motion.div
                    key="login-form"
                    className="w-full"
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* App header */}
                    <div className="text-dim text-xs font-display mb-6 tracking-wider text-center">Instagram</div>

                    {/* Login form */}
                    <div className="w-full space-y-3">
                      {/* Username field */}
                      <div className="w-full h-9 rounded-md border border-white/15 bg-white/5 flex items-center px-3 relative overflow-hidden">
                        <span className="text-sm font-code text-green">
                          {phase >= 2 ? username.displayText : ''}
                        </span>
                        {phase >= 2 && phase < 3 && !username.isComplete && (
                          <span className="inline-block w-1.5 h-4 bg-green cursor-blink ml-0.5" />
                        )}
                      </div>

                      {/* Password field */}
                      <div className="w-full h-9 rounded-md border border-white/10 bg-white/5 flex items-center px-3 relative overflow-hidden">
                        {phase >= 3 ? (
                          <>
                            <span className="text-sm font-code text-green tracking-wider">
                              {passwordDots}
                            </span>
                            {phase === 3 && passwordDots.length < 6 && (
                              <span className="inline-block w-1.5 h-4 bg-green cursor-blink ml-0.5" />
                            )}
                          </>
                        ) : (
                          <span className="text-dim text-xs">password</span>
                        )}
                      </div>

                      {/* Login button */}
                      <motion.div
                        className="w-full h-9 rounded-md flex items-center justify-center"
                        animate={{
                          scale: loginPressed ? 0.92 : 1,
                          backgroundColor: loginPressed
                            ? 'rgba(96, 165, 250, 0.5)'
                            : 'rgba(96, 165, 250, 0.2)',
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <span className="text-blue text-xs font-body">Log In</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="logged-in"
                    className="w-full flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Logged-in feed mockup */}
                    <div className="text-dim text-xs font-display mb-3 tracking-wider">Instagram</div>
                    <div className="w-10 h-10 rounded-full border border-green/40 flex items-center justify-center mb-2">
                      <span className="text-green font-code text-sm">A</span>
                    </div>
                    <span className="text-green font-code text-xs mb-3">Welcome, avin</span>
                    {/* Fake feed lines */}
                    <div className="w-full space-y-2">
                      <div className="w-full h-16 rounded-md bg-white/5 border border-white/5" />
                      <div className="w-3/4 h-2 rounded bg-white/10" />
                      <div className="w-1/2 h-2 rounded bg-white/5" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animated arrow from phone to SERVER box */}
      <AnimatePresence>
        {phase >= 5 && phase < 9 && (
          <motion.div
            className="absolute top-[40%] -translate-y-1/2 left-1/2 -translate-x-1/2 text-dim text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            &rarr;
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glowing particles traveling from phone to program box */}
      {(phase === 5 || phase === 6) &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '40%',
              background: 'var(--accent-blue)',
              boxShadow: '0 0 8px var(--accent-blue), 0 0 16px var(--accent-blue)',
            }}
            initial={{ x: p.startX, y: p.startY, opacity: 0, scale: 0 }}
            animate={{
              x: phase >= 6 ? p.endX : p.startX + 40,
              y: phase >= 6 ? p.endY : p.startY - 30 - Math.random() * 40,
              opacity: [0, 1, 1, phase >= 6 ? 0 : 1],
              scale: [0, 1.2, 1, phase >= 6 ? 0 : 1],
            }}
            transition={{
              duration: phase >= 6 ? 1.2 : 0.8,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* SERVER box - center right, shifted up */}
      <AnimatePresence>
        {phase >= 6 && phase < 9 && (
          <div className="absolute right-[15%] md:right-[25%] top-[40%] -translate-y-1/2">
          <motion.div
            className="flex flex-col items-center"
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
              <span className="text-amber font-display text-sm tracking-wider">SERVER</span>
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
              {/* Running program indicator */}
              <motion.span
                className="text-amber/70 font-code text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                running program...
              </motion.span>
            </div>

            {/* Downward arrow connecting to output */}
            {phase >= 7 && (
              <motion.div
                className="text-green/60 text-lg my-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ↓
              </motion.div>
            )}

            {/* Welcome message emerges from server */}
            {phase >= 7 && (
              <motion.div
                className="px-4 py-2 rounded-lg border border-green/30 font-code text-green text-sm"
                style={{ boxShadow: '0 0 20px var(--glow-green)' }}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                Welcome back, Avin
              </motion.div>
            )}
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pipeline boxes: INPUT -> PROCESS -> OUTPUT — visible from phase 2, synced with demo */}
      <AnimatePresence>
        {phase >= 2 && phase < 9 && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {pipelineBoxes.map((box, i) => {
              const isActive = allGlow || glowIndex === i;
              return (
                <motion.div key={box.label} className="flex items-center gap-2 md:gap-4">
                  <motion.div
                    className="px-5 py-3 rounded-lg border font-display text-sm tracking-wider text-center"
                    style={{
                      borderColor: isActive ? box.color : 'rgba(255,255,255,0.15)',
                      color: isActive ? box.color : 'var(--text-dim)',
                      boxShadow: isActive
                        ? `0 0 30px ${box.shadow}, 0 0 60px ${box.shadow}`
                        : 'none',
                      background: isActive ? 'rgba(17,22,51,0.9)' : 'rgba(17,22,51,0.5)',
                      transition: 'box-shadow 0.4s ease, border-color 0.4s ease, color 0.4s ease',
                    }}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 18,
                    }}
                  >
                    {box.label}
                  </motion.div>
                  {i < 2 && (
                    <span className="text-dim/50 text-xl">&rarr;</span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
