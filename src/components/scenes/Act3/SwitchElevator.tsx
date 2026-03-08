'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
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
      // Simulate fallthrough: light up all floors from match downward
      const matchIdx = FLOORS.findIndex(f => f.op === selectedOp);
      const fallFloors: number[] = [];
      for (let i = matchIdx; i < FLOORS.length; i++) {
        fallFloors.push(FLOORS[i].level);
      }
      fallFloors.push(0); // basement
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

  const breakStr = hasBreak ? '\n    break;' : '\n    // no break! FALLS THROUGH!';

  const code = `switch (op) {
  case '+':
    result = ${numA} + ${numB};${selectedOp === '+' ? breakStr : '\n    break;'}
  case '-':
    result = ${numA} - ${numB};${selectedOp === '-' ? breakStr : '\n    break;'}
  case '*':
    result = ${numA} * ${numB};${selectedOp === '*' ? breakStr : '\n    break;'}
  case '/':
    result = ${numA} / ${numB};${selectedOp === '/' ? breakStr : '\n    break;'}
  default:
    printf("Invalid op");
}`;

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex items-center justify-center gap-8 p-6"
      style={{ background: 'linear-gradient(180deg, #0a0c18 0%, #101428 50%, #0a0c18 100%)' }}
    >
      {/* Elevator shaft */}
      <div className="relative flex flex-col items-center">
        {/* Floor indicators */}
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
                {/* Floor button */}
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

                {/* Floor label */}
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

                {/* Elevator car indicator */}
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
      </div>

      {/* Controls panel */}
      <div className="flex flex-col items-center gap-4">
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
        <motion.div
          className="flex flex-col items-center gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
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
        </motion.div>

        <InteractiveIndicator />
      </div>

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Terminal title="calculator.c" width="w-80" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed whitespace-pre">
            <code>{code.split('\n').map((line, i) => {
              const matchLine = (() => {
                const opIdx = FLOORS.findIndex(f => f.op === selectedOp);
                return 1 + opIdx * 3;
              })();
              const isMatchCase = i === matchLine || i === matchLine + 1;
              const hasFallthrough = !hasBreak && line.includes('FALLS THROUGH');
              return (
                <span key={i} style={{
                  color: hasFallthrough ? '#EF4444' : isMatchCase ? '#FFD700' : 'rgba(255,255,255,0.5)',
                  fontWeight: isMatchCase ? 'bold' : 'normal',
                }}>
                  {line}{'\n'}
                </span>
              );
            })}</code>
          </pre>
        </Terminal>
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
