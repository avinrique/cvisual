'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';

interface StepDef {
  label: string;
  condition: string;
  grade: string;
  color: string;
  test: (m: number) => boolean;
  codeLine: number;
}

const STEPS: StepDef[] = [
  { label: 'marks >= 90', condition: 'marks >= 90', grade: 'A+', color: '#22C55E', test: m => m >= 90, codeLine: 1 },
  { label: 'marks >= 75', condition: 'marks >= 75', grade: 'A', color: '#00BFFF', test: m => m >= 75, codeLine: 3 },
  { label: 'marks >= 50', condition: 'marks >= 50', grade: 'B', color: '#F59E0B', test: m => m >= 50, codeLine: 5 },
  { label: 'else', condition: 'else', grade: 'F', color: '#EF4444', test: () => true, codeLine: 7 },
];

export default function ElseIfStaircase() {
  const [marks, setMarks] = useState(72);

  const matchIndex = STEPS.findIndex(s => s.test(marks));
  const matched = STEPS[matchIndex];

  const code = `if (marks >= 90) {
  grade = 'A+';
} else if (marks >= 75) {
  grade = 'A';
} else if (marks >= 50) {
  grade = 'B';
} else {
  grade = 'F';
}
// marks = ${marks}, grade = '${matched.grade}'`;

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: 'linear-gradient(180deg, #0c0e1e 0%, #141830 50%, #0c0e1e 100%)' }}
    >
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

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Terminal title="grades.c" width="w-72" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed whitespace-pre">
            <code>{code.split('\n').map((line, i) => {
              const isActive = i === matched.codeLine || i === matched.codeLine + 1;
              return (
                <span key={i} style={{
                  color: isActive ? matched.color : 'rgba(255,255,255,0.5)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  background: isActive ? `${matched.color}10` : 'transparent',
                }}>
                  {line}{'\n'}
                </span>
              );
            })}</code>
          </pre>
        </Terminal>
      </motion.div>

      <Narration text="else-if is a staircase: C checks each condition top-down and takes the first match." />
    </div>
  );
}
