'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

type Operator = '+' | '-' | '*' | '/';

interface Floor {
  op: Operator;
  label: string;
  level: number;
}

const FLOORS: Floor[] = [
  { op: '+', label: 'Addition', level: 4 },
  { op: '-', label: 'Subtraction', level: 3 },
  { op: '*', label: 'Multiplication', level: 2 },
  { op: '/', label: 'Division', level: 1 },
];

function compute(a: number, op: Operator, b: number): string {
  switch (op) {
    case '+': return String(a + b);
    case '-': return String(a - b);
    case '*': return String(a * b);
    case '/': return b === 0 ? 'Error: /0' : String(+(a / b).toFixed(2));
  }
}

// Code lines for the panel — each case has: case line, body line, break line
// Line 0:  switch (op) {
// Line 1:    case '+':
// Line 2:      result = a + b;
// Line 3:      break;
// Line 4:    case '-':
// Line 5:      result = a - b;
// Line 6:      break;
// Line 7:    case '*':
// Line 8:      result = a * b;
// Line 9:      break;
// Line 10:   case '/':
// Line 11:     result = a / b;
// Line 12:     break;
// Line 13:   default:
// Line 14:     printf("Invalid");
// Line 15: }

const OP_LINE_MAP: Record<Operator, { caseLine: number; bodyLine: number; breakLine: number }> = {
  '+': { caseLine: 1, bodyLine: 2, breakLine: 3 },
  '-': { caseLine: 4, bodyLine: 5, breakLine: 6 },
  '*': { caseLine: 7, bodyLine: 8, breakLine: 9 },
  '/': { caseLine: 10, bodyLine: 11, breakLine: 12 },
};

