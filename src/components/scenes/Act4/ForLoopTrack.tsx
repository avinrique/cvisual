'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const TRACK_R = 120;
const CX = 160;
const CY = 160;

const stationAngles = [-90, 30, 150]; // START, CHECK, UPDATE (degrees)

function angleToXY(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + TRACK_R * Math.cos(rad), y: CY + TRACK_R * Math.sin(rad) };
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
  }, []);

  const stepThrough = useCallback(() => {
    if (exited) return;
    if (!running) {
      setRunning(true);
      setIteration(start);
      setCurrentStation(0);
      setLog([`int i = ${start};`]);
      return;
    }

    if (currentStation === 0) {
      // Move to CHECK
      setCurrentStation(1);
      const pass = iteration <= end;
      setLog(prev => [...prev, `Check: i(${iteration}) <= ${end}? ${pass ? 'YES' : 'NO'}`]);
      if (!pass) {
        scaledTimeout(() => setExited(true), 500);
      }
    } else if (currentStation === 1 && !exited) {
      // Execute body, move to UPDATE
      setCurrentStation(2);
      setLog(prev => [...prev, `  printf("%d ", ${iteration}); // Output: ${iteration}`]);
    } else if (currentStation === 2) {
      // Update, go back to CHECK
      const next = iteration + 1;
      setIteration(next);
      setLog(prev => [...prev, `i++ => i = ${next}`]);
      setCurrentStation(0);
      // Auto-advance to check
      scaledTimeout(() => {
        setCurrentStation(1);
        const pass = next <= end;
        setLog(prev => [...prev, `Check: i(${next}) <= ${end}? ${pass ? 'YES' : 'NO'}`]);
        if (!pass) {
          scaledTimeout(() => setExited(true), 500);
        }
      }, 600);
    }
  }, [running, currentStation, iteration, start, end, exited, scaledTimeout]);

  const bitPos = exited
    ? { x: CX + TRACK_R + 60, y: CY }
    : angleToXY(stations[currentStation]?.angle ?? -90);

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex flex-col lg:flex-row items-center gap-8 px-4">
        {/* Track */}
        <div className="relative" style={{ width: 320, height: 320 }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            <circle cx={CX} cy={CY} r={TRACK_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" strokeDasharray="8 6" />

            {stations.map((s, i) => {
              const pos = angleToXY(s.angle);
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r="22" fill="rgba(17,22,51,0.9)" stroke={s.color} strokeWidth="2" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="monospace">
                    {s.label}
                  </text>
                </g>
              );
            })}

            {/* Exit flag */}
            {exited && (
              <g>
                <rect x={CX + TRACK_R + 10} y={CY - 20} width="40" height="25" rx="3" fill="#EF4444" opacity="0.8" />
                <text x={CX + TRACK_R + 30} y={CY - 4} textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">EXIT</text>
              </g>
            )}
          </svg>

          {/* Bit on track */}
          <motion.div
            className="absolute"
            animate={{ x: bitPos.x - 25, y: bitPos.y - 35 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <BitCharacter mood={exited ? 'happy' : 'excited'} size={50} color="#00BFFF" label={`i=${iteration || start}`} />
          </motion.div>

          {/* Iteration counter */}
          <motion.div
            className="absolute top-2 right-2 px-3 py-1 rounded bg-surface border border-white/10 font-code text-xs"
          >
            Iteration: <span style={{ color: '#FFD700' }}>{running ? iteration : '-'}</span>
          </motion.div>
        </div>

        {/* Controls + Log */}
        <div className="flex flex-col gap-4 w-72">
          <GlowBox color="#8B5CF6" intensity={0.3}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-code text-dim w-16">Start:</label>
                <input
                  type="range" min="0" max="5" value={start}
                  onChange={e => { setStart(Number(e.target.value)); reset(); }}
                  className="flex-1 accent-blue"
                />
                <span className="font-code text-sm text-blue w-6">{start}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-code text-dim w-16">End:</label>
                <input
                  type="range" min="1" max="10" value={end}
                  onChange={e => { setEnd(Number(e.target.value)); reset(); }}
                  className="flex-1 accent-green"
                />
                <span className="font-code text-sm text-green w-6">{end}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); stepThrough(); }}
                  disabled={exited}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-code bg-blue/20 border border-blue/40 text-blue hover:bg-blue/30 disabled:opacity-30 transition"
                >
                  {!running ? 'Start' : 'Step'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="px-3 py-1.5 rounded text-xs font-code bg-surface border border-white/10 text-dim hover:text-primary transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </GlowBox>

          {/* Log */}
          <div
            className="rounded-lg p-3 font-code text-xs max-h-40 overflow-y-auto"
            style={{ background: 'rgba(17,22,51,0.9)' }}
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
        </div>
      </div>

      <InteractiveIndicator className="absolute top-4 right-4" />
    </div>
  );
}
