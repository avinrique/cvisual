'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import GlowBox from '@/components/shared/GlowBox';
import Narration from '@/components/shared/Narration';
import Terminal from '@/components/shared/Terminal';
import BitCharacter from '@/components/shared/BitCharacter';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';

const NARRATIONS: Record<number, string> = {
  0: 'Updating a variable means taking the old value and building on it.',
  1: 'C gives you a shortcut. += means "add to what\'s already there."',
  2: 'Every arithmetic operator has a shortcut version.',
  3: 'i++ and ++i both add 1 — but the order matters.',
  4: 'In a for loop it rarely matters. Inside an expression, it changes your answer.',
};

const OPERATORS = [
  { symbol: '+=', label: 'Add', fn: (a: number, b: number) => a + b, expanded: (v: string, n: number) => `${v} = ${v} + ${n}` },
  { symbol: '-=', label: 'Sub', fn: (a: number, b: number) => a - b, expanded: (v: string, n: number) => `${v} = ${v} - ${n}` },
  { symbol: '*=', label: 'Mul', fn: (a: number, b: number) => a * b, expanded: (v: string, n: number) => `${v} = ${v} * ${n}` },
  { symbol: '/=', label: 'Div', fn: (a: number, b: number) => Math.floor(a / b), expanded: (v: string, n: number) => `${v} = ${v} / ${n}` },
];

const MAX_PHASE = 4;

