'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';

const CORRECT_PASSWORD = '1234';

export default function WhileGuardDog() {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [dogState, setDogState] = useState<'idle' | 'bark' | 'wag'>('idle');
  const [doorOpen, setDoorOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || doorOpen) return;

    const guess = input.trim();
    setAttempts(prev => [...prev, guess]);

    if (guess === CORRECT_PASSWORD) {
      setDogState('wag');
      setTimeout(() => setDoorOpen(true), 800);
    } else {
      setDogState('bark');
      setTimeout(() => setDogState('idle'), 1200);
    }
    setInput('');
  };

  // Dog SVG
  const DogSVG = () => (
    <motion.svg width="100" height="80" viewBox="0 0 100 80">
      {/* Body */}
      <ellipse cx="50" cy="50" rx="28" ry="18" fill="#8B6914" />
      {/* Head */}
      <circle cx="82" cy="38" r="14" fill="#A0781E" />
      {/* Ears */}
      <ellipse cx="74" cy="26" rx="5" ry="8" fill="#6B4E0E" transform="rotate(-15 74 26)" />
      <ellipse cx="90" cy="26" rx="5" ry="8" fill="#6B4E0E" transform="rotate(15 90 26)" />
      {/* Eyes */}
      <circle cx="78" cy="36" r="2.5" fill={dogState === 'bark' ? '#EF4444' : 'white'} />
      <circle cx="88" cy="36" r="2.5" fill={dogState === 'bark' ? '#EF4444' : 'white'} />
      <circle cx="78" cy="36" r="1.2" fill="black" />
      <circle cx="88" cy="36" r="1.2" fill="black" />
      {/* Nose */}
      <circle cx="94" cy="40" r="3" fill="#333" />
      {/* Mouth */}
      {dogState === 'bark' ? (
        <path d="M 90 44 Q 94 50 98 44" stroke="#333" strokeWidth="1.5" fill="none" />
      ) : (
        <path d="M 90 43 Q 94 46 98 43" stroke="#333" strokeWidth="1" fill="none" />
      )}
      {/* Legs */}
      <line x1="32" y1="62" x2="32" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="44" y1="64" x2="44" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="56" y1="64" x2="56" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <line x1="68" y1="62" x2="68" y2="76" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      {/* Tail */}
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
    <div data-interactive className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 max-w-4xl">
        {/* Door scene */}
        <div className="relative flex flex-col items-center">
          {/* Door frame */}
          <div className="relative w-48 h-64">
            <div className="absolute inset-0 border-4 border-amber/60 rounded-t-lg" style={{ background: doorOpen ? 'rgba(34,197,94,0.1)' : 'rgba(17,22,51,0.9)' }}>
              {/* Door */}
              <motion.div
                className="absolute inset-1 rounded-t-sm flex items-center justify-center"
                style={{ background: '#3D2B0F', transformOrigin: 'left center' }}
                animate={doorOpen ? { rotateY: -80, opacity: 0.3 } : { rotateY: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {!doorOpen && (
                  <>
                    <div className="absolute right-4 top-1/2 w-3 h-6 rounded bg-amber/60" />
                    <motion.div
                      className="text-amber/80 font-display text-sm"
                      animate={dogState === 'bark' ? { x: [-2, 2, -2, 0] } : {}}
                      transition={{ duration: 0.1, repeat: 3 }}
                    >
                      LOCKED
                    </motion.div>
                  </>
                )}
              </motion.div>

              {doorOpen && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-green font-display text-lg">ACCESS</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Guard dog */}
          <motion.div
            className="mt-2"
            animate={dogState === 'bark' ? { x: [-3, 3, -3, 0] } : {}}
            transition={{ duration: 0.15, repeat: dogState === 'bark' ? 4 : 0 }}
          >
            <DogSVG />
            <AnimatePresence>
              {dogState === 'bark' && (
                <motion.div
                  className="absolute -top-2 right-0 px-2 py-1 bg-red/20 border border-red/40 rounded text-xs font-code text-red"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  WOOF!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter password..."
              disabled={doorOpen}
              className="px-3 py-1.5 rounded bg-surface border border-white/10 font-code text-sm text-primary focus:outline-none focus:border-blue/50 w-40 disabled:opacity-30"
            />
            <button
              type="submit"
              disabled={doorOpen}
              className="px-3 py-1.5 rounded text-xs font-code bg-amber/20 border border-amber/40 text-amber hover:bg-amber/30 disabled:opacity-30 transition"
            >
              Try
            </button>
          </form>
        </div>

        {/* Code panel */}
        <div className="flex flex-col gap-4 w-80">
          <GlowBox color="#8B5CF6" intensity={0.3}>
            <pre className="font-code text-xs leading-relaxed">
              <span className="text-dim">char </span><span style={{ color: '#00BFFF' }}>password</span><span className="text-dim">[20];</span>{'\n'}
              <span className="text-dim">char </span><span style={{ color: '#22C55E' }}>correct</span><span className="text-dim">[] = &quot;1234&quot;;</span>{'\n\n'}
              <span style={{ color: '#8B5CF6' }}>while</span><span className="text-dim">(</span>
              <span style={{ color: '#F59E0B' }}>strcmp(password, correct) != 0</span>
              <span className="text-dim">) {'{'}</span>{'\n'}
              <span className="text-dim">{'  '}printf(&quot;Password: &quot;);</span>{'\n'}
              <span className="text-dim">{'  '}scanf(&quot;%s&quot;, password);</span>{'\n'}
              <span className="text-dim">{'}'}</span>{'\n'}
              <span className="text-dim">printf(&quot;</span><span style={{ color: '#22C55E' }}>Access granted!</span><span className="text-dim">&quot;);</span>
            </pre>
          </GlowBox>

          {/* Attempt log */}
          <div className="rounded-lg p-3 font-code text-xs max-h-32 overflow-y-auto" style={{ background: 'rgba(17,22,51,0.9)' }}>
            <div className="text-dim mb-1">Attempts:</div>
            {attempts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={a === CORRECT_PASSWORD ? 'text-green' : 'text-red'}
              >
                &gt; &quot;{a}&quot; {a === CORRECT_PASSWORD ? '-- CORRECT' : '-- WRONG'}
              </motion.div>
            ))}
            {attempts.length === 0 && <span className="text-dim/50">No attempts yet</span>}
          </div>
        </div>
      </div>

      <InteractiveIndicator className="absolute top-4 right-4" />
    </div>
  );
}
