'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';

// Execution follows the CODE ORDER:
// Phase 0: funnels + code panel appear (program loaded)
// Phase 1: printf("Enter weight:") → weight drops into funnel (scanf weight, line 6)
// Phase 2: printf("Enter height:") → height drops into funnel (scanf height, line 8)
// Phase 3: height rolls to multiply box, multiply glows — height×height result appears (line 10, multiply part)
// Phase 4: weight rolls to divide box, heightSquared moves into divide (line 10, divide part)
// Phase 5: divide glows — BMI result drops out (line 10 result)
// Phase 6: printf line + terminal output (line 11)

const BMI_CODE = [
  { text: '#include <stdio.h>', colored: [{ text: '#include <stdio.h>', color: 'var(--accent-purple)' }] },
  { text: '' },
  { text: 'int main() {', colored: [{ text: 'int', color: 'var(--accent-blue)' }, { text: ' main() {', color: 'var(--text-dim)' }] },
  { text: '    float weight, height, bmi;', colored: [{ text: '    ', color: '' }, { text: 'float', color: 'var(--accent-green)' }, { text: ' weight, height, bmi;', color: 'var(--text-dim)' }] },
  { text: '', colored: [] },
  { text: '    printf("Enter weight: ");', colored: [{ text: '    ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"Enter weight: "', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { text: '    scanf("%f", &weight);', colored: [{ text: '    ', color: '' }, { text: 'scanf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"%f"', color: 'var(--accent-green)' }, { text: ', &weight);', color: 'var(--text-dim)' }] },
  { text: '    printf("Enter height: ");', colored: [{ text: '    ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"Enter height: "', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { text: '    scanf("%f", &height);', colored: [{ text: '    ', color: '' }, { text: 'scanf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"%f"', color: 'var(--accent-green)' }, { text: ', &height);', color: 'var(--text-dim)' }] },
  { text: '', colored: [] },
  { text: '    bmi = weight / (height * height);', colored: [{ text: '    bmi ', color: 'var(--text-primary)' }, { text: '= ', color: 'var(--text-dim)' }, { text: 'weight', color: 'var(--accent-blue)' }, { text: ' / (', color: 'var(--text-dim)' }, { text: 'height', color: 'var(--accent-green)' }, { text: ' * ', color: 'var(--text-dim)' }, { text: 'height', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { text: '    printf("BMI: %.1f\\n", bmi);', colored: [{ text: '    ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"BMI: %.1f\\n"', color: 'var(--accent-green)' }, { text: ', bmi);', color: 'var(--text-dim)' }] },
  { text: '', colored: [] },
  { text: '    return 0;', colored: [{ text: '    ', color: '' }, { text: 'return', color: 'var(--accent-purple)' }, { text: ' 0;', color: 'var(--text-dim)' }] },
  { text: '}', colored: [{ text: '}', color: 'var(--text-dim)' }] },
];

// Map phase to highlighted code line index — follows code order
const PHASE_TO_LINE: Record<number, number> = {
  1: 6,  // scanf weight
  2: 8,  // scanf height
  3: 10, // bmi = weight / (height * height) — multiply part
  4: 10, // bmi = ... — divide part
  5: 10, // result
  6: 11, // printf
};

const MAX_PHASE = 6;

export default function BMICalculator() {
  const [phase, setPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const weight = 70;
  const height = 1.75;
  const heightSquared = +(height * height).toFixed(4);
  const bmi = +(weight / heightSquared).toFixed(1);

  // Arrow-key step handler
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

  const highlightLine = PHASE_TO_LINE[phase] ?? -1;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void"
    >
      {/* Title */}
      <motion.div
        className="absolute top-6 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="font-display text-xs text-dim tracking-widest uppercase">BMI Calculator</span>
        <h2 className="font-display text-lg text-amber tracking-wider mt-1">
          BMI = weight / (height × height)
        </h2>
      </motion.div>

      <div className="flex items-start gap-8 px-8 max-w-6xl w-full mt-8">
        {/* Left side — Machine visualization */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-[500px] h-[360px]">
            {/* Weight funnel — left (FIRST in code order) */}
            <motion.div
              className="absolute left-8 top-0 flex flex-col items-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <svg width="70" height="50" viewBox="0 0 80 60">
                  <path d="M10 0 L70 0 L50 60 L30 60 Z" fill="none" stroke="var(--accent-blue)" strokeWidth="2" />
                </svg>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-blue font-code text-xs">
                  weight
                </span>
              </div>

              {/* Weight number — drops at phase 1, rolls to divide at phase 4 */}
              {phase >= 1 && phase < 5 && (
                <motion.div
                  className="absolute font-code text-lg text-blue font-bold z-10"
                  style={{ textShadow: '0 0 10px var(--glow-blue)' }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{
                    y: phase >= 4 ? 235 : 30,
                    x: phase >= 4 ? 195 : 0,
                    opacity: 1,
                  }}
                  transition={{ duration: 1.2, ease: 'easeIn' }}
                >
                  {weight}
                </motion.div>
              )}
            </motion.div>

            {/* Height funnel — right (SECOND in code order) */}
            <motion.div
              className="absolute right-8 top-0 flex flex-col items-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <svg width="70" height="50" viewBox="0 0 80 60">
                  <path d="M10 0 L70 0 L50 60 L30 60 Z" fill="none" stroke="var(--accent-green)" strokeWidth="2" />
                </svg>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-green font-code text-xs">
                  height
                </span>
              </div>
              {/* Height number — drops at phase 2, rolls to multiply at phase 3 */}
              {phase >= 2 && phase < 4 && (
                <motion.div
                  className="absolute font-code text-lg text-green font-bold"
                  style={{ textShadow: '0 0 10px var(--glow-green)' }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{
                    y: phase >= 3 ? 95 : 25,
                    x: phase >= 3 ? -75 : 0,
                    opacity: 1,
                  }}
                  transition={{ duration: 1.2, ease: 'easeIn' }}
                >
                  {height}
                </motion.div>
              )}
            </motion.div>

            {/* Ramps */}
            <motion.svg
              className="absolute inset-0"
              width="500"
              height="360"
              viewBox="0 0 500 360"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.3 }}
            >
              {/* Right ramp: height funnel → multiply */}
              <line x1="400" y1="50" x2="275" y2="120" stroke="var(--accent-green)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Multiply → result box */}
              <line x1="260" y1="155" x2="260" y2="180" stroke="var(--accent-amber)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Result box → divide */}
              <line x1="260" y1="225" x2="245" y2="245" stroke="var(--accent-amber)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Left ramp: weight funnel → divide */}
              <line x1="80" y1="50" x2="225" y2="250" stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="4 4" />
            </motion.svg>

            {/* Multiply box */}
            <motion.div
              className="absolute left-[220px] top-[110px] w-[80px] h-[45px] rounded-lg border flex flex-col items-center justify-center"
              style={{
                borderColor: phase >= 3 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)',
                background: phase >= 3 ? 'rgba(245,158,11,0.1)' : 'rgba(17,22,51,0.8)',
                boxShadow: phase >= 3 ? '0 0 15px var(--glow-amber)' : 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-amber font-code text-lg">×</span>
              <span className="text-[10px] text-dim">multiply</span>
            </motion.div>

            {/* RESULT BOX — between multiply and divide */}
            <motion.div
              className="absolute left-[210px] top-[170px] w-[100px] h-[50px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center"
              style={{
                borderColor: phase >= 3 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.08)',
                background: phase >= 3 ? 'rgba(245,158,11,0.08)' : 'rgba(17,22,51,0.5)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatePresence>
                {phase >= 3 && phase < 5 && (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <span className="font-code text-xs text-amber/60">{height}×{height}</span>
                    <span className="font-code text-base text-amber font-bold" style={{ textShadow: '0 0 8px var(--glow-amber)' }}>
                      {heightSquared}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {phase < 3 && (
                <span className="text-[10px] text-dim/40 font-code">result</span>
              )}
            </motion.div>

            {/* Divide box */}
            <motion.div
              className="absolute left-[205px] top-[240px] w-[80px] h-[45px] rounded-lg border flex flex-col items-center justify-center"
              style={{
                borderColor: phase >= 4 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                background: phase >= 4 ? 'rgba(255,215,0,0.1)' : 'rgba(17,22,51,0.8)',
                boxShadow: phase >= 4 ? '0 0 15px var(--glow-gold)' : 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-gold font-code text-lg">/</span>
              <span className="text-[10px] text-dim">divide</span>
            </motion.div>

            {/* Division label */}
            {phase >= 4 && phase < 6 && (
              <motion.div
                className="absolute left-[295px] top-[248px] font-code text-xs text-gold/70"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {weight} / {heightSquared}
              </motion.div>
            )}

            {/* BMI result — drops below divide box */}
            {phase >= 5 && (
              <motion.div
                className="absolute left-[195px] top-[295px] flex flex-col items-center"
                initial={{ opacity: 0, y: -15, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                <motion.div
                  className="px-4 py-2 rounded-lg border-2 border-gold/60 font-code text-xl text-gold font-bold"
                  style={{
                    background: 'rgba(255,215,0,0.1)',
                    boxShadow: '0 0 25px var(--glow-gold)',
                  }}
                >
                  BMI: {bmi}
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* printf + terminal — BELOW the machine, no overlap */}
          <div className="flex flex-col items-center gap-3 mt-2">
            {phase >= 6 && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="font-code text-sm text-gold">printf(&quot;BMI: %.1f\n&quot;, bmi);</span>
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  </svg>
                </motion.span>
              </motion.div>
            )}

            {phase >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Terminal title="output" showCursor={true} width="w-72">
                  <motion.div
                    className="text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-green">Enter weight: <span className="text-primary">{weight}</span></div>
                    <div className="text-green">Enter height: <span className="text-primary">{height}</span></div>
                    <motion.div
                      className="text-gold mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      BMI: {bmi}
                    </motion.div>
                  </motion.div>
                </Terminal>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right side — Code panel */}
        <motion.div
          className="w-72 flex-shrink-0"
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
              <span className="text-xs text-dim ml-2 font-code">bmi.c</span>
            </div>

            {/* Code lines */}
            <div className="px-3 py-3 font-code text-xs leading-relaxed">
              {BMI_CODE.map((line, i) => {
                const isHighlighted = highlightLine === i;
                const isPast = highlightLine > i && highlightLine !== -1;

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-1.5 py-px rounded transition-colors duration-300"
                    style={{
                      background: isHighlighted ? 'rgba(245,158,11,0.12)' : 'transparent',
                      borderLeft: isHighlighted ? '2px solid var(--accent-amber)' : '2px solid transparent',
                    }}
                    animate={{ opacity: isPast ? 0.45 : 1 }}
                  >
                    <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                      {line.colored ? (
                        line.colored.map((seg, j) => (
                          <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                        ))
                      ) : (
                        <span className="text-dim">{line.text}</span>
                      )}
                    </span>
                    {isHighlighted && (
                      <motion.span
                        className="text-[10px] font-bold flex-shrink-0 text-amber"
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
              key={`status-${phase}`}
              className="mt-2 text-center text-xs font-body text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              {phase === 0 && 'Program loaded...'}
              {phase === 1 && 'Reading weight from user...'}
              {phase === 2 && 'Reading height from user...'}
              {phase === 3 && `Computing height × height = ${heightSquared}`}
              {phase === 4 && `Computing ${weight} / ${heightSquared}...`}
              {phase === 5 && `BMI = ${bmi}`}
              {phase === 6 && 'Printing result to console.'}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {phase >= 6 && (
        <Narration
          text="scanf pours data in, the machine crunches it, printf announces the result. That's the complete I/O pipeline."
          delay={0.8}
        />
      )}
    </div>
  );
}
