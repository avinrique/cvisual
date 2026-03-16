'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

const TOTAL = 5;
const SKIP_AT = 3;

const codeLines = [
  { text: 'for(i=1; i<=5; i++) {', indent: 0 },
  { text: '  if(i==3) continue;', indent: 0 },
  { text: '  printf("%d ", i);', indent: 0 },
  { text: '}', indent: 0 },
];

export default function ContinueTrampoline() {
  const [iteration, setIteration] = useState(0);
  const [output, setOutput] = useState<(number | null)[]>([]);
  const [bouncing, setBouncing] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const iterRef = useRef(iteration);
  iterRef.current = iteration;

  const stableStepHandler = useCallback(() => {
    if (iterRef.current >= TOTAL) return false;
    setIteration(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (iterRef.current <= 0) return false;
    setIteration(prev => prev - 1);
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

  // Handle output and bouncing when iteration changes
  useEffect(() => {
    if (iteration === 0) return;

    if (iteration === SKIP_AT) {
      setBouncing(true);
      setOutput(prev => [...prev, null]);
      const cancel = scaledTimeout(() => setBouncing(false), 800);
      return () => cancel();
    } else {
      setOutput(prev => [...prev, iteration]);
    }
  }, [iteration, scaledTimeout]);

  // Track positions for stations — scaled up
  const stationX = (i: number) => 50 + i * 80;
  const trackY = 140;

  // Determine which code line to highlight
  const getActiveCodeLine = (): number | null => {
    if (iteration === 0) return null;
    if (iteration === SKIP_AT) return 1; // highlight "if(i==3) continue;"
    return 2; // highlight "printf("%d ", i);"
  };

  const activeLine = getActiveCodeLine();

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
        <motion.h2
          className="font-display text-xl"
          style={{ color: '#FFD700' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          continue: The Trampoline
        </motion.h2>

        {/* Track scene — scaled up */}
        <div className="relative w-full max-w-2xl h-64">
          <svg width="100%" height="250" viewBox="0 0 520 250" preserveAspectRatio="xMidYMid meet">
            {/* Track */}
            <line x1="20" y1={trackY} x2="500" y2={trackY} stroke="rgba(255,255,255,0.15)" strokeWidth="6" />

            {/* Printf stations */}
            {Array.from({ length: TOTAL }).map((_, i) => {
              const x = stationX(i);
              const isSkipped = i + 1 === SKIP_AT;
              return (
                <g key={i}>
                  <rect x={x - 20} y={trackY - 38} width="40" height="32" rx="4"
                    fill={isSkipped ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}
                    stroke={isSkipped ? '#EF4444' : '#22C55E'}
                    strokeWidth="1.5"
                  />
                  <text x={x} y={trackY - 17} textAnchor="middle" fill={isSkipped ? '#EF4444' : '#22C55E'} fontSize="10" fontFamily="monospace">
                    printf
                  </text>
                  <text x={x} y={trackY + 24} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12" fontFamily="monospace">
                    i={i + 1}
                  </text>

                  {/* Trampoline at skip station — bigger arc */}
                  {isSkipped && (
                    <g>
                      <motion.path
                        d={`M ${x - 25} ${trackY - 42} Q ${x} ${trackY - 70} ${x + 25} ${trackY - 42}`}
                        stroke="#F59E0B"
                        strokeWidth="3"
                        fill="none"
                        animate={{ d: bouncing
                          ? `M ${x - 25} ${trackY - 42} Q ${x} ${trackY - 95} ${x + 25} ${trackY - 42}`
                          : `M ${x - 25} ${trackY - 42} Q ${x} ${trackY - 70} ${x + 25} ${trackY - 42}`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <text x={x} y={trackY - 74} textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">
                        continue
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Bit character — bigger */}
          <motion.div
            className="absolute"
            animate={{
              x: iteration > 0 ? stationX(Math.min(iteration, TOTAL) - 1) - 12 : 20,
              y: bouncing ? trackY - 110 : trackY - 75,
            }}
            transition={bouncing ? { type: 'spring', stiffness: 200 } : { duration: 0.5 }}
          >
            <BitCharacter mood={bouncing ? 'excited' : 'happy'} size={55} color="#00BFFF" />
          </motion.div>
        </div>

        {/* Output */}
        <div className="flex gap-3 font-code text-2xl">
          {output.map((val, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={val === null ? 'text-dim' : ''}
              style={{ color: val !== null ? '#22C55E' : undefined }}
            >
              {val !== null ? val : '_'}
            </motion.span>
          ))}
        </div>

        {/* Code panel */}
        <div className="w-full max-w-lg rounded-lg overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#0d0d1a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
            <span className="ml-2 text-xs font-code text-dim">continue_example.c</span>
          </div>
          {/* Code lines */}
          <div className="px-4 py-3 font-code text-sm leading-7">
            {codeLines.map((line, idx) => {
              const isActive = activeLine === idx;
              return (
                <div
                  key={idx}
                  className="px-2 rounded transition-colors duration-300"
                  style={{
                    background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid #8B5CF6' : '3px solid transparent',
                  }}
                >
                  <span className="text-dim opacity-40 mr-3 select-none">{idx + 1}</span>
                  {idx === 0 && (
                    <>
                      <span style={{ color: '#8B5CF6' }}>for</span>
                      <span className="text-dim">(i=1; i&lt;=5; i++) {'{'}</span>
                    </>
                  )}
                  {idx === 1 && (
                    <>
                      <span className="text-dim">{'  '}</span>
                      <span style={{ color: '#8B5CF6' }}>if</span>
                      <span className="text-dim">(i==3) </span>
                      <span style={{ color: '#F59E0B' }}>continue</span>
                      <span className="text-dim">;</span>
                    </>
                  )}
                  {idx === 2 && (
                    <>
                      <span className="text-dim">{'  '}</span>
                      <span style={{ color: '#22C55E' }}>printf</span>
                      <span className="text-dim">(&quot;%d &quot;, i);</span>
                    </>
                  )}
                  {idx === 3 && (
                    <span className="text-dim">{'}'}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <GlowBox color="#EF4444" intensity={0.3} className="flex-1">
            <div className="text-xs font-code text-center">
              <div style={{ color: '#EF4444' }} className="font-bold mb-1">break</div>
              <div className="text-dim">Exits the loop entirely</div>
              <div className="text-dim mt-1">Output: 1 2 3 4</div>
              <div className="text-dim text-xs opacity-60">Loop stops at break</div>
            </div>
          </GlowBox>
          <GlowBox color="#F59E0B" intensity={0.3} className="flex-1">
            <div className="text-xs font-code text-center">
              <div style={{ color: '#F59E0B' }} className="font-bold mb-1">continue</div>
              <div className="text-dim">Skips one iteration</div>
              <div className="text-dim mt-1">Output: 1 2 _ 4 5</div>
              <div className="text-dim text-xs opacity-60">Loop continues after skip</div>
            </div>
          </GlowBox>
        </div>
      </div>
    </div>
  );
}