export default function ShortcutOperators() {
  const [phase, setPhase] = useState(0);
  const [longFormTyped, setLongFormTyped] = useState('');
  const [scoreValue, setScoreValue] = useState(50);
  const [showShortcut, setShowShortcut] = useState(false);
  const [bridgeVisible, setBridgeVisible] = useState(false);

  // Phase 2 interactive state
  const [selectedOp, setSelectedOp] = useState(0);
  const [sliderValue, setSliderValue] = useState(10);
  const [interactiveScore, setInteractiveScore] = useState(50);
  const [scoreHistory, setScoreHistory] = useState<{ op: string; val: number; result: number }[]>([]);

  // Phase 3 state
  const [postStep, setPostStep] = useState(0);
  const [preStep, setPreStep] = useState(0);

  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= MAX_PHASE) return false;
    setPhase(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (phaseRef.current <= 0) return false;
    setPhase(prev => prev - 1);
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

  // Phase 0: Type out long form
  useEffect(() => {
    if (phase !== 0) return;
    setScoreValue(50);
    setLongFormTyped('');
    const fullText = 'score = score + 10;';
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setLongFormTyped(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setScoreValue(60), 400);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 1: Show shortcut with bridge animation
  useEffect(() => {
    if (phase !== 1) return;
    setShowShortcut(false);
    setBridgeVisible(false);
    const t1 = setTimeout(() => setShowShortcut(true), 600);
    const t2 = setTimeout(() => setBridgeVisible(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // Phase 2: Reset interactive state
  useEffect(() => {
    if (phase !== 2) return;
    setInteractiveScore(50);
    setScoreHistory([]);
    setSelectedOp(0);
    setSliderValue(10);
  }, [phase]);

  // Phase 3: Animate postfix/prefix steps
  useEffect(() => {
    if (phase !== 3) return;
    setPostStep(0);
    setPreStep(0);
    const t1 = setTimeout(() => setPostStep(1), 800);
    const t2 = setTimeout(() => setPostStep(2), 1600);
    const t3 = setTimeout(() => setPostStep(3), 2400);
    const t4 = setTimeout(() => setPreStep(1), 3200);
    const t5 = setTimeout(() => setPreStep(2), 4000);
    const t6 = setTimeout(() => setPreStep(3), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [phase]);

  const handleApplyOp = () => {
    const op = OPERATORS[selectedOp];
    const result = op.fn(interactiveScore, sliderValue);
    setScoreHistory(prev => [...prev.slice(-3), { op: op.symbol, val: sliderValue, result }]);
    setInteractiveScore(result);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void">
      {/* Phase 0: Long form variable update */}
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="phase0"
            className="flex flex-col items-center gap-8 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlowBox color="#3B82F6" intensity={0.4} pulse>
              <div className="flex items-center gap-6 px-6 py-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-code text-dim">variable</span>
                  <span className="text-lg font-display text-blue">score</span>
                </div>
                <motion.span
                  className="text-4xl font-code font-bold text-primary"
                  key={scoreValue}
                  initial={{ scale: 1.4, color: '#22C55E' }}
                  animate={{ scale: 1, color: 'var(--text-primary)' }}
                  transition={{ duration: 0.5 }}
                >
                  {scoreValue}
                </motion.span>
                <BitCharacter mood={scoreValue > 50 ? 'happy' : 'neutral'} size={50} color="#3B82F6" label={`=${scoreValue}`} />
              </div>
            </GlowBox>

            <motion.div
              className="font-code text-xl md:text-2xl text-primary/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-blue">int </span>
              <span className="text-primary">{longFormTyped}</span>
              <motion.span
                className="inline-block w-2.5 h-5 bg-primary/60 ml-0.5 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 1: Shortcut with bridge animation */}
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="phase1"
            className="flex flex-col items-center gap-10 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Long form fading out */}
            <motion.div
              className="font-code text-lg text-dim line-through"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              score = score + 10;
            </motion.div>

            {/* Bridge animation */}
            <div className="relative flex items-center gap-6">
              <AnimatePresence>
                {showShortcut && (
                  <motion.div
                    className="font-code text-3xl md:text-4xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <span className="text-blue">score</span>
                    <span className="text-green"> += </span>
                    <span className="text-amber">10</span>
                    <span className="text-dim">;</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {bridgeVisible && (
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-green/30 bg-green/10"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(34,197,94,0.2)',
                          '0 0 25px rgba(34,197,94,0.5)',
                          '0 0 10px rgba(34,197,94,0.2)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-green font-code text-sm">=</span>
                      <svg width="20" height="12" viewBox="0 0 20 12" className="text-green">
                        <motion.path
                          d="M0 6 L14 6 L10 2 M14 6 L10 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </svg>
                      <span className="text-green font-display text-xs tracking-wider">SAME THING</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Visual explanation */}
            <motion.div
              className="flex items-center gap-4 text-sm font-code text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.5 }}
            >
              <span>score</span>
              <span className="text-green">+=</span>
              <span>10</span>
              <span className="text-dim mx-2">means</span>
              <span>score</span>
              <span className="text-dim">=</span>
              <span>score</span>
              <span className="text-dim">+</span>
              <span>10</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Interactive operator playground */}
      <AnimatePresence mode="wait">
        {phase === 2 && (
          <motion.div
            key="phase2"
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InteractiveIndicator className="absolute top-6 right-8" />

            {/* Scoreboard */}
            <GlowBox color="#F59E0B" intensity={0.3}>
              <div className="flex items-center gap-6 px-8 py-3">
                <span className="font-display text-sm text-dim tracking-wider">SCORE</span>
                <motion.span
                  key={interactiveScore}
                  className="text-4xl font-code font-bold text-amber"
                  initial={{ scale: 1.5, color: '#22C55E' }}
                  animate={{ scale: 1, color: 'var(--accent-amber)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {interactiveScore}
                </motion.span>
                <BitCharacter
                  mood={interactiveScore > 50 ? 'excited' : interactiveScore < 10 ? 'sad' : 'neutral'}
                  size={40}
                  color="#F59E0B"
                />
              </div>
            </GlowBox>

            {/* Operator buttons */}
            <div className="flex gap-3">
              {OPERATORS.map((op, i) => (
                <motion.button
                  key={op.symbol}
                  className={`px-5 py-3 rounded-lg border font-code text-lg font-bold transition-colors ${
                    selectedOp === i
                      ? 'border-green bg-green/20 text-green'
                      : 'border-white/10 bg-white/5 text-dim hover:border-white/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOp(i)}
                >
                  {op.symbol}
                </motion.button>
              ))}
            </div>

            {/* Slider */}
            <div className="flex items-center gap-4">
              <span className="font-code text-dim text-sm">value:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-48 accent-green"
              />
              <motion.span
                key={sliderValue}
                className="font-code text-lg text-green font-bold w-8 text-center"
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {sliderValue}
              </motion.span>
            </div>

            {/* Apply button */}
            <motion.button
              className="px-8 py-3 rounded-lg bg-green/20 border border-green/40 text-green font-display text-sm tracking-wider"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyOp}
            >
              APPLY {OPERATORS[selectedOp].symbol} {sliderValue}
            </motion.button>

            {/* Expanded form display */}
            <motion.div
              className="font-code text-sm text-dim mt-2"
              key={`${selectedOp}-${sliderValue}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
            >
              <span className="text-blue">score</span>
              <span className="text-green"> {OPERATORS[selectedOp].symbol} </span>
              <span className="text-amber">{sliderValue}</span>
              <span className="text-dim mx-3">{'//'}</span>
              <span className="text-dim/60">{OPERATORS[selectedOp].expanded('score', sliderValue)}</span>
            </motion.div>

            {/* History */}
            <div className="flex gap-2 min-h-[28px]">
              <AnimatePresence>
                {scoreHistory.map((h, i) => (
                  <motion.span
                    key={`${i}-${h.result}`}
                    className="px-3 py-1 rounded-full text-xs font-code border border-white/10 bg-surface text-dim"
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {h.op}{h.val} = {h.result}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Postfix vs Prefix ticket windows */}
      <AnimatePresence mode="wait">
        {phase === 3 && (
          <motion.div
            key="phase3"
            className="flex items-start gap-12 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Postfix i++ */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="px-6 py-2 rounded-t-lg bg-blue/20 border border-blue/30 border-b-0">
                <span className="font-display text-sm text-blue tracking-wider">POSTFIX</span>
              </div>
              <GlowBox color="#3B82F6" intensity={0.3} className="min-w-[220px]">
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="font-code text-2xl font-bold text-blue">i++</span>
                  <div className="w-full border-t border-white/10 pt-3 space-y-2">
                    <AnimatePresence>
                      {postStep >= 1 && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-xs font-code px-2 py-0.5 rounded bg-amber/10 text-amber">1</span>
                          <span className="font-code text-sm text-primary">returns <span className="text-green font-bold">5</span></span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {postStep >= 2 && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-xs font-code px-2 py-0.5 rounded bg-amber/10 text-amber">2</span>
                          <span className="font-code text-sm text-primary">then i becomes <span className="text-green font-bold">6</span></span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {postStep >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="text-center pt-2"
                        >
                          <span className="text-xs font-body text-dim italic">&ldquo;Use first, increment after&rdquo;</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </GlowBox>
            </motion.div>

            {/* VS divider */}
            <motion.div
              className="flex flex-col items-center justify-center mt-16"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <span className="font-display text-2xl text-dim">vs</span>
              <motion.div
                className="w-0.5 h-16 bg-white/10 mt-2"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </motion.div>

            {/* Prefix ++i */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="px-6 py-2 rounded-t-lg bg-purple/20 border border-purple/30 border-b-0">
                <span className="font-display text-sm text-purple tracking-wider">PREFIX</span>
              </div>
              <GlowBox color="#A855F7" intensity={0.3} className="min-w-[220px]">
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="font-code text-2xl font-bold text-purple">++i</span>
                  <div className="w-full border-t border-white/10 pt-3 space-y-2">
                    <AnimatePresence>
                      {preStep >= 1 && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-xs font-code px-2 py-0.5 rounded bg-amber/10 text-amber">1</span>
                          <span className="font-code text-sm text-primary">i becomes <span className="text-green font-bold">6</span> first</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {preStep >= 2 && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-xs font-code px-2 py-0.5 rounded bg-amber/10 text-amber">2</span>
                          <span className="font-code text-sm text-primary">then returns <span className="text-green font-bold">6</span></span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {preStep >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="text-center pt-2"
                        >
                          <span className="text-xs font-body text-dim italic">&ldquo;Increment first, then use&rdquo;</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </GlowBox>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Terminal printf comparison */}
      <AnimatePresence mode="wait">
        {phase === 4 && (
          <motion.div
            key="phase4"
            className="flex items-start gap-8 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Postfix terminal */}
            <div className="flex flex-col items-center gap-3">
              <motion.span
                className="font-display text-xs text-blue tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                POSTFIX (i++)
              </motion.span>
              <Terminal title="postfix.c" width="w-80" showCursor={false}>
                <div className="space-y-1.5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-blue">int</span> <span className="text-primary">i</span> <span className="text-dim">=</span> <span className="text-amber">5</span><span className="text-dim">;</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-gold">printf</span><span className="text-dim">(</span><span className="text-green">&quot;%d&quot;</span><span className="text-dim">,</span> <span className="text-primary">i++</span><span className="text-dim">);</span>
                  </motion.div>
                  <motion.div
                    className="border-t border-white/10 pt-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <span className="text-dim">output: </span>
                    <motion.span
                      className="text-green font-bold text-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
                    >
                      5
                    </motion.span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1.5 }}
                    className="text-xs text-dim italic"
                  >
                    // prints 5, then i becomes 6
                  </motion.div>
                </div>
              </Terminal>
            </div>

            {/* Prefix terminal */}
            <div className="flex flex-col items-center gap-3">
              <motion.span
                className="font-display text-xs text-purple tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                PREFIX (++i)
              </motion.span>
              <Terminal title="prefix.c" width="w-80" showCursor={false}>
                <div className="space-y-1.5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-blue">int</span> <span className="text-primary">i</span> <span className="text-dim">=</span> <span className="text-amber">5</span><span className="text-dim">;</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-gold">printf</span><span className="text-dim">(</span><span className="text-green">&quot;%d&quot;</span><span className="text-dim">,</span> <span className="text-primary">++i</span><span className="text-dim">);</span>
                  </motion.div>
                  <motion.div
                    className="border-t border-white/10 pt-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <span className="text-dim">output: </span>
                    <motion.span
                      className="text-green font-bold text-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, type: 'spring', stiffness: 300 }}
                    >
                      6
                    </motion.span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1.6 }}
                    className="text-xs text-dim italic"
                  >
                    // i becomes 6 first, then prints 6
                  </motion.div>
                </div>
              </Terminal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration */}
      <AnimatePresence mode="wait">
        {NARRATIONS[phase] && (
          <Narration key={phase} text={NARRATIONS[phase]} delay={0.5} />
        )}
      </AnimatePresence>
    </div>
  );
}
