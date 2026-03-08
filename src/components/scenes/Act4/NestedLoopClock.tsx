'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

export default function NestedLoopClock() {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState(5);
  const [starPattern, setStarPattern] = useState<string[]>([]);
  const { scaledTimeout, scaledInterval } = useAnimationSpeed();
  // Clock animation
  useEffect(() => {
    if (!running) return;
    const cancelInterval = scaledInterval(() => {
      setMinute(prev => {
        if (prev >= 11) {
          setHour(h => {
            if (h >= 11) {
              setRunning(false);
              return 0;
            }
            return h + 1;
          });
          return 0;
        }
        return prev + 1;
      });
    }, 150);
    return () => cancelInterval();
  }, [running, scaledInterval]);

  // Star pattern builder
  const buildPattern = useCallback(() => {
    setStarPattern([]);
    let row = 0;
    const build = () => {
      if (row >= rows) {
        return;
      }
      setStarPattern(prev => [...prev, '*'.repeat(row + 1)]);
      row++;
      scaledTimeout(build, 400);
    };
    build();
  }, [rows, scaledTimeout]);

  useEffect(() => {
    buildPattern();
  }, [rows, buildPattern]);

  const hourAngle = (hour / 12) * 360 - 90;
  const minuteAngle = (minute / 12) * 360 - 90;
  const CR = 90;
  const CCX = 110;
  const CCY = 110;

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 max-w-4xl">
        {/* Clock */}
        <div className="flex flex-col items-center gap-4">
          <motion.h3
            className="font-display text-lg"
            style={{ color: '#FFD700' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nested Loops: The Clock
          </motion.h3>

          <div className="relative" style={{ width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* Clock face */}
              <circle cx={CCX} cy={CCY} r={CR} fill="rgba(17,22,51,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />

              {/* Hour markers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const x1 = CCX + (CR - 8) * Math.cos(rad);
                const y1 = CCY + (CR - 8) * Math.sin(rad);
                const x2 = CCX + (CR - 18) * Math.cos(rad);
                const y2 = CCY + (CR - 18) * Math.sin(rad);
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={i <= hour && running ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={i % 3 === 0 ? 3 : 1}
                  />
                );
              })}

              {/* Hour hand */}
              <motion.line
                x1={CCX} y1={CCY}
                x2={CCX + 45 * Math.cos((hourAngle * Math.PI) / 180)}
                y2={CCY + 45 * Math.sin((hourAngle * Math.PI) / 180)}
                stroke="#FFD700" strokeWidth="4" strokeLinecap="round"
              />

              {/* Minute hand */}
              <motion.line
                x1={CCX} y1={CCY}
                x2={CCX + 65 * Math.cos((minuteAngle * Math.PI) / 180)}
                y2={CCY + 65 * Math.sin((minuteAngle * Math.PI) / 180)}
                stroke="#00BFFF" strokeWidth="2" strokeLinecap="round"
              />

              {/* Center dot */}
              <circle cx={CCX} cy={CCY} r="4" fill="#FFD700" />

              {/* Labels */}
              <text x={CCX} y={20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                outer: hours (i)
              </text>
              <text x={CCX} y={215} textAnchor="middle" fill="rgba(0,191,255,0.6)" fontSize="10" fontFamily="monospace">
                inner: minutes (j)
              </text>
            </svg>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setHour(0); setMinute(0); setRunning(true); }}
            disabled={running}
            className="px-4 py-1.5 rounded text-xs font-code bg-gold/20 border border-gold/40 text-amber hover:bg-gold/30 disabled:opacity-30 transition"
          >
            {running ? `Hour ${hour + 1}, Min ${minute + 1}` : 'Run Clock'}
          </button>

          <GlowBox color="#8B5CF6" intensity={0.2}>
            <pre className="font-code text-xs leading-relaxed">
              <span style={{ color: '#8B5CF6' }}>for</span><span className="text-dim">(</span>
              <span style={{ color: '#FFD700' }}>h=0</span>
              <span className="text-dim">; h&lt;12; h++) {'{'}</span>{'\n'}
              <span className="text-dim">{'  '}</span>
              <span style={{ color: '#8B5CF6' }}>for</span><span className="text-dim">(</span>
              <span style={{ color: '#00BFFF' }}>m=0</span>
              <span className="text-dim">; m&lt;60; m++)</span>{'\n'}
              <span className="text-dim">{'    '}tick();</span>{'\n'}
              <span className="text-dim">{'}'}</span>
            </pre>
          </GlowBox>
        </div>

        {/* Star pattern */}
        <div className="flex flex-col items-center gap-4">
          <motion.h3
            className="font-display text-lg"
            style={{ color: '#22C55E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Star Pattern Builder
          </motion.h3>

          {/* Slider */}
          <div className="flex items-center gap-3 w-full">
            <label className="text-xs font-code text-dim">Rows:</label>
            <input
              type="range" min="1" max="10" value={rows}
              onChange={e => setRows(Number(e.target.value))}
              className="flex-1 accent-green"
            />
            <span className="font-code text-sm text-green w-6">{rows}</span>
          </div>

          {/* Pattern display */}
          <div
            className="rounded-lg p-4 font-code text-lg min-w-[200px] min-h-[150px]"
            style={{ background: 'rgba(17,22,51,0.9)' }}
          >
            {starPattern.map((line, i) => (
              <motion.div
                key={`${rows}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ color: '#22C55E' }}
                className="tracking-wider"
              >
                {line.split('').map((star, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + j * 0.05 }}
                  >
                    {star}
                  </motion.span>
                ))}
              </motion.div>
            ))}
          </div>

          <GlowBox color="#22C55E" intensity={0.2}>
            <pre className="font-code text-xs leading-relaxed">
              <span style={{ color: '#8B5CF6' }}>for</span>
              <span className="text-dim">(i=1; i&lt;={rows}; i++) {'{'}</span>{'\n'}
              <span className="text-dim">{'  '}</span>
              <span style={{ color: '#8B5CF6' }}>for</span>
              <span className="text-dim">(j=1; j&lt;=i; j++)</span>{'\n'}
              <span className="text-dim">{'    '}printf(&quot;*&quot;);</span>{'\n'}
              <span className="text-dim">{'  '}printf(&quot;\n&quot;);</span>{'\n'}
              <span className="text-dim">{'}'}</span>
            </pre>
          </GlowBox>
        </div>
      </div>

      <InteractiveIndicator className="absolute top-4 right-4" />
    </div>
  );
}
