'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';

const codeLines = [
  { text: 'int main() {', color: '#8B5CF6' },
  { text: '  printf("Running...\\n");', color: '#FFD700' },
  { text: '  return 0;', color: '#22C55E' },
  { text: '  printf("Never!\\n");', color: '#FF6B6B' },
  { text: '}', color: '#8B5CF6' },
];

// Phase 0: scene appears, Bit stands at line 0
// Phase 1: Bit moves to line 1 (printf Running), it executes
// Phase 2: Bit moves to line 2 (return 0;), it glows
// Phase 3: Bit gets EJECTED upward out of the code block, return 0 fires
// Phase 4: line 3 (printf Never) gets crossed out + "unreachable" label

export default function ReturnEject() {
  const [phase, setPhase] = useState(0);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 4) return false;
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

  // Which line Bit is on (0-indexed into codeLines)
  const bitLine = phase <= 2 ? phase : -1;
  const ejected = phase >= 3;

  // Output terminal
  const output: string[] = [];
  if (phase >= 1) output.push('Running...');
  if (phase >= 3) output.push('Program exited with code 0');

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full px-4">
        {/* Ejected Bit flies up */}
        <AnimatePresence>
          {ejected && (
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 40, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 12 }}
            >
              <BitCharacter mood="excited" size={60} color="#22C55E" />
              <motion.div
                className="font-code text-sm font-bold"
                style={{ color: '#22C55E' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Ejected! return 0;
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code block */}
        <div
          className="w-full max-w-md rounded-lg border overflow-hidden"
          style={{
            background: 'rgba(13,17,40,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F56' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#27C93F' }} />
            <span className="ml-2 text-xs font-code text-dim">return.c</span>
          </div>

          {/* Code lines */}
          <div className="px-4 py-3 font-code text-sm leading-8 relative">
            {codeLines.map((line, i) => {
              const isActive = bitLine === i;
              const isUnreachable = i === 3 && phase >= 4;
              const isExecuted = (i === 1 && phase >= 1) || (i === 2 && phase >= 2);

              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 px-2 py-0.5 rounded relative"
                  animate={{
                    background: isActive
                      ? 'rgba(255,215,0,0.12)'
                      : isUnreachable
                      ? 'rgba(255,80,80,0.08)'
                      : 'transparent',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Line number */}
                  <span className="w-4 text-right select-none text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {i + 1}
                  </span>

                  {/* Bit character indicator */}
                  <div className="w-8 flex justify-center">
                    {isActive && !ejected && (
                      <motion.div
                        layoutId="bit-indicator"
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        <BitCharacter mood={i === 2 ? 'happy' : 'neutral'} size={28} color="#00BFFF" />
                      </motion.div>
                    )}
                  </div>

                  {/* Code text */}
                  <motion.span
                    style={{
                      color: isUnreachable ? '#FF6B6B' : isActive ? line.color : `${line.color}88`,
                      textDecoration: isUnreachable ? 'line-through' : 'none',
                    }}
                    animate={{
                      opacity: isUnreachable ? 0.4 : isExecuted || isActive ? 1 : 0.5,
                    }}
                  >
                    {line.text}
                  </motion.span>

                  {/* Executed checkmark */}
                  {isExecuted && !isActive && i !== 2 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ color: '#22C55E' }}
                      className="text-xs"
                    >
                      ✓
                    </motion.span>
                  )}

                  {/* Return glow */}
                  {i === 2 && phase >= 2 && (
                    <motion.div
                      className="absolute inset-0 rounded pointer-events-none"
                      animate={{
                        boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 15px rgba(34,197,94,0.3)', '0 0 0px rgba(34,197,94,0)'],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {/* Unreachable label */}
                  {isUnreachable && (
                    <motion.span
                      className="text-xs font-code ml-2"
                      style={{ color: '#FF6B6B' }}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      ← unreachable!
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Output terminal */}
        <div
          className="w-full max-w-md rounded-lg border overflow-hidden"
          style={{
            background: 'rgba(13,17,40,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 px-4 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <span className="text-xs font-code text-dim">output</span>
          </div>
          <div className="px-4 py-2 font-code text-sm min-h-[2.5rem]">
            {output.length === 0 && <span className="text-dim/40">waiting...</span>}
            {output.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: i === 1 ? '#22C55E' : '#FFD700' }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Narration
        text="return ends the function and sends a value back to the caller. Code after return never runs — it's unreachable."
        delay={2}
      />
    </div>
  );
}
