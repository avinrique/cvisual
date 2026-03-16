'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const TRACK_R = 170;
const CX = 220;
const CY = 220;
const SVG_SIZE = 440;

const stationAngles = [-90, 30, 150]; // START (top), CHECK (bottom-right), UPDATE (bottom-left)

function angleToXY(deg: number, r = TRACK_R) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export default function ForLoopTrack() {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(5);
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [exited, setExited] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const { scaledTimeout } = useAnimationSpeed();
  const [cumulativeSteps, setCumulativeSteps] = useState(0);

  const stations = [
    { label: `int i=${start}`, color: '#00BFFF', angle: stationAngles[0] },
    { label: `i<=${end}`, color: '#22C55E', angle: stationAngles[1] },
    { label: 'i++', color: '#F59E0B', angle: stationAngles[2] },
  ];

  const reset = useCallback(() => {
    setIteration(0);
    setRunning(false);
    setCurrentStation(0);
    setExited(false);
    setLog([]);
    setCumulativeSteps(0);
  }, []);

  const stepThrough = useCallback(() => {
    if (exited) return;
    if (!running) {
      setRunning(true);
      setIteration(start);
      setCurrentStation(0);
      setCumulativeSteps(0);
      setLog([`int i = ${start};`]);
      return;
    }

    if (currentStation === 0) {
      setCurrentStation(1);
      setCumulativeSteps(s => s + 1);
      const pass = iteration <= end;
      setLog(prev => [...prev, `Check: i(${iteration}) <= ${end}? ${pass ? 'YES' : 'NO'}`]);
      if (!pass) {
        scaledTimeout(() => setExited(true), 500);
      }
    } else if (currentStation === 1 && !exited) {
      setCurrentStation(2);
      setCumulativeSteps(s => s + 1);
      setLog(prev => [...prev, `  printf("%d ", ${iteration}); // Output: ${iteration}`]);
    } else if (currentStation === 2) {
      const next = iteration + 1;
      setIteration(next);
      setLog(prev => [...prev, `i++ => i = ${next}`]);
      setCurrentStation(0);
      setCumulativeSteps(s => s + 1);
      scaledTimeout(() => {
        setCurrentStation(1);
        setCumulativeSteps(s => s + 1);
        const pass = next <= end;
        setLog(prev => [...prev, `Check: i(${next}) <= ${end}? ${pass ? 'YES' : 'NO'}`]);
        if (!pass) {
          scaledTimeout(() => setExited(true), 500);
        }
      }, 600);
    }
  }, [running, currentStation, iteration, start, end, exited, scaledTimeout]);

  const targetRotation = cumulativeSteps * 120;

  // Exit position: to the right of the track, vertically centered
  const exitPos = angleToXY(stationAngles[1]);

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-center gap-10 px-6 max-w-6xl w-full">
        {/* Track — large */}
        <div className="relative flex-shrink-0" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
            {/* Track circle */}
            <circle cx={CX} cy={CY} r={TRACK_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="28" strokeDasharray="10 8" />

            {/* Station markers */}
            {stations.map((s, i) => {
              const pos = angleToXY(s.angle);
              const isActive = running && currentStation === i && !exited;
              return (
                <g key={i}>
                  <circle
                    cx={pos.x} cy={pos.y} r="30"
                    fill="rgba(17,22,51,0.9)"
                    stroke={s.color}
                    strokeWidth={isActive ? 3 : 2}
                    opacity={isActive ? 1 : 0.7}
                  />
                  <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill={s.color} fontSize="12" fontFamily="monospace" fontWeight="bold">
                    {s.label}
                  </text>
                </g>
              );
            })}

            {/* Direction arrows on the track */}
            {[0, 1, 2].map(i => {
              const midAngle = stationAngles[i] + 60;
              const pos = angleToXY(midAngle);
              const tangentAngle = midAngle + 90;
              return (
                <text
                  key={`arrow-${i}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.15)"
                  fontSize="20"
                  transform={`rotate(${tangentAngle}, ${pos.x}, ${pos.y})`}
                >
                  ›
                </text>
              );
            })}

            {/* Exit path — arrow going from CHECK station into the center of the track */}
            {exited && (
              <g>
                <line
                  x1={exitPos.x - 15} y1={exitPos.y - 25}
                  x2={CX + 10} y2={CY - 10}
                  stroke="#EF4444" strokeWidth="3" strokeDasharray="6 4" opacity="0.6"
                />
                <rect x={CX - 27} y={CY - 25} width="55" height="30" rx="5" fill="#EF4444" opacity="0.9" />
                <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">EXIT</text>
              </g>
            )}
          </svg>

          {/* Bit character — orbits on the circle */}
          {!exited ? (
            <div
              className="absolute"
              style={{ left: CX, top: CY, width: 0, height: 0 }}
            >
              <motion.div
                animate={{ rotate: targetRotation }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              >
                <div style={{ position: 'absolute', left: -25, top: -TRACK_R - 25 }}>
                  <motion.div
                    animate={{ rotate: -targetRotation }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  >
                    <BitCharacter mood="excited" size={50} color="#00BFFF" label={`i=${iteration || start}`} />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="absolute"
              initial={{ left: exitPos.x - 25, top: exitPos.y - 25 }}
              animate={{ left: CX - 25, top: CY - 55 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              <BitCharacter mood="happy" size={50} color="#22C55E" label={`i=${iteration}`} />
            </motion.div>
          )}

          {/* Iteration counter */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-surface border border-white/10 font-code text-sm">
            Iteration: <span style={{ color: '#FFD700' }}>{running ? iteration : '-'}</span>
          </div>
        </div>

        {/* Right panel — Controls + Log */}
        <div className="flex flex-col gap-5 flex-1 max-w-sm">
          <GlowBox color="#8B5CF6" intensity={0.3}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-code text-dim w-14">Start:</label>
                <input
                  type="range" min="0" max="5" value={start}
                  onChange={e => { setStart(Number(e.target.value)); reset(); }}
                  className="flex-1 accent-blue"
                />
                <span className="font-code text-lg text-blue font-bold w-8 text-right">{start}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-code text-dim w-14">End:</label>
                <input
                  type="range" min="1" max="10" value={end}
                  onChange={e => { setEnd(Number(e.target.value)); reset(); }}
                  className="flex-1 accent-green"
                />
                <span className="font-code text-lg text-green font-bold w-8 text-right">{end}</span>
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); stepThrough(); }}
                  disabled={exited}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-code bg-blue/20 border border-blue/40 text-blue hover:bg-blue/30 disabled:opacity-30 transition"
                >
                  {!running ? 'Start' : 'Step'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="px-4 py-2 rounded-lg text-sm font-code bg-surface border border-white/10 text-dim hover:text-primary transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </GlowBox>

          {/* for loop code display */}
          <div
            className="rounded-lg px-4 py-3 font-code text-sm border border-white/5"
            style={{ background: 'rgba(17,22,51,0.9)' }}
          >
            <span className="text-purple-400">for</span>
            <span className="text-dim"> (</span>
            <span className="text-blue">int i={start}</span>
            <span className="text-dim">; </span>
            <span className="text-green">i&lt;={end}</span>
            <span className="text-dim">; </span>
            <span className="text-amber">i++</span>
            <span className="text-dim">) {'{'}</span>
            <br />
            <span className="text-dim">  printf(</span>
            <span className="text-green">&quot;%d &quot;</span>
            <span className="text-dim">, i);</span>
            <br />
            <span className="text-dim">{'}'}</span>
          </div>

          {/* Log */}
          <div
            className="rounded-lg p-4 font-code text-xs leading-relaxed overflow-y-auto border border-white/5"
            style={{ background: 'rgba(17,22,51,0.9)', maxHeight: '200px' }}
          >
            {log.length === 0 && <span className="text-dim">Click Start to begin...</span>}
            {log.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={l.includes('NO') ? 'text-red' : l.includes('Output') ? 'text-green' : 'text-dim'}
              >
                {l}
              </motion.div>
            ))}
          </div>

          <InteractiveIndicator />
        </div>
      </div>
    </div>
  );
}
