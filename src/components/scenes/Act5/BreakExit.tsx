'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const TRACK_R = 100;
const CX = 140;
const CY = 150;
const TOTAL_ITERS = 7;
const BREAK_AT = 5;

export default function BreakExit() {
  const [iteration, setIteration] = useState(1);
  const [angle, setAngle] = useState(-90);
  const [broken, setBroken] = useState(false);
  const [output, setOutput] = useState<number[]>([]);
  const [crumbled, setCrumbled] = useState<number[]>([]);
  const { scaledTimeout, scaledInterval } = useAnimationSpeed();

  useEffect(() => {
    if (broken) return;
    if (iteration > TOTAL_ITERS) return;

    const cancelTimer = scaledTimeout(() => {
      const targetAngle = -90 + ((iteration - 1) / TOTAL_ITERS) * 360;
      setAngle(targetAngle);

      if (iteration === BREAK_AT) {
        setBroken(true);
        // Crumble track segments
        const cancelCrumble = scaledInterval(() => {
          setCrumbled(prev => {
            if (prev.length >= 12) {
              cancelCrumble();
              return prev;
            }
            return [...prev, prev.length];
          });
        }, 100);
        return;
      }

      setOutput(prev => [...prev, iteration]);
      setIteration(prev => prev + 1);
    }, 1000);

    return () => cancelTimer();
  }, [iteration, broken, scaledTimeout, scaledInterval]);

  const bitRad = (angle * Math.PI) / 180;
  const bitX = broken ? CX + TRACK_R + 80 : CX + TRACK_R * Math.cos(bitRad);
  const bitY = broken ? CY : CY + TRACK_R * Math.sin(bitRad);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 max-w-4xl">
        {/* Track scene */}
        <div className="relative" style={{ width: 320, height: 320 }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            {/* Track segments */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a1 = (i / 12) * 360 - 90;
              const a2 = ((i + 1) / 12) * 360 - 90;
              const r1 = (a1 * Math.PI) / 180;
              const r2 = (a2 * Math.PI) / 180;
              const isCrumbled = crumbled.includes(i);
              return (
                <motion.line
                  key={i}
                  x1={CX + TRACK_R * Math.cos(r1)}
                  y1={CY + TRACK_R * Math.sin(r1)}
                  x2={CX + TRACK_R * Math.cos(r2)}
                  y2={CY + TRACK_R * Math.sin(r2)}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  animate={isCrumbled ? { opacity: 0, scale: 0.5, y: 30 } : {}}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* Track dashes */}
            <circle cx={CX} cy={CY} r={TRACK_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="20" strokeDasharray="6 8" />

            {/* EXIT door at break point */}
            {iteration >= BREAK_AT - 1 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <rect x={CX + TRACK_R + 10} y={CY - 25} width="50" height="50" rx="5" fill="#EF4444" opacity="0.8" />
                <text x={CX + TRACK_R + 35} y={CY - 5} textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold">EXIT</text>
                <text x={CX + TRACK_R + 35} y={CY + 10} textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">break;</text>
              </motion.g>
            )}
          </svg>

          {/* Bit character */}
          <motion.div
            className="absolute"
            animate={{ x: bitX - 25, y: bitY - 30 }}
            transition={broken ? { type: 'spring', stiffness: 80 } : { duration: 0.6 }}
          >
            <BitCharacter mood={broken ? 'excited' : 'happy'} size={50} color="#00BFFF" />
          </motion.div>
        </div>

        {/* Output + Code */}
        <div className="flex flex-col gap-4 w-72">
          {/* Output */}
          <GlowBox color="#22C55E" intensity={0.3}>
            <div className="text-xs font-code text-dim mb-1">Output:</div>
            <div className="flex gap-2 font-code text-lg flex-wrap">
              {output.map(n => (
                <motion.span
                  key={n}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ color: '#22C55E' }}
                >
                  {n}
                </motion.span>
              ))}
              {broken && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="text-red line-through"
                >
                  {BREAK_AT}
                </motion.span>
              )}
            </div>
            {broken && (
              <motion.div
                className="text-xs text-red mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {BREAK_AT} never prints -- break exits first!
              </motion.div>
            )}
          </GlowBox>

          {/* Code */}
          <GlowBox color="#8B5CF6" intensity={0.3}>
            <pre className="font-code text-xs leading-relaxed">
              <span style={{ color: '#8B5CF6' }}>for</span>
              <span className="text-dim">(int i=1; i&lt;={TOTAL_ITERS}; i++) {'{'}</span>{'\n'}
              <span className="text-dim">{'  '}</span>
              <span style={{ color: '#8B5CF6' }}>if</span>
              <span className="text-dim">(i == {BREAK_AT})</span>{'\n'}
              <motion.span
                style={{ color: '#EF4444' }}
                animate={broken ? { textShadow: ['0 0 4px #EF4444', '0 0 12px #EF4444', '0 0 4px #EF4444'] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {'    '}break;
              </motion.span>{'\n'}
              <span className="text-dim">{'  '}printf(&quot;%d &quot;, i);</span>{'\n'}
              <span className="text-dim">{'}'}</span>
            </pre>
          </GlowBox>

          <motion.p
            className="text-dim text-xs font-body text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 3 }}
          >
            break immediately exits the loop -- no more iterations run.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
