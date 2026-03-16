'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

/* ── Code panel helper ─────────────────────────────────────── */
interface Segment { text: string; color: string }
interface CodeLine { segments: Segment[] }

function CodePanel({
  lines, activeLine, title, titleColor, accentColor,
}: {
  lines: CodeLine[];
  activeLine: number; // -1 = none
  title: string;
  titleColor: string;
  accentColor: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(10,12,30,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
        <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
        <span className="font-code text-[10px] ml-1" style={{ color: titleColor }}>{title}</span>
      </div>
      {/* Code body */}
      <div className="px-2 py-2 font-code text-xs leading-[1.7]">
        {lines.map((line, i) => {
          const isActive = i === activeLine;
          return (
            <div
              key={i}
              className="flex items-center transition-all duration-150"
              style={{
                opacity: activeLine === -1 ? 0.7 : isActive ? 1 : 0.35,
                borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                paddingLeft: 6,
                background: isActive ? `${accentColor}15` : 'transparent',
              }}
            >
              <span className="flex-1 whitespace-pre">
                {line.segments.map((seg, j) => (
                  <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                ))}
              </span>
              {isActive && <span className="text-[10px] ml-1" style={{ color: accentColor }}>◀</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Clock code lines builder (dynamic h, m values) ────────── */
function buildClockCode(h: number, m: number): CodeLine[] {
  const P = '#8B5CF6'; // purple (keywords)
  const G = '#FFD700'; // gold (outer var)
  const B = '#00BFFF'; // blue (inner var)
  const D = 'rgba(255,255,255,0.5)'; // dim
  const S = '#F59E0B'; // string

  return [
    { segments: [
      { text: 'for', color: P }, { text: ' (', color: D },
      { text: 'int ', color: P }, { text: `h = ${h}`, color: G },
      { text: '; h < 12; h++) {', color: D },
    ]},
    { segments: [
      { text: '  ', color: D }, { text: 'for', color: P }, { text: ' (', color: D },
      { text: 'int ', color: P }, { text: `m = ${m}`, color: B },
      { text: '; m < 12; m++)', color: D },
    ]},
    { segments: [
      { text: '    tick(', color: D },
      { text: `h, m`, color: G },
      { text: ');', color: D },
    ]},
    { segments: [
      { text: '  ', color: D },
      { text: 'printf', color: P },
      { text: '(', color: D },
      { text: '"Hour %d done\\n"', color: S },
      { text: ', h);', color: D },
    ]},
    { segments: [
      { text: '}', color: D },
    ]},
  ];
}

/* ── Star pattern code lines builder (dynamic i, j, rows) ──── */
function buildStarCode(i: number, j: number, rows: number): CodeLine[] {
  const P = '#8B5CF6';
  const Gr = '#22C55E'; // green
  const D = 'rgba(255,255,255,0.5)';
  const S = '#F59E0B';

  return [
    { segments: [
      { text: 'for', color: P }, { text: ' (', color: D },
      { text: 'int ', color: P }, { text: `i = ${i}`, color: Gr },
      { text: `; i <= ${rows}; i++) {`, color: D },
    ]},
    { segments: [
      { text: '  ', color: D }, { text: 'for', color: P }, { text: ' (', color: D },
      { text: 'int ', color: P }, { text: `j = ${j}`, color: Gr },
      { text: '; j <= i; j++)', color: D },
    ]},
    { segments: [
      { text: '    ', color: D }, { text: 'printf', color: P },
      { text: '(', color: D }, { text: '"*"', color: S }, { text: ');', color: D },
    ]},
    { segments: [
      { text: '  ', color: D }, { text: 'printf', color: P },
      { text: '(', color: D }, { text: '"\\n"', color: S }, { text: ');', color: D },
    ]},
    { segments: [
      { text: '}', color: D },
    ]},
  ];
}

/* ── Which line is executing? ──────────────────────────────── */
// Clock lines: 0=outer for, 1=inner for, 2=tick(), 3=printf hour done, 4=closing }
function getClockActiveLine(running: boolean, finished: boolean, m: number): number {
  if (!running && !finished) return -1; // idle
  if (finished) return 4; // done
  if (m === 0) return 0; // just entered outer loop
  return 2; // ticking inner
}

// Star lines: 0=outer for, 1=inner for, 2=printf *, 3=printf \n, 4=closing }
// We track currentRow (i) and currentStar (j) during the build
// Active line: during star print → line 2, after row complete → line 3, at new row start → line 1

export default function NestedLoopClock() {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [running, setRunning] = useState(false);
  const [clockFinished, setClockFinished] = useState(false);

  const [rows, setRows] = useState(5);
  const [starPattern, setStarPattern] = useState<string[]>([]);
  const [starRow, setStarRow] = useState(0);   // current i (1-based in code, 0-based internally)
  const [starCol, setStarCol] = useState(0);   // current j
  const [starBuilding, setStarBuilding] = useState(false);
  const [starDone, setStarDone] = useState(false);
  const starRowRef = useRef(0);

  const { scaledTimeout, scaledInterval } = useAnimationSpeed();

  // Clock animation
  useEffect(() => {
    if (!running) return;
    setClockFinished(false);
    const cancelInterval = scaledInterval(() => {
      setMinute(prev => {
        if (prev >= 11) {
          setHour(h => {
            if (h >= 11) {
              setRunning(false);
              setClockFinished(true);
              return 11;
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

  // Star pattern builder — track row/col for code tracing
  const buildPattern = useCallback(() => {
    setStarPattern([]);
    setStarBuilding(true);
    setStarDone(false);
    starRowRef.current = 0;
    setStarRow(1);
    setStarCol(1);

    const buildRow = () => {
      const r = starRowRef.current;
      if (r >= rows) {
        setStarBuilding(false);
        setStarDone(true);
        return;
      }
      setStarRow(r + 1); // 1-based for display
      setStarCol(r + 1); // j goes up to i, show final j
      setStarPattern(prev => [...prev, '*'.repeat(r + 1)]);
      starRowRef.current = r + 1;
      scaledTimeout(buildRow, 400);
    };
    buildRow();
  }, [rows, scaledTimeout]);

  useEffect(() => {
    buildPattern();
  }, [rows, buildPattern]);

  // Clock geometry
  const hourAngle = (hour / 12) * 360 - 90;
  const minuteAngle = (minute / 12) * 360 - 90;
  const CR = 90;
  const CCX = 110;
  const CCY = 110;

  // Active lines for code panels
  const clockActiveLine = running ? (minute === 0 ? 1 : 2) : clockFinished ? 4 : -1;
  const starActiveLine = starBuilding ? 2 : starDone ? 4 : -1;

  const clockCode = buildClockCode(hour, minute);
  const starCode = buildStarCode(starRow, starCol, rows);

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col lg:flex-row items-start gap-8 max-w-5xl w-full">

        {/* ═══ LEFT: Clock section ═══ */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <motion.h3
            className="font-display text-lg"
            style={{ color: '#FFD700' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nested Loops: The Clock
          </motion.h3>

          {/* Clock SVG */}
          <div className="relative" style={{ width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx={CCX} cy={CCY} r={CR} fill="rgba(17,22,51,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />

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

              <motion.line
                x1={CCX} y1={CCY}
                x2={CCX + 45 * Math.cos((hourAngle * Math.PI) / 180)}
                y2={CCY + 45 * Math.sin((hourAngle * Math.PI) / 180)}
                stroke="#FFD700" strokeWidth="4" strokeLinecap="round"
              />
              <motion.line
                x1={CCX} y1={CCY}
                x2={CCX + 65 * Math.cos((minuteAngle * Math.PI) / 180)}
                y2={CCY + 65 * Math.sin((minuteAngle * Math.PI) / 180)}
                stroke="#00BFFF" strokeWidth="2" strokeLinecap="round"
              />
              <circle cx={CCX} cy={CCY} r="4" fill="#FFD700" />

              <text x={CCX} y={20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                outer: hours (h)
              </text>
              <text x={CCX} y={215} textAnchor="middle" fill="rgba(0,191,255,0.6)" fontSize="10" fontFamily="monospace">
                inner: minutes (m)
              </text>
            </svg>
          </div>

          {/* Run button + status */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); setHour(0); setMinute(0); setClockFinished(false); setRunning(true); }}
              disabled={running}
              className="px-4 py-1.5 rounded text-xs font-code bg-gold/20 border border-gold/40 text-amber hover:bg-gold/30 disabled:opacity-30 transition"
            >
              {running ? `h=${hour} m=${minute}` : clockFinished ? '▶ Run Again' : '▶ Run Clock'}
            </button>
            {running && (
              <span className="font-code text-[11px] text-dim">
                tick #{hour * 12 + minute + 1} / 144
              </span>
            )}
          </div>

          {/* Clock Code Panel */}
          <CodePanel
            lines={clockCode}
            activeLine={clockActiveLine}
            title="clock.c"
            titleColor="#FFD700"
            accentColor="#FFD700"
          />
        </div>

        {/* ═══ RIGHT: Star Pattern section ═══ */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <motion.h3
            className="font-display text-lg"
            style={{ color: '#22C55E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Star Pattern Builder
          </motion.h3>

          {/* Slider */}
          <div className="flex items-center gap-3 w-full max-w-[260px]">
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
            style={{ background: 'rgba(17,22,51,0.9)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            {starPattern.length === 0 && (
              <span className="text-dim text-xs">Building...</span>
            )}
            {starPattern.map((line, i) => (
              <motion.div
                key={`${rows}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ color: '#22C55E' }}
                className="tracking-wider"
              >
                {line.split('').map((star, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 + j * 0.03 }}
                  >
                    {star}
                  </motion.span>
                ))}
                {i === starPattern.length - 1 && starBuilding && (
                  <span className="text-dim text-xs ml-2">← i={i + 1}</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Star Code Panel */}
          <CodePanel
            lines={starCode}
            activeLine={starActiveLine}
            title="pattern.c"
            titleColor="#22C55E"
            accentColor="#22C55E"
          />
        </div>
      </div>

      <InteractiveIndicator className="absolute top-4 right-4" />

      <Narration
        text={
          running
            ? `Outer loop: h = ${hour} (hour ${hour + 1}/12). Inner loop: m = ${minute} (tick ${minute + 1}/12). Total ticks so far: ${hour * 12 + minute + 1}. The inner loop runs completely for EACH outer iteration.`
            : clockFinished
            ? `Done! 12 hours × 12 minutes = 144 total ticks. Nested loops multiply — the inner loop's count × the outer loop's count.`
            : starBuilding
            ? `Building row ${starRow}: the inner loop prints ${starRow} star${starRow > 1 ? 's' : ''}. The outer loop controls rows, the inner loop controls stars per row.`
            : starDone
            ? `Pattern complete! ${rows} rows, with row i printing exactly i stars. Nested loops are perfect for 2D patterns.`
            : 'A clock is a perfect nested loop: the minute hand completes a full cycle for every step of the hour hand. Press "Run Clock" to watch, or adjust the star pattern rows.'
        }
      />
    </div>
  );
}
