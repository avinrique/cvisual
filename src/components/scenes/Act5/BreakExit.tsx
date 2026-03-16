'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

const TRACK_R = 170;
const CX = 220;
const CY = 220;
const TOTAL_ITERS = 7;
const BREAK_AT = 5;
const MAX_PHASE = 5;

const CODE_LINES = [
  { text: 'for(i=1; i<=7; i++) {', lineType: 'for' },
  { text: '  if(i==5) break;', lineType: 'break' },
  { text: '  printf("%d ", i);', lineType: 'printf' },
  { text: '}', lineType: 'close' },
];

export default function BreakExit() {
  const [iteration, setIteration] = useState(0);
  const [angle, setAngle] = useState(-90);
  const [broken, setBroken] = useState(false);
  const [output, setOutput] = useState<number[]>([]);
  const [crumbled, setCrumbled] = useState<number[]>([]);
  const { scaledInterval } = useAnimationSpeed();

  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const phaseRef = useRef(iteration);
  phaseRef.current = iteration;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= BREAK_AT) return false;
    setIteration(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (phaseRef.current <= 0) return false;
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

  // React to iteration changes
  useEffect(() => {
    if (iteration === 0) return;

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
  }, [iteration, scaledInterval]);

  const bitRad = (angle * Math.PI) / 180;
  const bitX = broken ? CX + TRACK_R + 80 : CX + TRACK_R * Math.cos(bitRad);
  const bitY = broken ? CY : CY + TRACK_R * Math.sin(bitRad);

  // Determine which code line to highlight
  const getHighlightLine = (): number => {
    if (iteration === 0) return -1;
    if (iteration >= 1 && iteration <= 4) return 2; // printf line
    if (iteration === 5) return 1; // break line
    return -1;
  };
  const highlightLine = getHighlightLine();

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 max-w-5xl">
        {/* Track scene */}
        <div className="relative flex-shrink-0" style={{ width: 440, height: 440 }}>
          <svg width="440" height="440" viewBox="0 0 440 440">
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
                <rect x={CX + TRACK_R + 10} y={CY - 30} width="60" height="60" rx="5" fill="#EF4444" opacity="0.8" />
                <text x={CX + TRACK_R + 40} y={CY - 5} textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">EXIT</text>
                <text x={CX + TRACK_R + 40} y={CY + 12} textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace">break;</text>
              </motion.g>
            )}
          </svg>

          {/* Bit character */}
          <motion.div
            className="absolute top-0 left-0"
            animate={{ x: bitX - 30, y: bitY - 35 }}
            transition={broken ? { type: 'spring', stiffness: 80 } : { duration: 0.6 }}
          >
            <BitCharacter mood={broken ? 'excited' : 'happy'} size={60} color="#00BFFF" />
          </motion.div>
        </div>

        {/* Code panel + output */}
        <motion.div
          className="w-80 flex-shrink-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Code panel */}
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
              <span className="text-xs text-dim ml-2 font-code">break_exit.c</span>
            </div>

            {/* Code lines */}
            <div className="px-3 py-3 font-code text-xs leading-relaxed">
              {CODE_LINES.map((line, i) => {
                const isHighlighted = highlightLine === i;

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-1.5 py-0.5 rounded transition-colors duration-300"
                    style={{
                      background: isHighlighted ? 'rgba(255,215,0,0.1)' : 'transparent',
                      borderLeft: isHighlighted ? '2px solid var(--accent-gold, #FFD700)' : '2px solid transparent',
                    }}
                  >
                    <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                      {line.lineType === 'for' && (
                        <>
                          <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>for</span>
                          <span className="text-dim">(i=1; i&lt;=7; i++) {'{'}</span>
                        </>
                      )}
                      {line.lineType === 'break' && (
                        <>
                          <span className="text-dim">{'  '}</span>
                          <span style={{ color: 'var(--accent-purple, #8B5CF6)' }}>if</span>
                          <span className="text-dim">(i==5) </span>
                          <motion.span
                            style={{ color: '#EF4444' }}
                            animate={broken ? { textShadow: ['0 0 4px #EF4444', '0 0 12px #EF4444', '0 0 4px #EF4444'] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            break;
                          </motion.span>
                        </>
                      )}
                      {line.lineType === 'printf' && (
                        <>
                          <span className="text-dim">{'  '}</span>
                          <span style={{ color: 'var(--accent-gold, #FFD700)' }}>printf</span>
                          <span className="text-dim">(</span>
                          <span style={{ color: 'var(--accent-green, #22C55E)' }}>&quot;%d &quot;</span>
                          <span className="text-dim">, i);</span>
                        </>
                      )}
                      {line.lineType === 'close' && (
                        <span className="text-dim">{'}'}</span>
                      )}
                    </span>
                    {isHighlighted && (
                      <motion.span
                        className="text-[10px] font-bold flex-shrink-0"
                        style={{ color: 'var(--accent-gold, #FFD700)' }}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        &#9664;
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Iteration status */}
          <motion.div
            className="mt-3 text-center text-xs font-body text-dim"
            animate={{ opacity: 0.7 }}
          >
            {iteration === 0 && 'Press arrow key to start...'}
            {iteration >= 1 && iteration <= 4 && `Iteration ${iteration}: printing ${iteration}`}
            {iteration === 5 && 'i == 5 -- break fires! Loop exits.'}
          </motion.div>

          {/* Output terminal */}
          <div
            className="mt-4 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30">
              <span className="text-[10px] text-dim font-code">output</span>
            </div>
            <div className="px-3 py-2 font-code text-sm min-h-[2rem]">
              {output.length === 0 && !broken && <span className="text-dim/40">waiting...</span>}
              <div className="flex gap-2 flex-wrap">
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
                    className="line-through"
                    style={{ color: '#EF4444' }}
                  >
                    {BREAK_AT}
                  </motion.span>
                )}
              </div>
              {broken && (
                <motion.div
                  className="text-xs mt-2"
                  style={{ color: '#EF4444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {BREAK_AT} never prints -- break exits first!
                </motion.div>
              )}
            </div>
          </div>

          <motion.p
            className="text-dim text-xs font-body text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
          >
            break immediately exits the loop -- no more iterations run.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
