'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';

const GRID = 6;
const CELL = 50;

export default function GotoSpaghetti() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 6500),
      setTimeout(() => setPhase(4), 9000),
      setTimeout(() => setPhase(5), 11500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Orderly traffic paths (horizontal/vertical)
  const orderlyPaths = [
    'M 25 25 L 275 25',
    'M 25 75 L 275 75',
    'M 25 125 L 275 125',
    'M 75 25 L 75 275',
    'M 175 25 L 175 275',
    'M 225 25 L 225 275',
  ];

  // Chaotic goto arrows (diagonal, crossing)
  const gotoArrows = [
    { d: 'M 25 25 L 225 175', delay: 0 },
    { d: 'M 275 25 L 75 225', delay: 0.2 },
    { d: 'M 125 275 L 275 75', delay: 0.4 },
    { d: 'M 25 175 L 225 25', delay: 0.6 },
    { d: 'M 175 25 L 25 275', delay: 0.8 },
    { d: 'M 275 225 L 75 75', delay: 1.0 },
    { d: 'M 125 25 Q 250 150 75 275', delay: 1.2 },
    { d: 'M 25 125 Q 150 250 275 125', delay: 1.4 },
  ];

  // Crash points
  const crashes = [
    { x: 125, y: 100 },
    { x: 200, y: 150 },
    { x: 75, y: 200 },
    { x: 175, y: 75 },
  ];

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

      <div className="relative" style={{ width: 300, height: 300 }}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Grid streets */}
          {Array.from({ length: GRID + 1 }).map((_, i) => (
            <g key={i}>
              <motion.line
                x1={0} y1={i * CELL} x2={300} y2={i * CELL}
                stroke="rgba(255,255,255,0.08)" strokeWidth="1"
                animate={phase >= 4 ? { opacity: 0.15 } : {}}
              />
              <motion.line
                x1={i * CELL} y1={0} x2={i * CELL} y2={300}
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
                animate={{ r: 20, opacity: 0 }}
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
              x="150" y="160" textAnchor="middle" fill="#EF4444" fontSize="16" fontFamily="monospace" fontWeight="bold"
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
