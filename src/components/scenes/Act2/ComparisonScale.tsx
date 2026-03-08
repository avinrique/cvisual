'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
type Op = '==' | '!=' | '>' | '<' | '>=' | '<=';

const OPERATORS: { op: Op; label: string }[] = [
  { op: '==', label: 'equals' },
  { op: '!=', label: 'not equals' },
  { op: '>', label: 'greater than' },
  { op: '<', label: 'less than' },
  { op: '>=', label: 'greater or equal' },
  { op: '<=', label: 'less or equal' },
];

function evaluate(a: number, op: Op, b: number): boolean {
  switch (op) {
    case '==': return a === b;
    case '!=': return a !== b;
    case '>': return a > b;
    case '<': return a < b;
    case '>=': return a >= b;
    case '<=': return a <= b;
  }
}

export default function ComparisonScale() {
  const [selectedOp, setSelectedOp] = useState<Op>('==');
  const [numA, setNumA] = useState(5);
  const [numB, setNumB] = useState(3);
  const [animKey, setAnimKey] = useState(0);

  const result = useMemo(() => evaluate(numA, selectedOp, numB), [numA, selectedOp, numB]);

  const tilt = numA === numB ? 0 : numA > numB ? -12 : 12;
  const resultColor = result ? '#22C55E' : '#EF4444';

  const handleChange = (op?: Op, a?: number, b?: number) => {
    if (op) setSelectedOp(op);
    if (a !== undefined) setNumA(a);
    if (b !== undefined) setNumB(b);
    setAnimKey(k => k + 1);
  };

  const code = `int a = ${numA}, b = ${numB};
if (a ${selectedOp} b) {
  printf("True");   // ${result ? 'This runs!' : 'Skipped'}
} else {
  printf("False");  // ${result ? 'Skipped' : 'This runs!'}
}
// Result: ${result ? 'TRUE (1)' : 'FALSE (0)'}`;

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center gap-6"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #141830 0%, #0a0e1a 100%)' }}
    >
      {/* Operator buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {OPERATORS.map(({ op, label }) => (
          <motion.button
            key={op}
            onClick={(e) => { e.stopPropagation(); handleChange(op); }}
            className="px-4 py-2 rounded-lg border transition-all flex flex-col items-center gap-1"
            style={{
              background: selectedOp === op ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
              borderColor: selectedOp === op ? '#FFD700' : 'rgba(255,255,255,0.1)',
              color: selectedOp === op ? '#FFD700' : 'rgba(255,255,255,0.6)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-code text-lg">{op}</span>
            <span className="text-[10px] font-body opacity-60">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Scale SVG */}
      <div className="relative w-80 h-56">
        <svg viewBox="0 0 320 220" className="w-full h-full">
          {/* Base */}
          <polygon points="130,200 190,200 170,180 150,180" fill="#8B7355" />
          {/* Pillar */}
          <rect x="155" y="60" width="10" height="120" fill="#9B8365" rx="2" />
          {/* Fulcrum */}
          <polygon points="150,60 170,60 160,50" fill="#FFD700" />

          {/* Beam */}
          <motion.g
            key={animKey}
            animate={{ rotate: tilt }}
            transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.2 }}
            style={{ transformOrigin: '160px 55px' }}
          >
            <rect x="30" y="52" width="260" height="6" rx="3" fill="linear-gradient(90deg, #b8962e, #FFD700, #b8962e)" />
            <rect x="30" y="52" width="260" height="6" rx="3" fill="#d4a820" />

            {/* Left chain */}
            <line x1="60" y1="58" x2="60" y2="90" stroke="#b8962e" strokeWidth="2" />
            <line x1="40" y1="58" x2="40" y2="90" stroke="#b8962e" strokeWidth="2" />
            {/* Left platform */}
            <rect x="25" y="90" width="50" height="8" rx="4" fill="#c4a030" />

            {/* Right chain */}
            <line x1="260" y1="58" x2="260" y2="90" stroke="#b8962e" strokeWidth="2" />
            <line x1="280" y1="58" x2="280" y2="90" stroke="#b8962e" strokeWidth="2" />
            {/* Right platform */}
            <rect x="245" y="90" width="50" height="8" rx="4" fill="#c4a030" />

            {/* Number A */}
            <motion.text
              x="50" y="85"
              textAnchor="middle"
              className="font-display"
              fill="#00BFFF"
              fontSize="22"
              fontWeight="bold"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 85, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              {numA}
            </motion.text>

            {/* Number B */}
            <motion.text
              x="270" y="85"
              textAnchor="middle"
              className="font-display"
              fill="#F59E0B"
              fontSize="22"
              fontWeight="bold"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 85, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {numB}
            </motion.text>
          </motion.g>

          {/* Operator display */}
          <text x="160" y="145" textAnchor="middle" fill="#FFD700" fontSize="20" fontFamily="monospace" fontWeight="bold">
            {selectedOp}
          </text>
        </svg>

        {/* Result badge */}
        <motion.div
          key={`${animKey}-result`}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
        >
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              background: `${resultColor}22`,
              border: `2px solid ${resultColor}`,
              color: resultColor,
              boxShadow: `0 0 20px ${resultColor}44`,
            }}
          >
            {result ? '\u2713' : '\u2717'}
          </motion.div>
          <span className="font-code text-sm" style={{ color: resultColor }}>
            {result ? 'TRUE (1)' : 'FALSE (0)'}
          </span>
        </motion.div>
      </div>

      {/* Number inputs */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="font-code text-xs" style={{ color: '#00BFFF' }}>a</span>
          <input
            type="range"
            min={0}
            max={20}
            value={numA}
            onChange={e => handleChange(undefined, parseInt(e.target.value))}
            className="w-28 accent-sky-500"
          />
          <span className="font-code text-sm text-white/80">{numA}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-code text-xs" style={{ color: '#F59E0B' }}>b</span>
          <input
            type="range"
            min={0}
            max={20}
            value={numB}
            onChange={e => handleChange(undefined, undefined, parseInt(e.target.value))}
            className="w-28 accent-amber-500"
          />
          <span className="font-code text-sm text-white/80">{numB}</span>
        </div>
      </div>

      <InteractiveIndicator className="mt-1" />

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Terminal title="compare.c" width="w-72" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed whitespace-pre">
            <code style={{ color: resultColor }}>{code}</code>
          </pre>
        </Terminal>
      </motion.div>

      <Narration text="Comparison operators weigh two values and return true (1) or false (0)." />
    </div>
  );
}
