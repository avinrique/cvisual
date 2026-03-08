'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
type GateType = 'AND' | 'OR' | 'NOT';

export default function LogicGates() {
  const [activeGate, setActiveGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState(true);
  const [inputB, setInputB] = useState(true);

  const getResult = () => {
    switch (activeGate) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
    }
  };

  const result = getResult();

  const codeSnippets: Record<GateType, string> = {
    AND: `int a = ${inputA ? 1 : 0}, b = ${inputB ? 1 : 0};
if (a && b) {
  // Both must be true
  // ${inputA ? '1' : '0'} && ${inputB ? '1' : '0'} = ${result ? '1 (TRUE)' : '0 (FALSE)'}
}

// Real example:
if (age >= 18 && age <= 60) {
  printf("Working age");
}`,
    OR: `int a = ${inputA ? 1 : 0}, b = ${inputB ? 1 : 0};
if (a || b) {
  // Either can be true
  // ${inputA ? '1' : '0'} || ${inputB ? '1' : '0'} = ${result ? '1 (TRUE)' : '0 (FALSE)'}
}

// Real example:
if (isStudent || isSenior) {
  printf("Discount!");
}`,
    NOT: `int a = ${inputA ? 1 : 0};
if (!a) {
  // Flips the value
  // !${inputA ? '1' : '0'} = ${result ? '1 (TRUE)' : '0 (FALSE)'}
}

// Real example:
if (!isLoggedIn) {
  printf("Please log in");
}`,
  };

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #111835 0%, #080c1a 100%)' }}
    >
      {/* Gate selector tabs */}
      <div className="flex gap-4">
        {(['AND', 'OR', 'NOT'] as GateType[]).map(gate => (
          <motion.button
            key={gate}
            onClick={(e) => { e.stopPropagation(); setActiveGate(gate); setInputA(true); setInputB(true); }}
            className="px-6 py-2 rounded-lg font-display text-sm border transition-all"
            style={{
              background: activeGate === gate ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
              borderColor: activeGate === gate ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
              color: activeGate === gate ? '#8B5CF6' : 'rgba(255,255,255,0.5)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {gate}
          </motion.button>
        ))}
      </div>

      {/* Gate visualization */}
      <div className="relative w-full max-w-lg h-56 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeGate === 'AND' && (
            <motion.div
              key="and"
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Two doors in sequence */}
              <BitCharacter mood={result ? 'happy' : 'neutral'} size={40} color="#00BFFF" label="Bit" />

              <div className="flex items-center gap-2">
                {/* Door A */}
                <div className="relative">
                  <div className="w-16 h-32 rounded-lg border-2 flex flex-col items-center justify-center overflow-hidden"
                    style={{
                      borderColor: inputA ? '#22C55E' : '#EF4444',
                      background: inputA ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: inputA ? 'transparent' : 'rgba(239,68,68,0.15)', originX: 0 }}
                      animate={{ scaleX: inputA ? 0 : 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                    <span className="font-code text-xs z-10" style={{ color: inputA ? '#22C55E' : '#EF4444' }}>
                      Door A
                    </span>
                    <span className="font-code text-lg font-bold z-10" style={{ color: inputA ? '#22C55E' : '#EF4444' }}>
                      {inputA ? 'OPEN' : 'SHUT'}
                    </span>
                  </div>
                  <motion.button
                    className="mt-2 px-3 py-1 rounded text-xs font-code border"
                    style={{
                      borderColor: inputA ? '#22C55E' : '#EF4444',
                      color: inputA ? '#22C55E' : '#EF4444',
                      background: inputA ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setInputA(!inputA); }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Toggle A ({inputA ? '1' : '0'})
                  </motion.button>
                </div>

                <span className="font-display text-2xl text-purple-400 mx-1">&&</span>

                {/* Door B */}
                <div className="relative">
                  <div className="w-16 h-32 rounded-lg border-2 flex flex-col items-center justify-center overflow-hidden"
                    style={{
                      borderColor: inputB ? '#22C55E' : '#EF4444',
                      background: inputB ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: inputB ? 'transparent' : 'rgba(239,68,68,0.15)', originX: 0 }}
                      animate={{ scaleX: inputB ? 0 : 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                    <span className="font-code text-xs z-10" style={{ color: inputB ? '#22C55E' : '#EF4444' }}>
                      Door B
                    </span>
                    <span className="font-code text-lg font-bold z-10" style={{ color: inputB ? '#22C55E' : '#EF4444' }}>
                      {inputB ? 'OPEN' : 'SHUT'}
                    </span>
                  </div>
                  <motion.button
                    className="mt-2 px-3 py-1 rounded text-xs font-code border"
                    style={{
                      borderColor: inputB ? '#22C55E' : '#EF4444',
                      color: inputB ? '#22C55E' : '#EF4444',
                      background: inputB ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setInputB(!inputB); }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Toggle B ({inputB ? '1' : '0'})
                  </motion.button>
                </div>
              </div>

              {/* Result arrow */}
              <motion.div className="flex flex-col items-center gap-1 ml-2">
                <motion.span
                  className="text-3xl"
                  animate={{ x: result ? [0, 5, 0] : 0, opacity: result ? 1 : 0.3 }}
                  transition={{ duration: 1, repeat: result ? Infinity : 0 }}
                >
                  {'\u2192'}
                </motion.span>
                <span className="font-code text-sm font-bold" style={{ color: result ? '#22C55E' : '#EF4444' }}>
                  {result ? 'PASS' : 'BLOCKED'}
                </span>
              </motion.div>
            </motion.div>
          )}

          {activeGate === 'OR' && (
            <motion.div
              key="or"
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <BitCharacter mood={result ? 'happy' : 'sad'} size={40} color="#00BFFF" label="Bit" />

              <div className="flex flex-col items-center gap-2">
                {/* Two side-by-side doors */}
                <div className="flex gap-3">
                  {/* Door A */}
                  <div
                    className="w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer"
                    style={{
                      borderColor: inputA ? '#22C55E' : '#EF4444',
                      background: inputA ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.08)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setInputA(!inputA); }}
                  >
                    <span className="font-code text-xs" style={{ color: inputA ? '#22C55E' : '#EF4444' }}>Path A</span>
                    <span className="font-code text-lg font-bold" style={{ color: inputA ? '#22C55E' : '#EF4444' }}>
                      {inputA ? 'OPEN' : 'SHUT'}
                    </span>
                    <span className="font-code text-xs mt-1 opacity-60">({inputA ? '1' : '0'})</span>
                  </div>

                  <span className="font-display text-xl text-purple-400 self-center">||</span>

                  {/* Door B */}
                  <div
                    className="w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer"
                    style={{
                      borderColor: inputB ? '#22C55E' : '#EF4444',
                      background: inputB ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.08)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setInputB(!inputB); }}
                  >
                    <span className="font-code text-xs" style={{ color: inputB ? '#22C55E' : '#EF4444' }}>Path B</span>
                    <span className="font-code text-lg font-bold" style={{ color: inputB ? '#22C55E' : '#EF4444' }}>
                      {inputB ? 'OPEN' : 'SHUT'}
                    </span>
                    <span className="font-code text-xs mt-1 opacity-60">({inputB ? '1' : '0'})</span>
                  </div>
                </div>

                <span className="text-xs text-dim font-body">Click doors to toggle</span>
              </div>

              <motion.div className="flex flex-col items-center gap-1 ml-2">
                <motion.span
                  className="text-3xl"
                  animate={{ x: result ? [0, 5, 0] : 0, opacity: result ? 1 : 0.3 }}
                  transition={{ duration: 1, repeat: result ? Infinity : 0 }}
                >
                  {'\u2192'}
                </motion.span>
                <span className="font-code text-sm font-bold" style={{ color: result ? '#22C55E' : '#EF4444' }}>
                  {result ? 'PASS' : 'BLOCKED'}
                </span>
              </motion.div>
            </motion.div>
          )}

          {activeGate === 'NOT' && (
            <motion.div
              key="not"
              className="flex items-center gap-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Input side */}
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-display font-bold cursor-pointer"
                  style={{
                    borderColor: inputA ? '#22C55E' : '#EF4444',
                    color: inputA ? '#22C55E' : '#EF4444',
                    background: inputA ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  }}
                  onClick={(e) => { e.stopPropagation(); setInputA(!inputA); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {inputA ? '1' : '0'}
                </motion.div>
                <span className="font-code text-xs text-dim">Input (click)</span>
              </div>

              {/* Mirror / NOT gate */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  className="w-24 h-36 rounded-lg border-2 border-purple-400/50 flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
                    boxShadow: '0 0 30px rgba(139,92,246,0.2)',
                  }}
                >
                  <motion.span
                    className="font-display text-5xl font-bold"
                    style={{ color: '#8B5CF6' }}
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    !
                  </motion.span>
                </motion.div>
                <span className="font-code text-xs text-purple-400 mt-1">NOT Gate</span>
                <span className="font-code text-xs text-dim">Flips the bit</span>
              </div>

              {/* Output side */}
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  key={result ? 'res-1' : 'res-0'}
                  className="w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-display font-bold"
                  style={{
                    borderColor: result ? '#22C55E' : '#EF4444',
                    color: result ? '#22C55E' : '#EF4444',
                    background: result ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  }}
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {result ? '1' : '0'}
                </motion.div>
                <span className="font-code text-xs text-dim">Output</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result banner */}
      <motion.div
        key={`${activeGate}-${inputA}-${inputB}`}
        className="px-6 py-2 rounded-lg font-code text-sm"
        style={{
          background: `${result ? '#22C55E' : '#EF4444'}15`,
          border: `1px solid ${result ? '#22C55E' : '#EF4444'}40`,
          color: result ? '#22C55E' : '#EF4444',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {activeGate === 'NOT'
          ? `!${inputA ? '1' : '0'} = ${result ? '1 (TRUE)' : '0 (FALSE)'}`
          : `${inputA ? '1' : '0'} ${activeGate === 'AND' ? '&&' : '||'} ${inputB ? '1' : '0'} = ${result ? '1 (TRUE)' : '0 (FALSE)'}`
        }
      </motion.div>

      <InteractiveIndicator />

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Terminal title="logic.c" width="w-80" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed whitespace-pre">
            <code style={{ color: result ? '#22C55E' : '#EF4444' }}>
              {codeSnippets[activeGate]}
            </code>
          </pre>
        </Terminal>
      </motion.div>

      <Narration text={
        activeGate === 'AND' ? 'AND (&&) requires BOTH conditions true -- like two doors in a row.' :
        activeGate === 'OR' ? 'OR (||) needs just ONE condition true -- like two paths, either works.' :
        'NOT (!) flips the value -- a mirror that turns 1 to 0 and 0 to 1.'
      } />
    </div>
  );
}
