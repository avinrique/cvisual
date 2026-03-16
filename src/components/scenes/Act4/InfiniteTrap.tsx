'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import GlowBox from '@/components/shared/GlowBox';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const MAX_PHASE = 4;

const DANGER_CARDS = [
  {
    title: 'while(1)',
    subtitle: 'no break',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" stroke="#EF4444" strokeWidth="2" fill="none" />
        <path d="M14 14 L26 26 M26 14 L14 26" stroke="#EF4444" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'forgot i++',
    subtitle: 'variable never changes',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="8" y="12" width="24" height="16" rx="2" stroke="#F59E0B" strokeWidth="2" fill="none" />
        <text x="20" y="24" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">i++</text>
        <line x1="6" y1="6" x2="34" y2="34" stroke="#EF4444" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'condition never false',
    subtitle: 'logic error',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path d="M20 4 L36 34 L4 34 Z" stroke="#F97316" strokeWidth="2" fill="none" />
        <text x="20" y="28" textAnchor="middle" fill="#F97316" fontSize="16" fontFamily="monospace">!</text>
      </svg>
    ),
  },
];

export default function InfiniteTrap() {
  const [phase, setPhase] = useState(0);
  const [counter, setCounter] = useState(1);
  const [wheelAngle, setWheelAngle] = useState(0);
  const { scaledInterval } = useAnimationSpeed();

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

  // Counter animation for phases 0 and 1
  useEffect(() => {
    if (phase > 1) return;
    const speed = phase === 0 ? 80 : 30;
    const cancel = scaledInterval(() => {
      setCounter(prev => {
        if (prev >= 999999999) return 999999999;
        if (prev < 100) return prev + 1;
        if (prev < 1000) return prev + 7;
        if (prev < 10000) return prev + 73;
        if (prev < 100000) return prev + 531;
        if (prev < 1000000) return prev + 4217;
        return prev + 31337;
      });
    }, speed);
    return () => cancel();
  }, [phase, scaledInterval]);

  // Wheel spinning animation
  useEffect(() => {
    if (phase >= 3) return;
    const speed = phase === 3 ? 0 : phase === 1 ? 15 : 30;
    if (speed === 0) return;
    const cancel = scaledInterval(() => {
      setWheelAngle(prev => prev + 6);
    }, speed);
    return () => cancel();
  }, [phase, scaledInterval]);

  // Reset counter when going back to phase 0
  useEffect(() => {
    if (phase === 0) {
      setCounter(1);
      setWheelAngle(0);
    }
  }, [phase]);

  // Background red intensity based on phase
  const redIntensity = phase === 0
    ? Math.min(counter / 10000, 0.15)
    : phase === 1
      ? 0.25
      : 0;

  const narrations = [
    'while(1) is always true. The loop never stops.',
    'This is an infinite loop. Your program is stuck forever.',
    'Forgetting to update the loop variable is the #1 cause.',
    'Always make sure your condition can eventually become false.',
    'Three ways to get trapped. Learn to spot them.',
  ];

  const HamsterWheel = ({ spinning, size = 200 }: { spinning: boolean; size?: number }) => {
    const r = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;
    const spokeCount = 8;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer rim */}
        <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
        {/* Inner rim */}
        <circle cx={cx} cy={cy} r={r * 0.85} stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
        {/* Spokes */}
        <g style={{ transform: `rotate(${spinning ? wheelAngle : 0}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: spinning ? 'none' : 'transform 1s ease-out' }}>
          {Array.from({ length: spokeCount }).map((_, i) => {
            const angle = (i / spokeCount) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + r * Math.cos(rad)}
                y2={cy + r * Math.sin(rad)}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
              />
            );
          })}
          {/* Hub */}
          <circle cx={cx} cy={cy} r="6" fill="rgba(255,255,255,0.2)" />
        </g>
        {/* Rungs on the wheel */}
        <g style={{ transform: `rotate(${spinning ? wheelAngle : 0}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: spinning ? 'none' : 'transform 1s ease-out' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx + r * 0.85 * Math.cos(rad)}
                y1={cy + r * 0.85 * Math.sin(rad)}
                x2={cx + r * Math.cos(rad)}
                y2={cy + r * Math.sin(rad)}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            );
          })}
        </g>
        {/* Stand legs */}
        <line x1={cx - r - 5} y1={cy + r + 15} x2={cx - r * 0.3} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        <line x1={cx + r + 5} y1={cy + r + 15} x2={cx + r * 0.3} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        {/* Stand base */}
        <line x1={cx - r - 15} y1={cy + r + 15} x2={cx + r + 15} y2={cy + r + 15} stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
      </svg>
    );
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void"
      style={{
        background: `radial-gradient(ellipse at center, rgba(239,68,68,${redIntensity}) 0%, var(--bg-void, #0a0a1a) 70%)`,
        transition: 'background 0.5s ease',
      }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 0: while(1) with hamster wheel */}
        {phase === 0 && (
          <motion.div
            key="phase0"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="font-code text-4xl font-bold"
              style={{ color: '#EF4444' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                textShadow: [
                  '0 0 10px rgba(239,68,68,0.5)',
                  '0 0 30px rgba(239,68,68,0.8)',
                  '0 0 10px rgba(239,68,68,0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              while(1)
            </motion.h2>

            <div className="relative">
              <HamsterWheel spinning={true} size={220} />
              {/* BitCharacter running on the wheel */}
              <div className="absolute" style={{ left: '50%', top: '30%', transform: 'translateX(-50%)' }}>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <BitCharacter mood="excited" size={40} color="#00BFFF" />
                </motion.div>
              </div>
            </div>

            {/* Counter */}
            <motion.div
              className="font-code text-2xl tabular-nums"
              style={{ color: counter > 1000 ? '#EF4444' : '#F59E0B' }}
            >
              iteration: {counter.toLocaleString()}
            </motion.div>
          </motion.div>
        )}

        {/* Phase 1: Screen freeze / CRT glitch */}
        {phase === 1 && (
          <motion.div
            key="phase1"
            className="flex flex-col items-center gap-6 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* CRT glitch overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239,68,68,0.03) 2px, rgba(239,68,68,0.03) 4px)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                skewX: [0, 0.5, -0.3, 0],
                translateX: [0, -2, 3, 0],
              }}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Frozen wheel */}
            <motion.div
              animate={{
                x: [-2, 3, -1, 2, 0],
                skewX: [0, 1, -0.5, 0.5, 0],
              }}
              transition={{ duration: 0.15, repeat: Infinity }}
            >
              <HamsterWheel spinning={true} size={180} />
            </motion.div>

            {/* "Program Not Responding" dialog */}
            <motion.div
              className="relative z-10 rounded-lg border-2 px-8 py-6 flex flex-col items-center gap-4"
              style={{
                background: 'rgba(30, 20, 20, 0.95)',
                borderColor: '#EF4444',
                boxShadow: '0 0 40px rgba(239,68,68,0.3)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" fill="none" />
                  <line x1="12" y1="7" x2="12" y2="13" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.5" fill="#EF4444" />
                </svg>
                <span className="font-display text-lg tracking-wider" style={{ color: '#EF4444' }}>
                  Program Not Responding
                </span>
              </div>
              <div className="font-code text-sm text-dim">
                Counter: {counter >= 999999999 ? '999,999,999...' : counter.toLocaleString()}
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-1.5 rounded text-xs font-code border" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#EF4444' }}>
                  Wait
                </div>
                <div className="px-4 py-1.5 rounded text-xs font-code border" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#EF4444' }}>
                  End Process
                </div>
              </div>
            </motion.div>

            {/* Scared BitCharacter */}
            <motion.div
              animate={{ x: [-3, 3, -3] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <BitCharacter mood="scared" size={50} color="#EF4444" label="HELP!" />
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Missing i++ example */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="font-display text-lg tracking-wider text-dim"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.7, y: 0 }}
            >
              Common Cause: Missing Update
            </motion.h3>

            <GlowBox color="#EF4444" intensity={0.3}>
              <div className="font-code text-sm leading-loose px-4 py-3">
                <div>
                  <span style={{ color: 'var(--accent-blue)' }}>int</span>
                  <span className="text-dim"> i = </span>
                  <span style={{ color: 'var(--accent-amber)' }}>0</span>
                  <span className="text-dim">;</span>
                </div>
                <div>
                  <span style={{ color: 'var(--accent-purple)' }}>while</span>
                  <span className="text-dim">(i {'<'} 5) {'{'}</span>
                </div>
                <div className="pl-6">
                  <span style={{ color: 'var(--accent-gold)' }}>printf</span>
                  <span className="text-dim">(</span>
                  <span style={{ color: 'var(--accent-green)' }}>&quot;%d &quot;</span>
                  <span className="text-dim">, i);</span>
                </div>

                {/* Missing i++ highlighted area */}
                <div className="pl-6 relative my-1">
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="px-3 py-1 rounded font-code text-sm"
                      style={{
                        border: '2px dashed #EF4444',
                        color: 'rgba(239,68,68,0.4)',
                        background: 'rgba(239,68,68,0.05)',
                      }}
                      animate={{
                        borderColor: ['rgba(239,68,68,0.4)', 'rgba(239,68,68,0.9)', 'rgba(239,68,68,0.4)'],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      i++;  ???
                    </motion.div>

                    {/* Arrow pointing to the gap */}
                    <motion.svg
                      width="80"
                      height="24"
                      viewBox="0 0 80 24"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <line x1="0" y1="12" x2="55" y2="12" stroke="#EF4444" strokeWidth="2" />
                      <polygon points="55,6 65,12 55,18" fill="#EF4444" />
                      <text x="68" y="16" fill="#EF4444" fontSize="8" fontFamily="monospace">MISSING!</text>
                    </motion.svg>
                  </motion.div>
                </div>

                <div>
                  <span className="text-dim">{'}'}</span>
                </div>
              </div>
            </GlowBox>

            <motion.div
              className="text-xs font-body text-dim text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1 }}
            >
              i stays 0 forever -- the condition i {'<'} 5 is always true
            </motion.div>
          </motion.div>
        )}

        {/* Phase 3: Fix with i++ sliding into place */}
        {phase === 3 && (
          <motion.div
            key="phase3"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="font-display text-lg tracking-wider"
              style={{ color: '#22C55E' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.7, y: 0 }}
            >
              The Fix
            </motion.h3>

            <div className="flex items-start gap-8">
              <GlowBox color="#22C55E" intensity={0.2}>
                <div className="font-code text-sm leading-loose px-4 py-3">
                  <div>
                    <span style={{ color: 'var(--accent-blue)' }}>int</span>
                    <span className="text-dim"> i = </span>
                    <span style={{ color: 'var(--accent-amber)' }}>0</span>
                    <span className="text-dim">;</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--accent-purple)' }}>while</span>
                    <span className="text-dim">(i {'<'} 5) {'{'}</span>
                  </div>
                  <div className="pl-6">
                    <span style={{ color: 'var(--accent-gold)' }}>printf</span>
                    <span className="text-dim">(</span>
                    <span style={{ color: 'var(--accent-green)' }}>&quot;%d &quot;</span>
                    <span className="text-dim">, i);</span>
                  </div>

                  {/* i++ slides in */}
                  <div className="pl-6">
                    <motion.span
                      style={{ color: '#22C55E' }}
                      initial={{ opacity: 0, x: 60, scale: 1.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 15,
                        delay: 0.5,
                      }}
                    >
                      i++;
                    </motion.span>
                    {/* Click/snap effect */}
                    <motion.span
                      className="inline-block ml-2 text-green"
                      initial={{ opacity: 0, scale: 2 }}
                      animate={{ opacity: [0, 1, 0], scale: [2, 1, 0.5] }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      *click*
                    </motion.span>
                  </div>

                  <div>
                    <span className="text-dim">{'}'}</span>
                  </div>
                </div>
              </GlowBox>

              <div className="flex flex-col items-center gap-4">
                {/* Wheel slowing down */}
                <motion.div
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <HamsterWheel spinning={false} size={120} />
                </motion.div>

                {/* Happy BitCharacter */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <BitCharacter mood="happy" size={50} color="#22C55E" />
                </motion.div>
              </div>
            </div>

            {/* Terminal output */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Terminal title="output" showCursor={false} width="w-72">
                <motion.div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((n, i) => (
                    <motion.span
                      key={n}
                      style={{ color: '#22C55E' }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.2 }}
                    >
                      {n}
                    </motion.span>
                  ))}
                </motion.div>
              </Terminal>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 4: Three danger cards */}
        {phase === 4 && (
          <motion.div
            key="phase4"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="font-display text-xl tracking-wider text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Infinite Loop Danger Zones
            </motion.h3>

            <div className="flex gap-6">
              {DANGER_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center gap-3 px-6 py-5 rounded-xl border"
                  style={{
                    background: 'rgba(239,68,68,0.05)',
                    borderColor: 'rgba(239,68,68,0.3)',
                    boxShadow: '0 4px 20px rgba(239,68,68,0.1)',
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
                >
                  {card.icon}
                  <span className="font-code text-sm" style={{ color: '#EF4444' }}>
                    {card.title}
                  </span>
                  <span className="text-xs text-dim text-center max-w-[120px]">
                    {card.subtitle}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Narration text={narrations[phase]} delay={0.5} />
    </div>
  );
}
