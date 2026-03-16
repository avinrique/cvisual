'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import GlowBox from '@/components/shared/GlowBox';
import { useAppStore } from '@/lib/store';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

type Outcome = 'too-young' | 'no-id' | 'allowed';

function getOutcome(age: number, hasID: number): Outcome {
  if (age < 18) return 'too-young';
  if (hasID !== 1) return 'no-id';
  return 'allowed';
}

const OUTCOME_CONFIG: Record<Outcome, { label: string; color: string; mood: 'happy' | 'sad' | 'neutral' }> = {
  'too-young': { label: 'Too young!', color: '#EF4444', mood: 'sad' },
  'no-id': { label: 'No ID!', color: '#F59E0B', mood: 'neutral' },
  'allowed': { label: 'Entry Allowed!', color: '#22C55E', mood: 'happy' },
};

export default function NestedMaze() {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const [age, setAge] = useState(21);
  const [hasID, setHasID] = useState(1);
  const [bitStep, setBitStep] = useState<'start' | 'gate1' | 'gate2' | 'done'>('done');
  const prevInputs = useRef({ age, hasID });

  const { scaledTimeout } = useAnimationSpeed();
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const outcome = getOutcome(age, hasID);
  const config = OUTCOME_CONFIG[outcome];

  // Phase navigation
  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 3) return false;
    setPhase(p => p + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (phaseRef.current <= 0) return false;
    setPhase(p => p - 1);
    return true;
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    setSceneStepBackHandler(stableStepBackHandler);
    return () => {
      setSceneStepHandler(null);
      setSceneStepBackHandler(null);
    };
  }, [setSceneStepHandler, stableStepHandler, setSceneStepBackHandler, stableStepBackHandler]);

  // Animate bit character through maze on input change (phase 2)
  useEffect(() => {
    if (phase !== 2) return;
    if (prevInputs.current.age === age && prevInputs.current.hasID === hasID) return;
    prevInputs.current = { age, hasID };

    setBitStep('start');
    const c1 = scaledTimeout(() => setBitStep('gate1'), 500);
    const c2 = scaledTimeout(() => setBitStep(age >= 18 ? 'gate2' : 'done'), 1200);
    const c3 = scaledTimeout(() => setBitStep('done'), 1900);
    return () => { c1(); c2(); c3(); };
  }, [age, hasID, phase, scaledTimeout]);

  // Phase 0 intro animation
  const [introStep, setIntroStep] = useState(0);
  useEffect(() => {
    if (phase !== 0) return;
    setIntroStep(0);
    const c1 = scaledTimeout(() => setIntroStep(1), 800);
    const c2 = scaledTimeout(() => setIntroStep(2), 2000);
    const c3 = scaledTimeout(() => setIntroStep(3), 3200);
    return () => { c1(); c2(); c3(); };
  }, [phase, scaledTimeout]);

  // Code for nested if
  const codeLines = [
    { text: `int age = ${age};`, indent: 0 },
    { text: `int hasID = ${hasID};`, indent: 0 },
    { text: '', indent: 0 },
    { text: 'if (age >= 18) {', indent: 0 },
    { text: 'if (hasID == 1) {', indent: 1 },
    { text: 'printf("Entry Allowed");', indent: 2 },
    { text: '} else {', indent: 1 },
    { text: 'printf("No ID!");', indent: 2 },
    { text: '}', indent: 1 },
    { text: '} else {', indent: 0 },
    { text: 'printf("Too young!");', indent: 1 },
    { text: '}', indent: 0 },
  ];

  const getHighlightedLine = (): number => {
    if (phase < 1) return -1;
    if (outcome === 'too-young') return 10;
    if (outcome === 'no-id') return 7;
    return 5;
  };

  const getActiveLines = (): Set<number> => {
    const active = new Set<number>();
    active.add(0);
    active.add(1);
    active.add(3);
    if (outcome === 'too-young') {
      active.add(9);
      active.add(10);
      active.add(11);
    } else {
      active.add(4);
      if (outcome === 'allowed') {
        active.add(5);
        active.add(6);
      } else {
        active.add(6);
        active.add(7);
        active.add(8);
      }
      active.add(8);
      active.add(9);
    }
    active.add(11);
    return active;
  };

  const highlightLine = getHighlightedLine();
  const activeLines = getActiveLines();

  // Nesting depth colors for phase 3
  const NESTING_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

  const narrations = [
    'Sometimes one question isn\'t enough. You need a question inside a question.',
    'This is a nested if. The inner check only runs when the outer passes.',
    'Two conditions, three possible outcomes.',
    'Indentation shows nesting level. Keep it shallow.',
  ];

  return (
    <div
      data-interactive={phase === 2 ? true : undefined}
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0c1020 0%, #141e30 50%, #0c1020 100%)' }}
    >
      {/* Phase 0: Introduction - Single door leading to another door */}
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="phase0"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <div className="relative w-[500px] h-[300px]">
              <svg viewBox="0 0 500 300" className="w-full h-full">
                {/* First gate */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: introStep >= 0 ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <rect x="120" y="60" width="8" height="180" fill="#6B5435" />
                  <rect x="232" y="60" width="8" height="180" fill="#6B5435" />
                  <rect x="120" y="50" width="120" height="20" rx="4" fill="#8B7355" />
                  <text x="180" y="65" textAnchor="middle" fill="#FFD700" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    age {'>'}= 18
                  </text>
                  {/* YES / NO labels */}
                  <text x="145" y="260" textAnchor="middle" fill="#22C55E" fontSize="10" fontFamily="monospace">YES</text>
                  <text x="275" y="160" textAnchor="middle" fill="#EF4444" fontSize="10" fontFamily="monospace">NO</text>
                  {/* Arrow for NO */}
                  <path d="M 240 150 L 260 150" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                </motion.g>

                {/* Second gate (nested) */}
                <motion.g
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: introStep >= 2 ? 1 : 0, x: introStep >= 2 ? 0 : 20 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <rect x="300" y="80" width="6" height="140" fill="#5a4a2a" />
                  <rect x="394" y="80" width="6" height="140" fill="#5a4a2a" />
                  <rect x="300" y="70" width="100" height="18" rx="4" fill="#7B6345" />
                  <text x="350" y="83" textAnchor="middle" fill="#00BFFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    hasID == 1
                  </text>
                  <text x="335" y="238" textAnchor="middle" fill="#22C55E" fontSize="10" fontFamily="monospace">YES</text>
                  <text x="430" y="160" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">NO</text>
                </motion.g>

                {/* Connecting path */}
                <motion.path
                  d="M 175 240 L 175 260 L 340 260 L 340 220"
                  stroke="#4a4a5a"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: introStep >= 1 ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                />

                {/* Arrow marker defs */}
                <defs>
                  <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                  </marker>
                </defs>
              </svg>

              {/* BitCharacter walking through */}
              <motion.div
                className="absolute"
                animate={{
                  left: introStep < 1 ? '20%' : introStep < 2 ? '28%' : introStep < 3 ? '60%' : '62%',
                  top: introStep < 2 ? '50%' : '35%',
                }}
                transition={{ type: 'spring', stiffness: 50, damping: 12 }}
              >
                <BitCharacter
                  mood={introStep < 2 ? 'neutral' : introStep < 3 ? 'neutral' : 'happy'}
                  size={40}
                  color="#00BFFF"
                />
              </motion.div>
            </div>

            {/* Surprise text when second door appears */}
            <AnimatePresence>
              {introStep >= 2 && (
                <motion.div
                  className="font-body text-sm text-dim italic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Another door? A question inside a question...
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Phase 1: Full maze with code panel */}
        {phase === 1 && (
          <motion.div
            key="phase1"
            className="flex items-center gap-8 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {/* Maze SVG */}
            <div className="relative w-[420px] h-[320px] flex-shrink-0">
              <svg viewBox="0 0 420 320" className="w-full h-full">
                {/* Outer gate */}
                <rect x="30" y="40" width="180" height="240" rx="8" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="8 4" />
                <rect x="70" y="28" width="100" height="24" rx="6" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="120" y="45" textAnchor="middle" fill="#3B82F6" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  age {'>'}= 18?
                </text>

                {/* Inner gate */}
                <rect x="55" y="80" width="130" height="170" rx="6" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="6 3" />
                <rect x="70" y="70" width="100" height="22" rx="5" fill="rgba(139,92,246,0.15)" stroke="#8B5CF6" strokeWidth="1.5" />
                <text x="120" y="85" textAnchor="middle" fill="#8B5CF6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  hasID == 1?
                </text>

                {/* YES+YES path */}
                <motion.path
                  d="M 120 92 L 120 140"
                  stroke="#22C55E"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
                <rect x="75" y="140" width="90" height="35" rx="6" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5" />
                <text x="120" y="162" textAnchor="middle" fill="#22C55E" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Entry Allowed
                </text>

                {/* Inner NO path */}
                <motion.path
                  d="M 185 130 L 250 130"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
                <rect x="250" y="115" width="80" height="30" rx="6" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="290" y="134" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">
                  No ID!
                </text>

                {/* Outer NO path */}
                <motion.path
                  d="M 210 160 L 300 230"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
                <rect x="260" y="220" width="90" height="30" rx="6" fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="1.5" />
                <text x="305" y="239" textAnchor="middle" fill="#EF4444" fontSize="10" fontFamily="monospace">
                  Too young!
                </text>

                {/* Flow arrows */}
                <text x="145" y="115" fill="#22C55E" fontSize="9" fontFamily="monospace">YES</text>
                <text x="190" y="125" fill="#F59E0B" fontSize="9" fontFamily="monospace">NO</text>
                <text x="215" y="165" fill="#EF4444" fontSize="9" fontFamily="monospace">NO</text>
                <text x="65" y="58" fill="#3B82F6" fontSize="9" fontFamily="monospace">YES</text>
              </svg>
            </div>

            {/* Code panel */}
            <motion.div
              className="w-72 flex-shrink-0"
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
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">nested.c</span>
                </div>
                <div className="px-3 py-3 font-code text-xs leading-relaxed">
                  {codeLines.map((line, i) => (
                    <div
                      key={i}
                      className="py-0.5"
                      style={{
                        paddingLeft: `${line.indent * 16}px`,
                        opacity: line.text === '' ? 0.3 : 1,
                      }}
                    >
                      <span className="text-dim/30 text-[10px] mr-2 select-none">{line.text ? i + 1 : ''}</span>
                      <span style={{
                        color: i === 3 ? '#3B82F6' : i === 4 ? '#8B5CF6' : 'rgba(255,255,255,0.7)',
                      }}>
                        {line.text || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nesting explanation */}
              <motion.div
                className="mt-3 px-3 py-2 rounded-lg font-code text-xs"
                style={{ background: 'rgba(17,22,51,0.9)', border: '1px solid rgba(139,92,246,0.3)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-purple mb-1 font-bold">Nesting = door inside door</div>
                <div className="text-dim">
                  The <span className="text-purple">inner if</span> only runs when the{' '}
                  <span className="text-blue">outer if</span> passes.
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Interactive */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            className="flex items-center gap-8 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {/* Interactive maze */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-[400px] h-[280px]">
                <svg viewBox="0 0 400 280" className="w-full h-full">
                  {/* Outer gate frame */}
                  <rect x="30" y="30" width="160" height="220" rx="8" fill="none"
                    stroke={age >= 18 ? '#3B82F6' : '#EF4444'}
                    strokeWidth="2.5" strokeDasharray="8 4"
                  />
                  <rect x="60" y="18" width="100" height="24" rx="6"
                    fill={age >= 18 ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}
                    stroke={age >= 18 ? '#3B82F6' : '#EF4444'} strokeWidth="1.5"
                  />
                  <text x="110" y="35" textAnchor="middle"
                    fill={age >= 18 ? '#3B82F6' : '#EF4444'}
                    fontSize="11" fontFamily="monospace" fontWeight="bold"
                  >
                    age {'>'}= 18
                  </text>

                  {/* Inner gate (only visible if outer passes) */}
                  <motion.g
                    animate={{ opacity: age >= 18 ? 1 : 0.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <rect x="50" y="70" width="120" height="150" rx="6" fill="none"
                      stroke={hasID === 1 ? '#8B5CF6' : '#F59E0B'}
                      strokeWidth="2" strokeDasharray="6 3"
                    />
                    <rect x="65" y="60" width="90" height="20" rx="5"
                      fill={hasID === 1 ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)'}
                      stroke={hasID === 1 ? '#8B5CF6' : '#F59E0B'} strokeWidth="1.5"
                    />
                    <text x="110" y="74" textAnchor="middle"
                      fill={hasID === 1 ? '#8B5CF6' : '#F59E0B'}
                      fontSize="10" fontFamily="monospace" fontWeight="bold"
                    >
                      hasID == 1
                    </text>
                  </motion.g>

                  {/* Outcome boxes */}
                  <motion.g animate={{ opacity: outcome === 'allowed' ? 1 : 0.2 }}>
                    <rect x="65" y="125" width="90" height="30" rx="6"
                      fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5"
                    />
                    <text x="110" y="144" textAnchor="middle" fill="#22C55E" fontSize="9" fontFamily="monospace">
                      Entry Allowed
                    </text>
                  </motion.g>

                  <motion.g animate={{ opacity: outcome === 'no-id' ? 1 : 0.2 }}>
                    <rect x="230" y="100" width="80" height="28" rx="6"
                      fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="1.5"
                    />
                    <text x="270" y="118" textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">
                      No ID!
                    </text>
                  </motion.g>

                  <motion.g animate={{ opacity: outcome === 'too-young' ? 1 : 0.2 }}>
                    <rect x="240" y="200" width="90" height="28" rx="6"
                      fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="1.5"
                    />
                    <text x="285" y="218" textAnchor="middle" fill="#EF4444" fontSize="9" fontFamily="monospace">
                      Too young!
                    </text>
                  </motion.g>

                  {/* Paths */}
                  {age >= 18 && hasID === 1 && (
                    <motion.path d="M 110 42 L 110 125" stroke="#22C55E" strokeWidth="2" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
                    />
                  )}
                  {age >= 18 && hasID !== 1 && (
                    <motion.path d="M 170 110 L 230 112" stroke="#F59E0B" strokeWidth="2" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
                    />
                  )}
                  {age < 18 && (
                    <motion.path d="M 190 160 L 250 210" stroke="#EF4444" strokeWidth="2" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
                    />
                  )}
                </svg>

                {/* BitCharacter */}
                <motion.div
                  className="absolute"
                  animate={{
                    left: bitStep === 'start' ? '5%'
                      : bitStep === 'gate1' ? '22%'
                      : bitStep === 'gate2' ? (hasID === 1 ? '22%' : '55%')
                      : outcome === 'too-young' ? '58%'
                      : outcome === 'no-id' ? '55%'
                      : '22%',
                    top: bitStep === 'start' ? '55%'
                      : bitStep === 'gate1' ? '40%'
                      : bitStep === 'gate2' ? (hasID === 1 ? '35%' : '30%')
                      : outcome === 'too-young' ? '68%'
                      : outcome === 'no-id' ? '30%'
                      : '38%',
                  }}
                  transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                >
                  <BitCharacter
                    mood={bitStep === 'done' ? config.mood : 'neutral'}
                    size={35}
                    color={bitStep === 'done' ? config.color : '#00BFFF'}
                  />
                </motion.div>

                {/* Outcome badge */}
                <AnimatePresence>
                  {bitStep === 'done' && (
                    <motion.div
                      key={outcome}
                      className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg font-display text-sm font-bold"
                      style={{
                        background: `${config.color}20`,
                        color: config.color,
                        border: `1px solid ${config.color}50`,
                      }}
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {config.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Age slider */}
                <div className="flex items-center gap-4">
                  <span className="font-code text-sm text-dim">age =</span>
                  <input
                    type="range" min={1} max={100} value={age}
                    onChange={e => setAge(parseInt(e.target.value))}
                    className="w-40 accent-blue-500"
                  />
                  <motion.span
                    key={age}
                    className="font-display text-xl font-bold w-10 text-center"
                    style={{ color: age >= 18 ? '#3B82F6' : '#EF4444' }}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {age}
                  </motion.span>
                </div>

                {/* hasID toggle */}
                <div className="flex items-center gap-4">
                  <span className="font-code text-sm text-dim">hasID =</span>
                  <button
                    onClick={() => setHasID(prev => prev === 1 ? 0 : 1)}
                    className="px-4 py-1.5 rounded-lg font-code text-sm font-bold transition-colors"
                    style={{
                      background: hasID === 1 ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)',
                      color: hasID === 1 ? '#8B5CF6' : '#F59E0B',
                      border: `2px solid ${hasID === 1 ? '#8B5CF6' : '#F59E0B'}`,
                    }}
                  >
                    {hasID}
                  </button>
                  <span className="font-code text-xs text-dim">
                    ({hasID === 1 ? 'has ID' : 'no ID'})
                  </span>
                </div>

                <InteractiveIndicator />
              </motion.div>
            </div>

            {/* Code panel with active path highlighting */}
            <motion.div
              className="w-72 flex-shrink-0"
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
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
                  <span className="text-xs text-dim ml-2 font-code">nested.c</span>
                </div>
                <div className="px-3 py-3 font-code text-xs leading-relaxed">
                  {codeLines.map((line, i) => {
                    const isHL = i === highlightLine;
                    const isActive = activeLines.has(i);
                    return (
                      <motion.div
                        key={i}
                        className="flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{
                          paddingLeft: `${line.indent * 14 + 8}px`,
                          background: isHL ? `${config.color}15` : 'transparent',
                          borderLeft: isHL ? `3px solid ${config.color}` : '3px solid transparent',
                        }}
                        animate={{ opacity: isActive || line.text === '' ? 1 : 0.25 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                          {line.text ? i + 1 : ''}
                        </span>
                        <span style={{
                          color: isHL ? config.color : 'rgba(255,255,255,0.7)',
                          fontWeight: isHL ? 700 : 400,
                        }}>
                          {line.text || '\u00A0'}
                        </span>
                        {isHL && (
                          <motion.span
                            className="text-xs font-bold ml-auto flex-shrink-0"
                            style={{ color: config.color }}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            ◀ runs
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Outcome trace */}
              <motion.div
                className="mt-3 rounded-lg px-3 py-2 font-code text-xs"
                style={{ background: 'rgba(17,22,51,0.9)', border: `1px solid ${config.color}30` }}
              >
                <div className="text-dim mb-1">Execution path:</div>
                <div style={{ color: age >= 18 ? '#3B82F6' : '#EF4444' }}>
                  {age >= 18 ? '\u2713' : '\u2717'} age {'>'}= 18 → {age >= 18 ? 'TRUE' : 'FALSE'}
                </div>
                {age >= 18 && (
                  <motion.div
                    style={{ color: hasID === 1 ? '#8B5CF6' : '#F59E0B' }}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {'  '}{hasID === 1 ? '\u2713' : '\u2717'} hasID == 1 → {hasID === 1 ? 'TRUE' : 'FALSE'}
                  </motion.div>
                )}
                <motion.div
                  className="mt-1 font-bold"
                  style={{ color: config.color }}
                  key={outcome}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  → {config.label}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 3: Nesting depth warning */}
        {phase === 3 && (
          <motion.div
            key="phase3"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Nesting depth indicator with colored brackets */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="font-display text-lg text-primary mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Nesting Depth
              </motion.div>

              <div className="font-code text-sm leading-loose">
                {[
                  { depth: 0, text: 'if (condition1) {', bracket: '{' },
                  { depth: 1, text: 'if (condition2) {', bracket: '{' },
                  { depth: 2, text: 'if (condition3) {', bracket: '{' },
                  { depth: 3, text: '// deeply nested...', bracket: null },
                  { depth: 2, text: '}', bracket: '}' },
                  { depth: 1, text: '}', bracket: '}' },
                  { depth: 0, text: '}', bracket: '}' },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                  >
                    {/* Depth indicator */}
                    <div className="w-6 flex justify-center">
                      {line.bracket && (
                        <span className="text-lg font-bold" style={{ color: NESTING_COLORS[line.depth] }}>
                          {line.depth === 0 ? '|' : line.depth === 1 ? '|' : '|'}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        paddingLeft: `${line.depth * 20}px`,
                        color: line.depth <= 1 ? NESTING_COLORS[line.depth]
                          : line.depth === 2 ? NESTING_COLORS[2]
                          : '#EF4444',
                      }}
                    >
                      {line.text}
                    </span>
                    {/* Depth label */}
                    {line.bracket === '{' && (
                      <span className="text-xs text-dim ml-2">
                        depth {line.depth + 1}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Depth color legend */}
              <motion.div
                className="flex gap-4 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {NESTING_COLORS.slice(0, 3).map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background: color }} />
                    <span className="font-code text-xs text-dim">Level {i + 1}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: '#EF4444' }} />
                  <span className="font-code text-xs text-red">Too deep!</span>
                </div>
              </motion.div>
            </div>

            {/* Warning box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <GlowBox color="#F59E0B" intensity={0.3}>
                <div className="px-6 py-4 max-w-md">
                  <div className="font-display text-amber text-sm font-bold mb-2">
                    Best Practice
                  </div>
                  <div className="font-body text-sm text-dim leading-relaxed">
                    More than <span className="text-amber font-bold">2-3 levels</span> of nesting?
                    Consider using <span className="text-blue font-code">else if</span> chains
                    or extracting into functions.
                    Deep nesting makes code harder to read and maintain.
                  </div>
                  <div className="font-code text-xs text-dim mt-2 italic">
                    Tip: Each indent level = one more thing to keep in your head
                  </div>
                </div>
              </GlowBox>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Narration text={narrations[phase]} delay={0.5} />
    </div>
  );
}