export default function SwitchElevator() {
  const [selectedOp, setSelectedOp] = useState<Operator>('+');
  const [numA, setNumA] = useState(10);
  const [numB, setNumB] = useState(3);
  const [hasBreak, setHasBreak] = useState(true);
  const [animatingFloor, setAnimatingFloor] = useState(4);
  const [fallthroughFloors, setFallthroughFloors] = useState<number[]>([]);
  const { scaledTimeout } = useAnimationSpeed();

  const targetFloor = FLOORS.find(f => f.op === selectedOp)!;
  const result = compute(numA, selectedOp, numB);

  // Animate floor changes and fallthrough
  useEffect(() => {
    setFallthroughFloors([]);
    setAnimatingFloor(targetFloor.level);

    if (!hasBreak) {
      const matchIdx = FLOORS.findIndex(f => f.op === selectedOp);
      const fallFloors: number[] = [];
      for (let i = matchIdx; i < FLOORS.length; i++) {
        fallFloors.push(FLOORS[i].level);
      }
      fallFloors.push(0);
      const cleanups: (() => void)[] = [];
      fallFloors.forEach((fl, i) => {
        cleanups.push(scaledTimeout(() => {
          setAnimatingFloor(fl);
          setFallthroughFloors(fallFloors.slice(0, i + 1));
        }, i * 500));
      });
      return () => cleanups.forEach(fn => fn());
    }
  }, [selectedOp, hasBreak, targetFloor.level, scaledTimeout]);

  // Build code lines dynamically with current values
  const buildCodeLines = () => {
    const ops: { op: Operator; symbol: string }[] = [
      { op: '+', symbol: '+' },
      { op: '-', symbol: '-' },
      { op: '*', symbol: '*' },
      { op: '/', symbol: '/' },
    ];

    const lines: { segments: { text: string; color: string }[] }[] = [
      {
        segments: [
          { text: 'switch', color: 'var(--accent-purple)' },
          { text: ' (op) {', color: 'var(--text-dim)' },
        ],
      },
    ];

    for (const o of ops) {
      const r = compute(numA, o.op, numB);
      const isNoBreak = !hasBreak && o.op === selectedOp;
      lines.push({
        segments: [
          { text: '  ', color: '' },
          { text: 'case', color: 'var(--accent-purple)' },
          { text: ` '${o.symbol}':`, color: 'var(--accent-green)' },
        ],
      });
      lines.push({
        segments: [
          { text: '    result = ', color: 'var(--text-dim)' },
          { text: `${numA} ${o.symbol} ${numB}`, color: 'var(--accent-blue)' },
          { text: ';', color: 'var(--text-dim)' },
          { text: ` // ${r}`, color: 'var(--text-dim)' },
        ],
      });
      lines.push({
        segments: isNoBreak
          ? [
              { text: '    ', color: '' },
              { text: '// no break!', color: '#EF4444' },
            ]
          : [
              { text: '    ', color: '' },
              { text: 'break', color: 'var(--accent-purple)' },
              { text: ';', color: 'var(--text-dim)' },
            ],
      });
    }

    // default
    lines.push({
      segments: [
        { text: '  ', color: '' },
        { text: 'default', color: 'var(--accent-purple)' },
        { text: ':', color: 'var(--text-dim)' },
      ],
    });
    lines.push({
      segments: [
        { text: '    ', color: '' },
        { text: 'printf', color: 'var(--accent-gold)' },
        { text: '(', color: 'var(--text-dim)' },
        { text: '"Invalid"', color: 'var(--accent-green)' },
        { text: ');', color: 'var(--text-dim)' },
      ],
    });
    lines.push({
      segments: [{ text: '}', color: 'var(--text-dim)' }],
    });

    return lines;
  };

  const codeLines = buildCodeLines();

  // Determine line highlighting state
  const getLineState = (lineIdx: number): 'match' | 'fallthrough' | 'above' | 'below' | 'neutral' => {
    const matched = OP_LINE_MAP[selectedOp];
    const matchIdx = FLOORS.findIndex(f => f.op === selectedOp);

    if (hasBreak) {
      // Only highlight the matched case, body, and break
      if (lineIdx === matched.caseLine || lineIdx === matched.bodyLine || lineIdx === matched.breakLine) return 'match';
      // Cases above: checked and skipped
      for (let i = 0; i < matchIdx; i++) {
        const opInfo = OP_LINE_MAP[FLOORS[i].op];
        if (lineIdx === opInfo.caseLine) return 'above';
      }
      // Everything else
      if (lineIdx > matched.breakLine) return 'below';
      return 'neutral';
    } else {
      // Fallthrough mode: matched case + all below it are active
      for (let i = matchIdx; i < FLOORS.length; i++) {
        const opInfo = OP_LINE_MAP[FLOORS[i].op];
        if (lineIdx === opInfo.caseLine || lineIdx === opInfo.bodyLine || lineIdx === opInfo.breakLine) {
          return i === matchIdx ? 'match' : 'fallthrough';
        }
      }
      // Default line (13, 14) falls through too
      if (!hasBreak && (lineIdx === 13 || lineIdx === 14)) return 'fallthrough';
      // Cases above
      for (let i = 0; i < matchIdx; i++) {
        const opInfo = OP_LINE_MAP[FLOORS[i].op];
        if (lineIdx === opInfo.caseLine) return 'above';
      }
      return 'neutral';
    }
  };

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex items-center justify-center gap-6 p-6"
      style={{ background: 'linear-gradient(180deg, #0a0c18 0%, #101428 50%, #0a0c18 100%)' }}
    >
      {/* Left: Elevator shaft */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex flex-col gap-1">
          {FLOORS.map((floor) => {
            const isTarget = floor.level === targetFloor.level;
            const isFallthrough = fallthroughFloors.includes(floor.level);
            const isCurrentAnim = floor.level === animatingFloor;
            const isActive = hasBreak ? isTarget : isFallthrough;

            return (
              <motion.div
                key={floor.op}
                className="flex items-center gap-3"
                animate={{ opacity: isActive || isTarget ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  className="w-12 h-12 rounded-lg border-2 font-display text-xl font-bold flex items-center justify-center"
                  style={{
                    borderColor: isActive ? '#FFD700' : 'rgba(255,255,255,0.15)',
                    background: isActive ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#FFD700' : 'rgba(255,255,255,0.5)',
                    boxShadow: isActive ? '0 0 15px rgba(255,215,0,0.3)' : 'none',
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedOp(floor.op); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {floor.op}
                </motion.button>

                <div className="flex flex-col">
                  <span className="font-code text-sm" style={{
                    color: isActive ? '#FFD700' : 'rgba(255,255,255,0.4)',
                  }}>
                    Floor {floor.level}: {floor.label}
                  </span>
                  {isTarget && hasBreak && (
                    <motion.span
                      className="font-code text-xs"
                      style={{ color: '#22C55E' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      = {result}
                    </motion.span>
                  )}
                  {isFallthrough && !hasBreak && (
                    <motion.span
                      className="font-code text-xs text-red-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      FALLS THROUGH!
                    </motion.span>
                  )}
                </div>

                {isCurrentAnim && (
                  <motion.div
                    className="ml-2"
                    layoutId="elevator-car"
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  >
                    <BitCharacter
                      mood={hasBreak ? 'happy' : 'scared'}
                      size={30}
                      color={hasBreak ? '#00BFFF' : '#EF4444'}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Basement / Default */}
          <motion.div
            className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10"
            animate={{ opacity: (!hasBreak && fallthroughFloors.includes(0)) ? 1 : 0.3 }}
          >
            <div className="w-12 h-12 rounded-lg border-2 border-red-500/30 bg-red-500/5 flex items-center justify-center">
              <span className="font-code text-xs text-red-400">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-code text-sm text-red-400/70">Basement: Default</span>
              {!hasBreak && fallthroughFloors.includes(0) && (
                <motion.span
                  className="font-code text-xs text-red-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Crashed into default!
                </motion.span>
              )}
            </div>
            {animatingFloor === 0 && (
              <motion.div className="ml-2" layoutId="elevator-car">
                <BitCharacter mood="scared" size={30} color="#EF4444" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Controls: numbers + break toggle */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Number inputs */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="font-code text-xs text-dim mb-1">a</span>
              <input
                type="number"
                value={numA}
                onChange={e => setNumA(Number(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-center font-code text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="font-display text-xl mt-4" style={{ color: '#FFD700' }}>{selectedOp}</span>
            <div className="flex flex-col items-center">
              <span className="font-code text-xs text-dim mb-1">b</span>
              <input
                type="number"
                value={numB}
                onChange={e => setNumB(Number(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-center font-code text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="font-code text-lg mt-4 text-white/60">=</span>
            <motion.span
              key={result}
              className="font-display text-xl font-bold mt-4"
              style={{ color: '#22C55E' }}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {result}
            </motion.span>
          </div>

          {/* Break lever */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-code text-xs text-dim">Break Statement</span>
            <motion.button
              className="relative w-20 h-10 rounded-full border-2 flex items-center px-1"
              style={{
                borderColor: hasBreak ? '#22C55E' : '#EF4444',
                background: hasBreak ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              }}
              onClick={(e) => { e.stopPropagation(); setHasBreak(!hasBreak); }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-7 h-7 rounded-full"
                style={{
                  background: hasBreak ? '#22C55E' : '#EF4444',
                }}
                animate={{ x: hasBreak ? 38 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </motion.button>
            <span className="font-code text-xs" style={{ color: hasBreak ? '#22C55E' : '#EF4444' }}>
              {hasBreak ? 'break; (safe stop)' : 'NO break (fallthrough!)'}
            </span>
          </div>

          <InteractiveIndicator />
        </motion.div>
      </div>

      {/* Right: Code panel */}
      <motion.div
        className="w-80 flex-shrink-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'rgba(17, 22, 51, 0.95)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
            <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
            <span className="text-xs text-dim ml-2 font-code">calculator.c</span>
          </div>

          {/* Code lines */}
          <div className="px-3 py-2 font-code text-xs leading-relaxed max-h-[400px] overflow-y-auto">
            {codeLines.map((line, i) => {
              const state = getLineState(i);
              const isMatch = state === 'match';
              const isFall = state === 'fallthrough';
              const isAbove = state === 'above';
              const isActive = isMatch || isFall;

              return (
                <motion.div
                  key={`${selectedOp}-${hasBreak}-${i}`}
                  className="flex items-center gap-1 px-1.5 py-px rounded"
                  style={{
                    background: isMatch
                      ? 'rgba(255,215,0,0.12)'
                      : isFall
                      ? 'rgba(239,68,68,0.1)'
                      : 'transparent',
                    borderLeft: isMatch
                      ? '3px solid #FFD700'
                      : isFall
                      ? '3px solid #EF4444'
                      : '3px solid transparent',
                  }}
                  animate={{
                    opacity: isActive ? 1 : isAbove ? 0.35 : i === 0 || i === codeLines.length - 1 ? 0.6 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-dim/30 text-[10px] w-4 text-right select-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">
                    {line.segments.map((seg, j) => (
                      <span
                        key={j}
                        style={{
                          color: isMatch ? '#FFD700' : isFall ? '#EF4444' : seg.color,
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {seg.text}
                      </span>
                    ))}
                  </span>
                  {isMatch && (
                    <span className="text-[10px] font-bold text-gold flex-shrink-0">◀</span>
                  )}
                  {isFall && (
                    <span className="text-[10px] font-bold text-red flex-shrink-0">↓</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <Narration
        text={
          hasBreak
            ? 'switch jumps to the matching case. break; stops it there -- like pressing your floor button.'
            : 'Without break, execution falls through ALL remaining cases -- like an elevator with no brakes!'
        }
      />
    </div>
  );
}
