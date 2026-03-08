'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const TOTAL = 5;
const SKIP_AT = 3;

export default function ContinueTrampoline() {
  const [iteration, setIteration] = useState(0);
  const [output, setOutput] = useState<(number | null)[]>([]);
  const [bouncing, setBouncing] = useState(false);
  const [phase, setPhase] = useState<'running' | 'done'>('running');
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    if (phase === 'done') return;
    if (iteration >= TOTAL) {
      setPhase('done');
      return;
    }

    const cancelTimer = scaledTimeout(() => {
      const next = iteration + 1;
      setIteration(next);

      if (next === SKIP_AT) {
        setBouncing(true);
        setOutput(prev => [...prev, null]); // gap
        scaledTimeout(() => setBouncing(false), 800);
      } else {
        setOutput(prev => [...prev, next]);
      }
    }, 1200);

    return () => cancelTimer();
  }, [iteration, phase, scaledTimeout]);

  // Track positions for stations
  const stationX = (i: number) => 40 + i * 70;
  const trackY = 120;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
        <motion.h2
          className="font-display text-xl"
          style={{ color: '#FFD700' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          continue: The Trampoline
        </motion.h2>

        {/* Track scene */}
        <div className="relative w-full max-w-lg h-52">
          <svg width="100%" height="200" viewBox="0 0 420 200" preserveAspectRatio="xMidYMid meet">
            {/* Track */}
            <line x1="20" y1={trackY} x2="400" y2={trackY} stroke="rgba(255,255,255,0.15)" strokeWidth="6" />

            {/* Printf stations */}
            {Array.from({ length: TOTAL }).map((_, i) => {
              const x = stationX(i);
              const isSkipped = i + 1 === SKIP_AT;
              return (
                <g key={i}>
                  <rect x={x - 15} y={trackY - 30} width="30" height="25" rx="3"
                    fill={isSkipped ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}
                    stroke={isSkipped ? '#EF4444' : '#22C55E'}
                    strokeWidth="1"
                  />
                  <text x={x} y={trackY - 13} textAnchor="middle" fill={isSkipped ? '#EF4444' : '#22C55E'} fontSize="8" fontFamily="monospace">
                    printf
                  </text>
                  <text x={x} y={trackY + 20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                    i={i + 1}
                  </text>

                  {/* Trampoline at skip station */}
                  {isSkipped && (
                    <g>
                      <motion.path
                        d={`M ${x - 20} ${trackY - 35} Q ${x} ${trackY - 55} ${x + 20} ${trackY - 35}`}
                        stroke="#F59E0B"
                        strokeWidth="3"
                        fill="none"
                        animate={{ d: bouncing
                          ? `M ${x - 20} ${trackY - 35} Q ${x} ${trackY - 70} ${x + 20} ${trackY - 35}`
                          : `M ${x - 20} ${trackY - 35} Q ${x} ${trackY - 55} ${x + 20} ${trackY - 35}`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <text x={x} y={trackY - 58} textAnchor="middle" fill="#F59E0B" fontSize="8" fontFamily="monospace">
                        continue
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Bit character */}
          <motion.div
            className="absolute"
            animate={{
              x: iteration > 0 ? stationX(Math.min(iteration, TOTAL) - 1) - 5 : 20,
              y: bouncing ? trackY - 80 : trackY - 55,
            }}
            transition={bouncing ? { type: 'spring', stiffness: 200 } : { duration: 0.5 }}
          >
            <BitCharacter mood={bouncing ? 'excited' : 'happy'} size={40} color="#00BFFF" />
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

        {/* Code */}
        <GlowBox color="#8B5CF6" intensity={0.2}>
          <pre className="font-code text-xs leading-relaxed text-center">
            <span style={{ color: '#8B5CF6' }}>for</span>
            <span className="text-dim">(int i=1; i&lt;=5; i++) {'{'} </span>
            <span style={{ color: '#8B5CF6' }}>if</span>
            <span className="text-dim">(i==3) </span>
            <span style={{ color: '#F59E0B' }}>continue</span>
            <span className="text-dim">; printf(&quot;%d &quot;, i); {'}'}</span>
          </pre>
        </GlowBox>
      </div>
    </div>
  );
}
