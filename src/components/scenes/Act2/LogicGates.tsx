'use client';
import { useState, useEffect, useRef } from 'react';
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
  const [animKey, setAnimKey] = useState(0);

  const getResult = () => {
    switch (activeGate) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
    }
  };

  const result = getResult();

  // Trigger walk animation on any input change
  const toggleA = () => { setInputA(v => !v); setAnimKey(k => k + 1); };
  const toggleB = () => { setInputB(v => !v); setAnimKey(k => k + 1); };
  const switchGate = (gate: GateType) => {
    setActiveGate(gate);
    setInputA(true);
    setInputB(true);
    setAnimKey(k => k + 1);
  };

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
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center gap-5 p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #111835 0%, #080c1a 100%)' }}
    >
      {/* Gate selector tabs */}
      <div className="flex gap-4">
        {(['AND', 'OR', 'NOT'] as GateType[]).map(gate => (
          <motion.button
            key={gate}
            onClick={(e) => { e.stopPropagation(); switchGate(gate); }}
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
      <div className="relative w-full max-w-2xl h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeGate === 'AND' && (
            <AndGateViz
              key="and"
              inputA={inputA}
              inputB={inputB}
              result={result}
              toggleA={toggleA}
              toggleB={toggleB}
              animKey={animKey}
            />
          )}

          {activeGate === 'OR' && (
            <OrGateViz
              key="or"
              inputA={inputA}
              inputB={inputB}
              result={result}
              toggleA={toggleA}
              toggleB={toggleB}
              animKey={animKey}
            />
          )}

          {activeGate === 'NOT' && (
            <NotGateViz
              key="not"
              inputA={inputA}
              result={result}
              toggleA={toggleA}
              animKey={animKey}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Result banner */}
      <motion.div
        key={`${activeGate}-${inputA}-${inputB}-${animKey}`}
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

/* ── Door component ── */
function Door({ label, isOpen, onToggle, color }: {
  label: string; isOpen: boolean; onToggle: () => void; color: { open: string; shut: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-16 h-36 rounded-lg border-2 flex items-center justify-center overflow-hidden"
        style={{
          borderColor: isOpen ? color.open : color.shut,
          background: isOpen ? `${color.open}18` : `${color.shut}12`,
        }}
      >
        {/* Door panel that swings open */}
        <motion.div
          className="absolute inset-0 rounded-md"
          style={{
            background: isOpen ? 'transparent' : `${color.shut}20`,
            transformOrigin: 'left center',
          }}
          animate={{
            rotateY: isOpen ? -90 : 0,
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 18 }}
        />
        {/* Door content */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="font-code text-xs" style={{ color: isOpen ? color.open : color.shut }}>
            {label}
          </span>
          <motion.span
            key={isOpen ? 'open' : 'shut'}
            className="font-code text-base font-bold"
            style={{ color: isOpen ? color.open : color.shut }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {isOpen ? 'OPEN' : 'SHUT'}
          </motion.span>
          <span className="font-code text-xs opacity-50">({isOpen ? '1' : '0'})</span>
        </div>
      </div>
      <motion.button
        className="px-3 py-1 rounded text-xs font-code border"
        style={{
          borderColor: isOpen ? color.open : color.shut,
          color: isOpen ? color.open : color.shut,
          background: isOpen ? `${color.open}15` : `${color.shut}15`,
        }}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        whileTap={{ scale: 0.9 }}
      >
        Toggle ({isOpen ? '1' : '0'})
      </motion.button>
    </div>
  );
}

/* ── AND Gate: Two doors in series, Bit walks left→right ── */
function AndGateViz({ inputA, inputB, result, toggleA, toggleB, animKey }: {
  inputA: boolean; inputB: boolean; result: boolean;
  toggleA: () => void; toggleB: () => void; animKey: number;
}) {
  // Bit position: start → door A → between → door B → end
  // Stops at first closed door
  const getBitX = () => {
    if (!inputA) return 0;        // blocked at door A
    if (!inputB) return 140;      // passed A, blocked at B
    return 280;                   // passed both
  };

  const bitX = getBitX();
  const blocked = !result;
  const blockedAtA = !inputA;
  const blockedAtB = inputA && !inputB;

  return (
    <motion.div
      className="relative flex items-center justify-center w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{ height: 220 }}
    >
      {/* Hallway floor */}
      <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-white/5 rounded" />

      {/* Bit character walking */}
      <motion.div
        key={animKey}
        className="absolute z-20"
        style={{ top: '50%', transform: 'translateY(-100%)' }}
        initial={{ left: '8%' }}
        animate={{ left: `calc(8% + ${bitX}px)` }}
        transition={{ type: 'spring', stiffness: 50, damping: 14, delay: 0.15 }}
      >
        <BitCharacter
          mood={result ? 'happy' : blocked ? 'sad' : 'neutral'}
          size={40}
          color="#00BFFF"
          label="Bit"
        />
        {/* Bump/blocked indicator */}
        {blocked && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-code whitespace-nowrap"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {blockedAtA ? 'Blocked at A!' : 'Blocked at B!'}
          </motion.div>
        )}
      </motion.div>

      {/* Door A */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 60px)', top: '50%', transform: 'translateY(-55%)' }}>
        <Door label="Door A" isOpen={inputA} onToggle={toggleA} color={{ open: '#22C55E', shut: '#EF4444' }} />
      </div>

      {/* && symbol */}
      <div className="absolute z-10 font-display text-2xl text-purple-400" style={{ left: 'calc(8% + 115px)', top: '50%', transform: 'translateY(-50%)' }}>
        &&
      </div>

      {/* Door B */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 170px)', top: '50%', transform: 'translateY(-55%)' }}>
        <Door label="Door B" isOpen={inputB} onToggle={toggleB} color={{ open: '#22C55E', shut: '#EF4444' }} />
      </div>

      {/* Finish flag */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 290px)', top: '50%', transform: 'translateY(-50%)' }}>
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ opacity: result ? 1 : 0.2 }}
        >
          <motion.span
            className="text-3xl"
            animate={result ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, repeat: result ? Infinity : 0, repeatDelay: 1 }}
          >
            🏁
          </motion.span>
          <span className="font-code text-xs font-bold" style={{ color: result ? '#22C55E' : '#EF4444' }}>
            {result ? 'PASS!' : 'BLOCKED'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── OR Gate: Two parallel paths, Bit takes whichever is open ── */
function OrGateViz({ inputA, inputB, result, toggleA, toggleB, animKey }: {
  inputA: boolean; inputB: boolean; result: boolean;
  toggleA: () => void; toggleB: () => void; animKey: number;
}) {
  // Bit chooses: if A open → go top path, else if B open → go bottom path, else stuck
  const chosenPath = inputA ? 'A' : inputB ? 'B' : null;

  // Bit Y: path A is top (-55px), path B is bottom (+55px), start is middle (0)
  const bitTargetY = chosenPath === 'A' ? -55 : chosenPath === 'B' ? 55 : 0;
  const bitTargetX = chosenPath ? 260 : 0;

  return (
    <motion.div
      className="relative flex items-center justify-center w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{ height: 240 }}
    >
      {/* Two parallel path lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ left: '8%', width: '84%', height: '100%' }}>
        {/* Path A (top) */}
        <path
          d="M 30 120 C 80 120, 80 60, 130 60 L 250 60 C 280 60, 280 120, 310 120"
          fill="none"
          stroke={inputA ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        {/* Path B (bottom) */}
        <path
          d="M 30 120 C 80 120, 80 180, 130 180 L 250 180 C 280 180, 280 120, 310 120"
          fill="none"
          stroke={inputB ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Bit character */}
      <motion.div
        key={animKey}
        className="absolute z-20"
        style={{ top: '50%', left: '8%' }}
        initial={{ x: 0, y: -20 }}
        animate={{ x: bitTargetX, y: bitTargetY - 20 }}
        transition={{ type: 'spring', stiffness: 40, damping: 12, delay: 0.2 }}
      >
        <BitCharacter
          mood={result ? 'happy' : 'sad'}
          size={40}
          color="#00BFFF"
          label="Bit"
        />
        {!result && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-code whitespace-nowrap"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Both shut!
          </motion.div>
        )}
      </motion.div>

      {/* Door A (top path) */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 120px)', top: '12%' }}>
        <Door label="Path A" isOpen={inputA} onToggle={toggleA} color={{ open: '#22C55E', shut: '#EF4444' }} />
      </div>

      {/* || symbol */}
      <div className="absolute z-10 font-display text-2xl text-purple-400" style={{ left: 'calc(8% + 95px)', top: '50%', transform: 'translateY(-50%)' }}>
        ||
      </div>

      {/* Door B (bottom path) */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 120px)', bottom: '2%' }}>
        <Door label="Path B" isOpen={inputB} onToggle={toggleB} color={{ open: '#22C55E', shut: '#EF4444' }} />
      </div>

      {/* Finish */}
      <div className="absolute z-10" style={{ left: 'calc(8% + 290px)', top: '50%', transform: 'translateY(-50%)' }}>
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ opacity: result ? 1 : 0.2 }}
        >
          <motion.span
            className="text-3xl"
            animate={result ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, repeat: result ? Infinity : 0, repeatDelay: 1 }}
          >
            🏁
          </motion.span>
          <span className="font-code text-xs font-bold" style={{ color: result ? '#22C55E' : '#EF4444' }}>
            {result ? 'PASS!' : 'BLOCKED'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── NOT Gate: Mirror that flips the bit ── */
function NotGateViz({ inputA, result, toggleA, animKey }: {
  inputA: boolean; result: boolean; toggleA: () => void; animKey: number;
}) {
  return (
    <motion.div
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
          onClick={(e) => { e.stopPropagation(); toggleA(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {inputA ? '1' : '0'}
        </motion.div>
        <span className="font-code text-xs text-dim">Input (click)</span>
      </div>

      {/* Arrow in */}
      <motion.span className="text-2xl text-dim" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        {'\u2192'}
      </motion.span>

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

      {/* Arrow out */}
      <motion.span className="text-2xl text-dim" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        {'\u2192'}
      </motion.span>

      {/* Output side */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={`${result}-${animKey}`}
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
  );
}
