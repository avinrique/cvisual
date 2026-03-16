'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';

interface StepDef {
  label: string;
  condition: string;
  grade: string;
  color: string;
  test: (m: number) => boolean;
  conditionLine: number; // the if/else-if/else line
  bodyLine: number;      // the grade = ... line
}

const STEPS: StepDef[] = [
  { label: 'marks >= 90', condition: 'marks >= 90', grade: 'A+', color: '#22C55E', test: m => m >= 90, conditionLine: 0, bodyLine: 1 },
  { label: 'marks >= 75', condition: 'marks >= 75', grade: 'A', color: '#00BFFF', test: m => m >= 75, conditionLine: 2, bodyLine: 3 },
  { label: 'marks >= 50', condition: 'marks >= 50', grade: 'B', color: '#F59E0B', test: m => m >= 50, conditionLine: 4, bodyLine: 5 },
  { label: 'else', condition: 'else', grade: 'F', color: '#EF4444', test: () => true, conditionLine: 6, bodyLine: 7 },
];

// Code lines with syntax coloring
// Line 0: if (marks >= 90) {
// Line 1:     grade = 'A+';
// Line 2: } else if (marks >= 75) {
// Line 3:     grade = 'A';
// Line 4: } else if (marks >= 50) {
// Line 5:     grade = 'B';
// Line 6: } else {
// Line 7:     grade = 'F';
// Line 8: }
const CODE_LINES = [
  {
    segments: [
      { text: 'if', color: 'var(--accent-purple)' },
      { text: ' (marks >= ', color: 'var(--text-dim)' },
      { text: '90', color: 'var(--accent-green)' },
      { text: ') {', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '    grade = ', color: 'var(--text-dim)' },
      { text: "'A+'", color: 'var(--accent-green)' },
      { text: ';', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '} ', color: 'var(--text-dim)' },
      { text: 'else if', color: 'var(--accent-purple)' },
      { text: ' (marks >= ', color: 'var(--text-dim)' },
      { text: '75', color: 'var(--accent-green)' },
      { text: ') {', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '    grade = ', color: 'var(--text-dim)' },
      { text: "'A'", color: '#00BFFF' },
      { text: ';', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '} ', color: 'var(--text-dim)' },
      { text: 'else if', color: 'var(--accent-purple)' },
      { text: ' (marks >= ', color: 'var(--text-dim)' },
      { text: '50', color: 'var(--accent-green)' },
      { text: ') {', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '    grade = ', color: 'var(--text-dim)' },
      { text: "'B'", color: '#F59E0B' },
      { text: ';', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '} ', color: 'var(--text-dim)' },
      { text: 'else', color: 'var(--accent-purple)' },
      { text: ' {', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [
      { text: '    grade = ', color: 'var(--text-dim)' },
      { text: "'F'", color: '#EF4444' },
      { text: ';', color: 'var(--text-dim)' },
    ],
  },
  {
    segments: [{ text: '}', color: 'var(--text-dim)' }],
  },
];

export default function ElseIfStaircase() {
  const [marks, setMarks] = useState(72);

  const matchIndex = STEPS.findIndex(s => s.test(marks));
  const matched = STEPS[matchIndex];

  // Determine line states for the code panel
  // Conditions above match: checked and failed (skipped)
  // Match condition + body: highlighted
  // Everything below: never reached (dim)
  const getLineState = (lineIdx: number): 'skipped' | 'match-condition' | 'match-body' | 'below' | 'neutral' => {
    // Check if this line is the matched condition or body
    if (lineIdx === matched.conditionLine) return 'match-condition';
    if (lineIdx === matched.bodyLine) return 'match-body';

    // Check if this line is a condition that was checked but failed (above match)
    for (let i = 0; i < matchIndex; i++) {
      if (lineIdx === STEPS[i].conditionLine) return 'skipped';
    }

    // Check if this line is below the match (never reached)
    if (lineIdx > matched.bodyLine) return 'below';

    // Lines between skipped conditions and match (body lines of skipped steps)
    for (let i = 0; i < matchIndex; i++) {
      if (lineIdx === STEPS[i].bodyLine) return 'below'; // body of skipped condition never runs
    }

    return 'neutral';
  };

  return (
    <div
      data-interactive
      className="w-full h-full relative overflow-hidden flex items-center justify-center gap-6 p-6"
      style={{ background: 'linear-gradient(180deg, #0c0e1e 0%, #141830 50%, #0c0e1e 100%)' }}
    >
      {/* Left: Staircase visualization */}
      <div className="flex flex-col items-center gap-4">
        {/* Staircase */}
        <div className="relative w-full max-w-lg h-64">
          {STEPS.map((step, i) => {
            const isMatch = i === matchIndex;
            const isAbove = i < matchIndex;
            const stepWidth = 85 - i * 5;
            const x = 15 + i * 18;
            const y = 20 + i * 52;

            return (
              <motion.div
                key={step.label}
                className="absolute flex items-center"
                style={{ left: `${x}%`, top: y }}
                animate={{
                  opacity: isAbove ? 0.25 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Step platform */}
                <motion.div
                  className="relative px-4 py-3 rounded-lg border-2 flex items-center gap-3 cursor-default"
                  style={{
                    width: `${stepWidth}%`,
                    minWidth: 200,
                    borderColor: isMatch ? step.color : isAbove ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                    background: isMatch ? `${step.color}15` : 'rgba(255,255,255,0.02)',
                    boxShadow: isMatch ? `0 0 20px ${step.color}30` : 'none',
                  }}
                  animate={{
                    scale: isMatch ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {/* Condition */}
                  <span className="font-code text-xs" style={{ color: isMatch ? step.color : 'rgba(255,255,255,0.5)' }}>
                    {step.condition}
                  </span>

                  {/* Grade door */}
                  <motion.div
                    className="ml-auto px-3 py-1 rounded text-xs font-display font-bold"
                    style={{
                      background: isMatch ? `${step.color}30` : 'rgba(255,255,255,0.05)',
                      color: isMatch ? step.color : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${isMatch ? step.color : 'rgba(255,255,255,0.1)'}`,
                    }}
                    animate={{
                      scale: isMatch ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: isMatch ? Infinity : 0 }}
                  >
                    {isMatch ? `Grade: ${step.grade}` : step.grade}
                  </motion.div>

                  {/* BitCharacter on matching step */}
                  {isMatch && (
                    <motion.div
                      className="absolute -top-12 left-4"
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <BitCharacter
                        mood={matchIndex <= 1 ? 'excited' : matchIndex === 2 ? 'neutral' : 'sad'}
                        size={35}
                        color={step.color}
                      />
                    </motion.div>
                  )}

                  {/* Checkmark or skip indicator */}
                  {isMatch && (
                    <motion.span
                      className="absolute -right-8 text-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      style={{ color: step.color }}
                    >
                      {'\u2713'}
                    </motion.span>
                  )}
                  {isAbove && (
                    <span className="absolute -right-8 text-xs text-dim font-code">skip</span>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Slider */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <span className="font-code text-sm text-dim">marks =</span>
            <input
              type="range"
              min={0}
              max={100}
              value={marks}
              onChange={e => setMarks(parseInt(e.target.value))}
              className="w-56"
              style={{ accentColor: matched.color }}
            />
            <motion.span
              key={marks}
              className="font-display text-2xl font-bold w-12 text-center"
              style={{ color: matched.color }}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {marks}
            </motion.span>
          </div>

          {/* Grade bar */}
          <div className="flex gap-1 w-56 h-2 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: marks >= 90 ? '#22C55E' : '#22C55E33' }} />
            <div className="flex-1" style={{ background: marks >= 75 && marks < 90 ? '#00BFFF' : '#00BFFF33' }} />
            <div className="flex-1" style={{ background: marks >= 50 && marks < 75 ? '#F59E0B' : '#F59E0B33' }} />
            <div className="flex-1" style={{ background: marks < 50 ? '#EF4444' : '#EF444433' }} />
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
            <span className="text-xs text-dim ml-2 font-code">grades.c</span>
          </div>

          {/* Code lines */}
          <div className="px-3 py-3 font-code text-sm leading-relaxed">
            {CODE_LINES.map((line, i) => {
              const state = getLineState(i);
              const isMatchLine = state === 'match-condition' || state === 'match-body';
              const isSkipped = state === 'skipped';
              const isBelow = state === 'below';

              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-2 py-0.5 rounded"
                  style={{
                    background: isMatchLine
                      ? `${matched.color}15`
                      : isSkipped
                      ? 'rgba(239,68,68,0.06)'
                      : 'transparent',
                    borderLeft: isMatchLine
                      ? `3px solid ${matched.color}`
                      : isSkipped
                      ? '3px solid rgba(239,68,68,0.3)'
                      : '3px solid transparent',
                  }}
                  animate={{
                    opacity: isBelow ? 0.25 : isSkipped ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-dim/30 text-[10px] w-3 text-right select-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">
                    {line.segments.map((seg, j) => (
                      <span
                        key={j}
                        style={{
                          color: isMatchLine ? matched.color : seg.color,
                          fontWeight: isMatchLine ? 600 : 400,
                        }}
                      >
                        {seg.text}
                      </span>
                    ))}
                  </span>
                  {/* Flow indicators */}
                  {isMatchLine && (
                    <motion.span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: matched.color }}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {state === 'match-condition' ? '✓' : '◀'}
                    </motion.span>
                  )}
                  {isSkipped && (
                    <span className="text-[10px] text-red/60 flex-shrink-0 font-code">✗</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Execution trace */}
        <AnimatePresence mode="wait">
          <motion.div
            key={matchIndex}
            className="mt-3 rounded-lg px-3 py-2 font-code text-xs"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              border: `1px solid ${matched.color}30`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-dim mb-1">Execution flow:</div>
            {STEPS.slice(0, matchIndex).map((s, i) => (
              <div key={i} className="text-red/50">
                <span className="text-red/40">✗</span> {s.condition} → <span className="italic">false, skip</span>
              </div>
            ))}
            <motion.div
              style={{ color: matched.color }}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-bold">✓</span> {matched.condition} → <span className="font-bold">true!</span> grade = &apos;{matched.grade}&apos;
            </motion.div>
            <div className="text-dim/40 mt-1 italic">↓ remaining conditions never checked</div>
          </motion.div>
        </AnimatePresence>

        {/* Result summary */}
        <motion.div
          className="mt-2 text-center font-code text-xs text-dim"
          key={`${marks}-${matched.grade}`}
        >
          marks = {marks} → grade = <span style={{ color: matched.color }} className="font-bold">&apos;{matched.grade}&apos;</span>
        </motion.div>
      </motion.div>

      <Narration text="else-if is a staircase: C checks each condition top-down and takes the first match." />
    </div>
  );
}
