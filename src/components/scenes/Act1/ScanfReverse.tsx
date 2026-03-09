'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';
import { useAppStore } from '@/lib/store';
import { Highlight, themes } from 'prism-react-renderer';

/* ── Two scanf examples ────────────────────────────────── */

const EXAMPLE_1 = {
  title: 'Example 1 — Reading an Integer',
  code: `#include <stdio.h>

int main() {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    printf("You are %d years old\\n", age);
    return 0;
}`,
  lines: [
    { line: 0, label: '#include <stdio.h>', explanation: 'Import the Standard I/O library — gives us printf and scanf.' },
    { line: 2, label: 'int main() {', explanation: 'Entry point of the program — execution starts here.' },
    { line: 3, label: 'int age;', explanation: 'Declare an integer variable called "age". It\'s like creating an empty box in memory.' },
    { line: 4, label: 'printf("Enter your age: ");', explanation: 'Print a prompt to the screen so the user knows what to type.' },
    { line: 5, label: 'scanf("%d", &age);', explanation: '%d tells scanf to expect an integer. &age gives scanf the address of the variable to store the value in.' },
    { line: 6, label: 'printf("You are %d ...", age);', explanation: 'Print the value back. %d is replaced by whatever is stored in age.' },
    { line: 7, label: 'return 0;', explanation: 'Return 0 to the OS — means "program finished successfully".' },
  ],
  terminalSteps: [
    // maps step index → terminal lines to show
    // step 0-2: nothing
    // step 3 (printf prompt): show prompt
    // step 4 (scanf): show user typing
    // step 5 (printf output): show output
  ] as { from: number; text: string; color: string }[],
  terminalFlow: [
    { fromStep: 3, text: 'Enter your age: ', color: 'text-green' },
    { fromStep: 4, text: 'Enter your age: 21', color: 'text-green', highlight: '21', highlightColor: 'text-blue' },
    { fromStep: 5, text: 'You are 21 years old', color: 'text-green' },
  ],
};

const EXAMPLE_2 = {
  title: 'Example 2 — Reading a Float',
  code: `#include <stdio.h>

int main() {
    float price;
    printf("Enter price: $");
    scanf("%f", &price);
    printf("Total: $%.2f\\n", price);
    return 0;
}`,
  lines: [
    { line: 0, label: '#include <stdio.h>', explanation: 'Same I/O library — every C program that uses printf/scanf needs this.' },
    { line: 2, label: 'int main() {', explanation: 'Program entry point again.' },
    { line: 3, label: 'float price;', explanation: 'Declare a float variable — floats store decimal numbers like 9.99.' },
    { line: 4, label: 'printf("Enter price: $");', explanation: 'Print a prompt with a dollar sign so the user knows to enter a price.' },
    { line: 5, label: 'scanf("%f", &price);', explanation: '%f tells scanf to expect a floating-point number. &price gives the memory address to store it.' },
    { line: 6, label: 'printf("Total: $%.2f", price);', explanation: '%.2f prints the float rounded to 2 decimal places — perfect for money.' },
    { line: 7, label: 'return 0;', explanation: 'Program ends. Return 0 = success.' },
  ],
  terminalFlow: [
    { fromStep: 3, text: 'Enter price: $', color: 'text-green' },
    { fromStep: 4, text: 'Enter price: $9.99', color: 'text-green', highlight: '9.99', highlightColor: 'text-blue' },
    { fromStep: 5, text: 'Total: $9.99', color: 'text-green' },
  ],
};

/* ── Highlighted code block ────────────────────────────── */

