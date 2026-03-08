'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
export default function RoadFork() {
  const [age, setAge] = useState(18);
  const eligible = age >= 18;

  const code = `int age = ${age};

if (age >= 18) {
  printf("Eligible to vote!");${eligible ? '  // <-- runs' : ''}
} else {
  printf("Not eligible yet.");${!eligible ? '  // <-- runs' : ''}
}`;

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0c1020 0%, #141e30 50%, #0c1020 100%)' }}
    >
      {/* Scene: path that forks */}
      <div className="relative w-full max-w-2xl h-80">
        <svg viewBox="0 0 600 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Main path */}
          <path d="M 50 250 Q 200 250 300 180" stroke="#4a4a5a" strokeWidth="30" fill="none" strokeLinecap="round" />

          {/* Left fork (eligible) */}
          <motion.path
            d="M 300 180 Q 370 130 500 80"
            stroke={eligible ? '#22C55E' : '#333'}
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
            animate={{ stroke: eligible ? '#22C55E' : '#2a2a3a' }}
            transition={{ duration: 0.5 }}
          />
          {/* Left fork glow */}
          {eligible && (
            <motion.path
              d="M 300 180 Q 370 130 500 80"
              stroke="#22C55E"
              strokeWidth="28"
              fill="none"
              strokeLinecap="round"
              strokeOpacity={0.15}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Right fork (not eligible) */}
          <motion.path
            d="M 300 180 Q 370 220 500 260"
            stroke={!eligible ? '#F59E0B' : '#2a2a3a'}
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
            animate={{ stroke: !eligible ? '#F59E0B' : '#2a2a3a' }}
            transition={{ duration: 0.5 }}
          />

          {/* Barrier on left if not eligible */}
          <AnimatePresence>
            {!eligible && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <rect x="380" y="90" width="60" height="8" rx="4" fill="#EF4444" />
                <rect x="380" y="100" width="60" height="8" rx="4" fill="white" />
                <rect x="380" y="110" width="60" height="8" rx="4" fill="#EF4444" />
                <rect x="375" y="85" width="6" height="40" fill="#888" />
                <rect x="439" y="85" width="6" height="40" fill="#888" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Signpost at fork */}
          <rect x="290" y="130" width="4" height="55" fill="#8B7355" />
          <rect x="260" y="120" width="70" height="24" rx="3" fill="#5a4a2a" stroke="#8B7355" strokeWidth="1" />
          <text x="295" y="136" textAnchor="middle" fill="#FFD700" fontSize="10" fontFamily="monospace" fontWeight="bold">
            age {'>'}= 18 ?
          </text>

          {/* Left label */}
          <motion.g animate={{ opacity: eligible ? 1 : 0.3 }} transition={{ duration: 0.3 }}>
            <rect x="440" y="50" width="120" height="28" rx="6" fill="rgba(34,197,94,0.2)" stroke="#22C55E" strokeWidth="1" />
            <text x="500" y="68" textAnchor="middle" fill="#22C55E" fontSize="11" fontFamily="monospace">
              Eligible to vote!
            </text>
          </motion.g>

          {/* Right label */}
          <motion.g animate={{ opacity: !eligible ? 1 : 0.3 }} transition={{ duration: 0.3 }}>
            <rect x="440" y="240" width="120" height="28" rx="6" fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1" />
            <text x="500" y="258" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="monospace">
              Not eligible
            </text>
          </motion.g>
        </svg>

        {/* BitCharacter walking */}
        <motion.div
          className="absolute"
          animate={{
            left: eligible ? '75%' : '75%',
            top: eligible ? '15%' : '70%',
          }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        >
          <BitCharacter
            mood={eligible ? 'happy' : 'sad'}
            size={45}
            color={eligible ? '#22C55E' : '#F59E0B'}
            label={`age=${age}`}
          />
        </motion.div>
      </div>

      {/* Age slider */}
      <motion.div
        className="flex flex-col items-center gap-3 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <span className="font-code text-sm text-dim">age =</span>
          <input
            type="range"
            min={1}
            max={100}
            value={age}
            onChange={e => setAge(parseInt(e.target.value))}
            className="w-48 accent-blue-500"
          />
          <motion.span
            key={age}
            className="font-display text-2xl font-bold w-12 text-center"
            style={{ color: eligible ? '#22C55E' : '#F59E0B' }}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {age}
          </motion.span>
        </div>

        <motion.span
          className="font-code text-xs px-3 py-1 rounded"
          style={{
            background: eligible ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
            color: eligible ? '#22C55E' : '#F59E0B',
            border: `1px solid ${eligible ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}
        >
          {age} {'>'}= 18 is {eligible ? 'TRUE' : 'FALSE'}
        </motion.span>

        <InteractiveIndicator />
      </motion.div>

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Terminal title="voting.c" width="w-72" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed whitespace-pre">
            <code>{code.split('\n').map((line, i) => {
              const isActive = eligible ? i === 3 : i === 5;
              return (
                <span key={i} style={{
                  color: isActive ? (eligible ? '#22C55E' : '#F59E0B') : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}>
                  {line}{'\n'}
                </span>
              );
            })}</code>
          </pre>
        </Terminal>
      </motion.div>

      <Narration text="if/else is a fork in the road. The condition decides which path your program walks." />
    </div>
  );
}
