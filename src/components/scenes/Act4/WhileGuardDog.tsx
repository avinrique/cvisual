'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const CORRECT_PASSWORD = '1234';

const CODE_LINES = [
  { colored: [{ text: '#include <stdio.h>', color: 'var(--accent-purple)' }] },
  { colored: [{ text: '#include <string.h>', color: 'var(--accent-purple)' }] },
  { colored: [] },
  { colored: [{ text: 'int', color: 'var(--accent-blue)' }, { text: ' main() {', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    ', color: '' }, { text: 'char', color: 'var(--accent-blue)' }, { text: ' password[20] = "";', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    ', color: '' }, { text: 'char', color: 'var(--accent-blue)' }, { text: ' correct[] = ', color: 'var(--text-dim)' }, { text: '"1234"', color: 'var(--accent-green)' }, { text: ';', color: 'var(--text-dim)' }] },
  { colored: [] },
  { colored: [{ text: '    ', color: '' }, { text: 'while', color: 'var(--accent-purple)' }, { text: ' (', color: 'var(--text-dim)' }, { text: 'strcmp(password, correct)', color: 'var(--accent-amber)' }, { text: ' != 0) {', color: 'var(--text-dim)' }] },
  { colored: [{ text: '        ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"Password: "', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { colored: [{ text: '        ', color: '' }, { text: 'scanf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"%s"', color: 'var(--accent-green)' }, { text: ', password);', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    }', color: 'var(--text-dim)' }] },
  { colored: [] },
  { colored: [{ text: '    ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"Access granted!\\n"', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { colored: [{ text: '    ', color: '' }, { text: 'return', color: 'var(--accent-purple)' }, { text: ' 0;', color: 'var(--text-dim)' }] },
  { colored: [{ text: '}', color: 'var(--text-dim)' }] },
];

export default function WhileGuardDog() {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [dogState, setDogState] = useState<'idle' | 'bark' | 'wag'>('idle');
  const [doorOpen, setDoorOpen] = useState(false);
  const [highlightLine, setHighlightLine] = useState(7); // start at while condition
  const inputRef = useRef<HTMLInputElement>(null);
  const { scaledTimeout } = useAnimationSpeed();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || doorOpen) return;

    const guess = input.trim();
    setAttempts(prev => [...prev, guess]);

    // Highlight scanf line
    setHighlightLine(9);

    if (guess === CORRECT_PASSWORD) {
      setDogState('wag');
      scaledTimeout(() => {
        setHighlightLine(12); // printf("Access granted!")
        setDoorOpen(true);
      }, 800);
    } else {
      setDogState('bark');
      scaledTimeout(() => {
        setDogState('idle');
        setHighlightLine(7); // back to while condition
      }, 1200);
    }
    setInput('');
  };

  const DogSVG = () => (
    <motion.svg width="120" height="100" viewBox="0 0 100 80">
      <ellipse cx="50" cy="50" rx="28" ry="18" fill="#8B6914" />
      <circle cx="82" cy="38" r="14" fill="#A0781E" />
      <ellipse cx="74" cy="26" rx="5" ry="8" fill="#6B4E0E" transform="rotate(-15 74 26)" />
      <ellipse cx="90" cy="26" rx="5" ry="8" fill="#6B4E0E" transform="rotate(15 90 26)" />
      <circle cx="78" cy="36" r="2.5" fill={dogState === 'bark' ? '#EF4444' : 'white'} />
      <circle cx="88" cy="36" r="2.5" fill={dogState === 'bark' ? '#EF4444' : 'white'} />
      <circle cx="78" cy="36" r="1.2" fill="black" />
      <circle cx="88" cy="36" r="1.2" fill="black" />
      <circle cx="94" cy="40" r="3" fill="#333" />
      {dogState === 'bark' ? (
        <path d="M 90 44 Q 94 50 98 44" stroke="#333" strokeWidth="1.5" fill="none" />
      ) : dogState === 'wag' ? (
        <path d="M 88 43 Q 92 47 96 43" stroke="#333" strokeWidth="1" fill="none" />
      ) : (
        <path d="M 90 43 Q 94 46 98 43" stroke="#333" strokeWidth="1" fill="none" />
      )}
      <line x1="32" y1="62" x2="32" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="44" y1="64" x2="44" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="56" y1="64" x2="56" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="68" y1="62" x2="68" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <motion.path
        d="M 22 45 Q 12 35 18 28"
        stroke="#8B6914"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        animate={
          dogState === 'wag'
            ? { d: ['M 22 45 Q 8 30 18 22', 'M 22 45 Q 16 42 14 32', 'M 22 45 Q 8 30 18 22'] }
            : {}
        }
        transition={dogState === 'wag' ? { duration: 0.3, repeat: Infinity } : {}}
      />
    </motion.svg>
  );

  return (
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-8 px-6 max-w-6xl w-full">
        {/* Left — Guard dog scene */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <motion.h2
            className="font-display text-xl tracking-wider"
            style={{ color: '#F59E0B' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            The Guard Dog (while loop)
          </motion.h2>

          {/* Scene container */}
          <div className="relative w-full max-w-md h-[360px] rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #0f0d1a 0%, #1a1528 50%, #0f0d1a 100%)' }}
          >
            {/* Night sky stars */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/30"
                style={{ left: `${10 + (i * 7) % 80}%`, top: `${5 + (i * 13) % 25}%` }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}

            {/* Door frame */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8">
              <div className="relative w-52 h-56">
                {/* Brick wall background */}
                <div className="absolute -left-6 -right-6 -top-4 bottom-0 rounded-t"
                  style={{ background: 'linear-gradient(180deg, #2a1810 0%, #1a100a 100%)' }}
                >
                  {/* Brick pattern */}
                  {[...Array(5)].map((_, row) => (
                    <div key={row} className="flex" style={{ marginTop: row === 0 ? 8 : 0 }}>
                      {[...Array(4)].map((_, col) => (
                        <div
                          key={col}
                          className="h-5 flex-1 border-b border-r"
                          style={{
                            borderColor: 'rgba(139,69,19,0.3)',
                            marginLeft: row % 2 === 0 ? (col === 0 ? 8 : 0) : 0,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Door */}
                <div className="absolute inset-0 border-4 rounded-t-lg overflow-hidden"
                  style={{
                    borderColor: doorOpen ? '#22C55E' : '#8B6914',
                    background: doorOpen ? 'rgba(34,197,94,0.05)' : 'transparent',
                  }}
                >
                  <motion.div
                    className="absolute inset-1 rounded-t-sm flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, #4a3520 0%, #2d1f10 100%)',
                      transformOrigin: 'left center',
                    }}
                    animate={doorOpen ? { rotateY: -80, opacity: 0.2 } : { rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    {!doorOpen && (
                      <>
                        {/* Door handle */}
                        <div className="absolute right-4 top-1/2 w-3 h-7 rounded-full bg-amber/70" />
                        {/* Lock icon */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">🔒</span>
                          <motion.span
                            className="text-amber/80 font-display text-sm tracking-widest"
                            animate={dogState === 'bark' ? { x: [-2, 2, -2, 0] } : {}}
                            transition={{ duration: 0.1, repeat: 3 }}
                          >
                            LOCKED
                          </motion.span>
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Access granted overlay */}
                  {doorOpen && (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="text-4xl">🏠</span>
                      <motion.span
                        className="text-green font-display text-xl tracking-wider"
                        animate={{ textShadow: ['0 0 10px rgba(34,197,94,0.5)', '0 0 20px rgba(34,197,94,0.8)', '0 0 10px rgba(34,197,94,0.5)'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ACCESS
                      </motion.span>
                    </motion.div>
                  )}
                </div>

                {/* Doorstep */}
                <div className="absolute -bottom-2 -left-2 -right-2 h-3 rounded bg-stone-800 border-t border-amber/20" />
              </div>
            </div>

            {/* Guard dog */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              animate={
                dogState === 'bark' ? { x: [-4, 4, -4, 0] } :
                dogState === 'wag' ? { y: [0, -3, 0] } : {}
              }
              transition={{
                duration: dogState === 'bark' ? 0.15 : 0.4,
                repeat: dogState === 'idle' ? 0 : dogState === 'bark' ? 4 : Infinity,
              }}
            >
              <DogSVG />

              {/* Speech bubble */}
              <AnimatePresence>
                {dogState === 'bark' && (
                  <motion.div
                    className="absolute -top-3 -right-4 px-3 py-1 rounded-lg text-sm font-display"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' }}
                    initial={{ opacity: 0, scale: 0, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    WOOF! 🐕
                  </motion.div>
                )}
                {dogState === 'wag' && (
                  <motion.div
                    className="absolute -top-3 -right-4 px-3 py-1 rounded-lg text-sm font-display"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    Good! 🐾
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password hint at bottom */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-[10px] font-code text-dim/40">hint: password is 1234</span>
            </div>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <span className="font-code text-sm text-dim">Password:</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter password..."
              disabled={doorOpen}
              className="px-4 py-2 rounded-lg bg-surface border border-white/10 font-code text-sm text-primary focus:outline-none focus:border-amber/50 w-44 disabled:opacity-30 transition"
              onClick={e => e.stopPropagation()}
            />
            <button
              type="submit"
              disabled={doorOpen}
              className="px-4 py-2 rounded-lg text-sm font-code bg-amber/20 border border-amber/40 text-amber hover:bg-amber/30 disabled:opacity-30 transition"
              onClick={e => e.stopPropagation()}
            >
              Try
            </button>
          </form>

          <InteractiveIndicator />
        </div>

        {/* Right — Code panel + log */}
        <motion.div
          className="w-80 flex-shrink-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30">
              <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
              <span className="text-xs text-dim ml-2 font-code">guard.c</span>
            </div>

            <div className="px-3 py-3 font-code text-xs leading-relaxed">
              {CODE_LINES.map((line, i) => {
                const isHighlighted = highlightLine === i;
                const isWhileBlock = i >= 7 && i <= 10;

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-1.5 py-0.5 rounded transition-colors duration-300"
                    style={{
                      background: isHighlighted
                        ? 'rgba(245,158,11,0.12)'
                        : isWhileBlock ? 'rgba(139,92,246,0.03)' : 'transparent',
                      borderLeft: isHighlighted
                        ? '2px solid var(--accent-amber)'
                        : isWhileBlock ? '2px solid rgba(139,92,246,0.15)' : '2px solid transparent',
                    }}
                    animate={{
                      opacity: highlightLine >= 0 && !isHighlighted && highlightLine > i ? 0.4 : 1,
                    }}
                  >
                    <span className="text-dim/30 text-[10px] w-4 text-right select-none flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                      {line.colored && line.colored.length > 0 ? (
                        line.colored.map((seg, j) => (
                          <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                        ))
                      ) : (
                        <span>&nbsp;</span>
                      )}
                    </span>
                    {isHighlighted && (
                      <motion.span
                        className="text-[10px] font-bold flex-shrink-0 text-amber"
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        ◀
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Execution status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${dogState}-${attempts.length}`}
              className="mt-3 text-center text-xs font-body text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              {dogState === 'idle' && !doorOpen && attempts.length === 0 && 'while loop checking: password != "1234"? YES → enter loop'}
              {dogState === 'idle' && !doorOpen && attempts.length > 0 && 'Back to while condition — still wrong!'}
              {dogState === 'bark' && 'Wrong password! Dog barks! Loop continues...'}
              {dogState === 'wag' && 'Correct! strcmp returns 0 → condition is FALSE'}
              {doorOpen && 'while loop exited — Access granted!'}
            </motion.div>
          </AnimatePresence>

          {/* Attempt log / terminal */}
          <div
            className="mt-4 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30">
              <span className="text-[10px] text-dim font-code">terminal</span>
            </div>
            <div className="px-3 py-2 font-code text-xs max-h-36 overflow-y-auto">
              {attempts.length === 0 && <span className="text-dim/40">Enter a password to begin...</span>}
              {attempts.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-amber">Password: </span>
                  <span className="text-primary">{a}</span>
                  <br />
                  {a === CORRECT_PASSWORD ? (
                    <motion.span
                      className="text-green"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Access granted! ✓
                    </motion.span>
                  ) : (
                    <span className="text-red">Wrong! Loop continues... ✗</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <motion.div
            className="mt-4 px-4 py-3 rounded-xl border text-center"
            style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="font-code text-xs text-purple-400">while checks BEFORE executing</div>
            <div className="text-[10px] text-dim mt-1">If the condition is false from the start, the body never runs.</div>
          </motion.div>
        </motion.div>
      </div>

      <Narration text="A while loop is a guard dog — it checks the condition before letting anything through." delay={1} />
    </div>
  );
}
