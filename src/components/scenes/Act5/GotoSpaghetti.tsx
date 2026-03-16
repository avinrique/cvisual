'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';

const GRID = 6;
const CELL = 65;
const MAX_PHASE = 5;

export default function GotoSpaghetti() {
  const [phase, setPhase] = useState(0);
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

  // Orderly traffic paths (horizontal/vertical) — scaled 1.4x
  const orderlyPaths = [
    'M 35 35 L 385 35',
    'M 35 105 L 385 105',
    'M 35 175 L 385 175',
    'M 105 35 L 105 385',
    'M 245 35 L 245 385',
    'M 315 35 L 315 385',
  ];

  // Chaotic goto arrows (diagonal, crossing) — scaled 1.4x
  const gotoArrows = [
    { d: 'M 35 35 L 315 245', delay: 0 },
    { d: 'M 385 35 L 105 315', delay: 0.2 },
    { d: 'M 175 385 L 385 105', delay: 0.4 },
    { d: 'M 35 245 L 315 35', delay: 0.6 },
    { d: 'M 245 35 L 35 385', delay: 0.8 },
    { d: 'M 385 315 L 105 105', delay: 1.0 },
    { d: 'M 175 35 Q 350 210 105 385', delay: 1.2 },
    { d: 'M 35 175 Q 210 350 385 175', delay: 1.4 },
  ];

  // Crash points — scaled 1.4x
  const crashes = [
    { x: 175, y: 140 },
    { x: 280, y: 210 },
    { x: 105, y: 280 },
    { x: 245, y: 105 },
  ];

  const gotoCode = `// Spaghetti goto:
start:
  printf("A");
  goto middle;
end:
  printf("C");
  goto start;  // chaos!
middle:
  printf("B");
  goto end;`;

  const structuredCode = `// Structured:
printf("A");
printf("B");
printf("C");`;

  const isChaos = phase <= 3;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void px-4">
      <motion.h2
        className="font-display text-xl mb-6"
        style={{ color: '#EF4444' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        goto: Spaghetti Code
      </motion.h2>

      <div className="flex flex-row items-start gap-6">
        {/* Grid visualization */}
        <div className="relative" style={{ width: 420, height: 420 }}>
          <svg width="420" height="420" viewBox="0 0 420 420">
            {/* Grid streets */}
            {Array.from({ length: GRID + 1 }).map((_, i) => (
              <g key={i}>
                <motion.line
                  x1={0} y1={i * CELL} x2={420} y2={i * CELL}
                  stroke="rgba(255,255,255,0.08)" strokeWidth="1"
                  animate={phase >= 4 ? { opacity: 0.15 } : {}}
                />
                <motion.line
                  x1={i * CELL} y1={0} x2={i * CELL} y2={420}
                  stroke="rgba(255,255,255,0.08)" strokeWidth="1"
                  animate={phase >= 4 ? { opacity: 0.15 } : {}}
                />
              </g>
            ))}

            {/* Orderly traffic (phase 0) */}
            <AnimatePresence>
              {phase < 2 && orderlyPaths.map((d, i) => (
                <motion.g key={`orderly-${i}`} exit={{ opacity: 0 }}>
                  <motion.path
                    d={d}
                    stroke="#22C55E"
                    strokeWidth="2"
                    fill="none"
                    opacity={0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                  {/* Car dots */}
                  <motion.circle
                    r="4" fill="#22C55E"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                  >
                    <animateMotion dur="3s" repeatCount="indefinite" path={d} />
                  </motion.circle>
                </motion.g>
              ))}
            </AnimatePresence>

            {/* Goto arrows (phase 1+) */}
            {phase >= 1 && gotoArrows.map((arrow, i) => (
              <motion.path
                key={`goto-${i}`}
                d={arrow.d}
                stroke="#EF4444"
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: phase >= 4 ? 0 : 1,
                  opacity: phase >= 4 ? 0 : 0.7,
                }}
                transition={{ duration: 0.8, delay: arrow.delay }}
                markerEnd="url(#arrowhead)"
              />
            ))}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
              </marker>
            </defs>

            {/* Crash explosions (phase 2+) */}
            {phase >= 2 && phase < 4 && crashes.map((c, i) => (
              <motion.g key={`crash-${i}`}>
                <motion.circle
                  cx={c.x} cy={c.y} r="0" fill="none" stroke="#F59E0B"
                  initial={{ r: 0, opacity: 1 }}
                  animate={{ r: 28, opacity: 0 }}
                  transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                />
                <motion.text
                  x={c.x} y={c.y + 4} textAnchor="middle" fill="#EF4444" fontSize="14"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.3 + 0.5 }}
                >
                  !
                </motion.text>
              </motion.g>
            ))}

            {/* Spaghetti label (phase 3) */}
            {phase >= 3 && phase < 4 && (
              <motion.text
                x="210" y="224" textAnchor="middle" fill="#EF4444" fontSize="16" fontFamily="monospace" fontWeight="bold"
                initial={{ opacity: 0, scale: 3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                SPAGHETTI CODE
              </motion.text>
            )}

            {/* Clean streets restored (phase 4+) */}
            {phase >= 4 && orderlyPaths.map((d, i) => (
              <motion.path
                key={`clean-${i}`}
                d={d}
                stroke="#22C55E"
                strokeWidth="2"
                fill="none"
                opacity={0.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.15 }}
              />
            ))}
          </svg>

          {/* Overlay text */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="px-4 py-2 rounded-lg font-code text-sm text-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
                  <span style={{ color: '#22C55E' }}>Use structured loops instead</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Code panel */}
        <motion.div
          className="rounded-lg overflow-hidden"
          style={{ width: 300, background: '#1a1a2e' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#0d0d1a' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
            <span className="ml-2 text-xs font-code text-dim">goto_example.c</span>
          </div>
          {/* Code content */}
          <div className="p-4 font-code text-xs leading-relaxed">
            <pre style={{ margin: 0 }}>
              {gotoCode.split('\n').map((line, i) => {
                const isGotoLine = line.includes('goto');
                return (
                  <div
                    key={`goto-${i}`}
                    style={{
                      color: isChaos && isGotoLine ? '#EF4444' : isChaos ? '#e2e8f0' : '#64748b',
                      background: isChaos && isGotoLine ? 'rgba(239,68,68,0.1)' : 'transparent',
                      padding: '1px 4px',
                      borderRadius: 2,
                      transition: 'color 0.4s, background 0.4s',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
            <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <pre style={{ margin: 0 }}>
              {structuredCode.split('\n').map((line, i) => {
                const isCodeLine = line.startsWith('printf');
                return (
                  <div
                    key={`struct-${i}`}
                    style={{
                      color: !isChaos && isCodeLine ? '#22C55E' : !isChaos ? '#e2e8f0' : '#64748b',
                      background: !isChaos && isCodeLine ? 'rgba(34,197,94,0.1)' : 'transparent',
                      padding: '1px 4px',
                      borderRadius: 2,
                      transition: 'color 0.4s, background 0.4s',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </motion.div>
      </div>

      {/* Warning message */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            className="mt-6 px-6 py-3 rounded-lg border-2 border-red/40 bg-red/10 font-code text-sm text-center"
            style={{ color: '#EF4444' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="font-bold">goto</span> creates unreadable, unmaintainable &quot;spaghetti code.&quot;
            <br />
            <span className="text-dim text-xs">This is why goto is discouraged in modern C programming.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase < 3 && (
        <Narration text="Orderly streets become chaos when goto lets traffic go anywhere." delay={1} />
      )}
    </div>
  );
}