function CodeBlock({ code, activeLine }: { code: string; activeLine: number | null }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgba(17, 22, 51, 0.95)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
    >
      <Highlight theme={themes.nightOwl} code={code} language="c">
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className="p-5 overflow-x-auto text-base leading-relaxed" style={{ ...style, background: 'transparent', margin: 0 }}>
            {tokens.map((line, i) => {
              const isActive = activeLine === i;
              return (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className={`transition-all duration-300 ${isActive ? 'bg-blue/10 -mx-4 px-4 border-l-2 border-blue' : 'opacity-60'} ${activeLine !== null && !isActive ? 'opacity-40' : ''}`}
                  style={{
                    ...getLineProps({ line }).style,
                    ...(activeLine === null ? { opacity: 1 } : {}),
                  }}
                >
                  <span className="inline-block w-8 text-right mr-4 text-dim select-none text-sm">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

/* ── Flow arrow indicator ──────────────────────────────── */

function FlowArrow() {
  return (
    <motion.div
      className="flex items-center gap-1 text-blue"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────── */

export default function ScanfReverse() {
  // exampleIndex: 0 = example 1, 1 = example 2
  // stepInExample: 0 = show full code, 1-7 = highlight each line
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepInExample, setStepInExample] = useState(0);

  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);

  const exampleIndexRef = useRef(exampleIndex);
  exampleIndexRef.current = exampleIndex;
  const stepRef = useRef(stepInExample);
  stepRef.current = stepInExample;

  const examples = [EXAMPLE_1, EXAMPLE_2];
  const currentExample = examples[exampleIndex];
  const totalLineSteps = currentExample.lines.length; // 7 per example

  const stableStepHandler = useCallback(() => {
    const ex = exampleIndexRef.current;
    const st = stepRef.current;
    const maxStep = examples[ex].lines.length;

    if (st < maxStep) {
      // Advance to next line in current example
      setStepInExample(prev => prev + 1);
      return true;
    }

    if (ex === 0) {
      // Move to example 2
      setExampleIndex(1);
      setStepInExample(0);
      return true;
    }

    // Both examples done — let scene advance
    return false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    return () => setSceneStepHandler(null);
  }, [setSceneStepHandler, stableStepHandler]);

  // Current highlighted line (null when step is 0 = overview)
  const activeLine = stepInExample > 0 ? currentExample.lines[stepInExample - 1].line : null;
  const activeExplanation = stepInExample > 0 ? currentExample.lines[stepInExample - 1] : null;

  // Terminal lines to show
  const terminalLines = currentExample.terminalFlow.filter(t => stepInExample > 0 && (stepInExample - 1) >= t.fromStep);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void">
      {/* Title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exampleIndex}
          className="absolute top-6 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            {/* scanf badge */}
            <div
              className="px-5 py-2 rounded-lg border-2 border-blue/50 font-code text-xl text-blue flex items-center gap-2"
              style={{ background: 'rgba(0,191,255,0.08)', boxShadow: '0 0 20px var(--glow-blue)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
              scanf
            </div>
            <span className="text-primary font-body text-xl">{currentExample.title}</span>

            {/* Example indicator dots */}
            <div className="flex gap-2 ml-4">
              {examples.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    i === exampleIndex ? 'bg-blue' : 'bg-dim/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex items-start gap-10 px-6 max-w-7xl w-full mt-4">
        {/* Left: Code */}
        <AnimatePresence mode="wait">
          <motion.div
            key={exampleIndex}
            className="flex-1 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <CodeBlock code={currentExample.code} activeLine={activeLine} />

            {/* Step counter */}
            <div className="mt-3 flex justify-between items-center px-1">
              <span className="text-dim text-sm font-code">
                {stepInExample === 0
                  ? 'Press → to walk through each line'
                  : `Line ${stepInExample} of ${totalLineSteps}`}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalLineSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      i < stepInExample ? 'bg-blue' : 'bg-dim/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Explanation + Terminal */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Line explanation box */}
          <AnimatePresence mode="wait">
            {activeExplanation ? (
              <motion.div
                key={`${exampleIndex}-${stepInExample}`}
                className="rounded-lg border border-blue/30 p-5"
                style={{ background: 'rgba(0,191,255,0.05)', boxShadow: '0 0 15px rgba(0,191,255,0.1)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-2 mb-3">
                  <FlowArrow />
                  <code className="text-blue font-code text-base font-semibold">{activeExplanation.label}</code>
                </div>
                <p className="text-primary/80 font-body text-base leading-relaxed pl-7">
                  {activeExplanation.explanation}
                </p>

                {/* Special visual for scanf line */}
                {activeExplanation.label.includes('scanf') && (
                  <motion.div
                    className="mt-3 pl-7 flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1 text-sm font-code">
                      <span className="text-gold">&quot;{activeExplanation.label.includes('%d') ? '%d' : '%f'}&quot;</span>
                      <span className="text-dim">→</span>
                      <span className="text-dim">{activeExplanation.label.includes('%d') ? 'integer' : 'float'}</span>
                    </div>
                    <div className="w-px h-5 bg-dim/30" />
                    <div className="flex items-center gap-1 text-sm font-code">
                      <motion.span
                        className="text-amber text-lg font-bold"
                        animate={{ scale: [1, 1.3, 1], textShadow: ['0 0 0px transparent', '0 0 12px var(--glow-amber)', '0 0 0px transparent'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        &amp;
                      </motion.span>
                      <span className="text-dim">= address of variable</span>
                    </div>
                  </motion.div>
                )}

                {/* Special visual for %.2f */}
                {activeExplanation.label.includes('%.2f') && (
                  <motion.div
                    className="mt-3 pl-7 flex items-center gap-2 text-sm font-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-gold">%.2f</span>
                    <span className="text-dim">→</span>
                    <span className="text-green">9.99</span>
                    <span className="text-dim">(2 decimal places)</span>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                className="rounded-lg border border-dim/20 p-4"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-dim font-body text-base italic">
                  Read the full code first, then press <span className="text-blue font-code">→</span> to step through each line and see what it does.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal output */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Terminal title="output" showCursor={stepInExample > 0 && stepInExample <= totalLineSteps} width="w-full">
              {terminalLines.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {terminalLines.map((tl, i) => (
                    <motion.div
                      key={`${exampleIndex}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${tl.color} text-base`}
                    >
                      {tl.highlight ? (
                        <>
                          {tl.text.split(tl.highlight)[0]}
                          <span className={tl.highlightColor || 'text-blue'}>{tl.highlight}</span>
                          {tl.text.split(tl.highlight).slice(1).join(tl.highlight)}
                        </>
                      ) : (
                        tl.text
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <span className="text-dim text-sm italic">waiting for execution...</span>
              )}
            </Terminal>
          </motion.div>

          {/* Memory visualization for variable */}
          <AnimatePresence>
            {stepInExample >= 3 && (
              <motion.div
                className="flex items-center gap-4 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Variable box */}
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    className="font-code text-xs text-purple px-2 py-0.5 rounded border border-purple/30"
                    style={{ background: 'rgba(139,92,246,0.1)' }}
                  >
                    0x7FFF
                  </motion.div>
                  <motion.div
                    className="w-28 h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-colors duration-300"
                    style={{
                      borderColor: stepInExample >= 5 ? 'var(--accent-green)' : 'var(--accent-blue)',
                      background: stepInExample >= 5 ? 'rgba(34,197,94,0.1)' : 'rgba(0,191,255,0.05)',
                      boxShadow: stepInExample >= 5 ? '0 0 15px var(--glow-green)' : '0 0 8px var(--glow-blue)',
                    }}
                    animate={stepInExample === 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {stepInExample >= 5 ? (
                      <motion.span
                        className="font-code text-2xl text-green"
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        {exampleIndex === 0 ? '21' : '9.99'}
                      </motion.span>
                    ) : (
                      <span className="text-dim text-xs">empty</span>
                    )}
                  </motion.div>
                  <span className="font-code text-sm text-dim">
                    {exampleIndex === 0 ? 'age' : 'price'}
                    <span className="text-purple/50 ml-1">
                      ({exampleIndex === 0 ? 'int' : 'float'})
                    </span>
                  </span>
                </div>

                {/* Arrow showing data flow */}
                {stepInExample >= 4 && stepInExample < 6 && (
                  <motion.div
                    className="text-blue/50 text-sm font-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ← keyboard input
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom narration */}
      {stepInExample > totalLineSteps - 1 && exampleIndex === 1 && (
        <Narration text="scanf is the reverse of printf — it listens, reads, and stores the answer in a variable's address. Always use & before the variable name!" />
      )}
    </div>
  );
}
