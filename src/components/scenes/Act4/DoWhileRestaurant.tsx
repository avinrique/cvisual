'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';
import { useAppStore } from '@/lib/store';

const DISHES = [
  { name: 'Soup', emoji: '🍜', color: '#22C55E' },
  { name: 'Salad', emoji: '🥗', color: '#4ADE80' },
  { name: 'Steak', emoji: '🥩', color: '#EF4444' },
  { name: 'Dessert', emoji: '🍰', color: '#F59E0B' },
];

// Loop flow phases per dish:
// 'serve'  → dish lands on table (DO body executes)
// 'ask'    → waiter asks "More?" (WHILE condition check)
// 'answer' → customer says "Yes!" or "No, full!"
// After all dishes: 'done'

type FlowPhase = 'idle' | 'serve' | 'ask' | 'answer' | 'done';

const CODE_LINES = [
  { text: '#include <stdio.h>', colored: [{ text: '#include <stdio.h>', color: 'var(--accent-purple)' }] },
  { text: '', colored: [] },
  { text: 'int main() {', colored: [{ text: 'int', color: 'var(--accent-blue)' }, { text: ' main() {', color: 'var(--text-dim)' }] },
  { text: '    int more = 1, dish = 0;', colored: [{ text: '    ', color: '' }, { text: 'int', color: 'var(--accent-blue)' }, { text: ' more = 1, dish = 0;', color: 'var(--text-dim)' }] },
  { text: '', colored: [] },
  { text: '    do {', colored: [{ text: '    ', color: '' }, { text: 'do', color: 'var(--accent-purple)' }, { text: ' {', color: 'var(--text-dim)' }] },
  { text: '        serveDish(dish);', colored: [{ text: '        ', color: '' }, { text: 'serveDish', color: 'var(--accent-gold)' }, { text: '(dish);', color: 'var(--text-dim)' }] },
  { text: '        dish++;', colored: [{ text: '        dish', color: 'var(--text-primary)' }, { text: '++;', color: 'var(--accent-amber)' }] },
  { text: '        printf("More? ");', colored: [{ text: '        ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"More? "', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { text: '        scanf("%d", &more);', colored: [{ text: '        ', color: '' }, { text: 'scanf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"%d"', color: 'var(--accent-green)' }, { text: ', &more);', color: 'var(--text-dim)' }] },
  { text: '    } while (more);', colored: [{ text: '    } ', color: 'var(--text-dim)' }, { text: 'while', color: 'var(--accent-purple)' }, { text: ' (more);', color: 'var(--text-dim)' }] },
  { text: '', colored: [] },
  { text: '    printf("Full!\\n");', colored: [{ text: '        ', color: '' }, { text: 'printf', color: 'var(--accent-gold)' }, { text: '(', color: 'var(--text-dim)' }, { text: '"Full!\\n"', color: 'var(--accent-green)' }, { text: ');', color: 'var(--text-dim)' }] },
  { text: '    return 0;', colored: [{ text: '    ', color: '' }, { text: 'return', color: 'var(--accent-purple)' }, { text: ' 0;', color: 'var(--text-dim)' }] },
  { text: '}', colored: [{ text: '}', color: 'var(--text-dim)' }] },
];

export default function DoWhileRestaurant() {
  const [dishIndex, setDishIndex] = useState(-1);
  const [servedDishes, setServedDishes] = useState<typeof DISHES>([]);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>('idle');
  const [highlightLine, setHighlightLine] = useState(-1);
  const [loopCount, setLoopCount] = useState(0);
  const { scaledTimeout } = useAnimationSpeed();
  const [step, setStep] = useState(0);

  // Step handler for arrow-key navigation
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const stepRef = useRef(step);
  stepRef.current = step;

  const stableStepHandler = useCallback(() => {
    if (stepRef.current >= 5) return false;
    setStep(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (stepRef.current <= 0) return false;
    setStep(prev => prev - 1);
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

  // Step-driven dish serving with auto-play sub-animations
  useEffect(() => {
    if (step === 0) return; // idle, waiting for first arrow press

    if (step >= 1 && step <= 4) {
      const idx = step - 1;
      setDishIndex(idx);
      setFlowPhase('serve');
      setHighlightLine(5); // do {
      setLoopCount(idx);

      // Sub-animation: serve → ask → answer
      const c1 = scaledTimeout(() => {
        setHighlightLine(6); // serveDish()
        const c2 = scaledTimeout(() => {
          setServedDishes(prev => [...prev, DISHES[idx]]);
          setHighlightLine(7); // dish++
          const c3 = scaledTimeout(() => {
            setFlowPhase('ask');
            setHighlightLine(8); // printf("More?")
            const c4 = scaledTimeout(() => {
              setHighlightLine(10); // while (more)
              setFlowPhase('answer');
            }, 800);
            return c4;
          }, 400);
          return c3;
        }, 600);
        return c2;
      }, 100);
      return c1;
    }

    if (step === 5) {
      setFlowPhase('done');
      setHighlightLine(12); // printf("Full!")
    }
  }, [step, scaledTimeout]);

  const isLastDish = dishIndex >= DISHES.length - 1;
  const currentDish = dishIndex >= 0 ? DISHES[dishIndex] : null;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      <div className="flex items-start gap-8 px-6 max-w-6xl w-full">
        {/* Left — Restaurant scene */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <motion.h2
            className="font-display text-xl tracking-wider"
            style={{ color: '#FFD700' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            The do-while Restaurant
          </motion.h2>

          {/* Restaurant visual */}
          <div className="relative w-full max-w-lg h-[320px] rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #1a1028 0%, #12101e 100%)' }}
          >
            {/* Ambient lights */}
            <div className="absolute top-4 left-1/4 w-2 h-2 rounded-full bg-amber/40" style={{ boxShadow: '0 0 20px 8px rgba(245,158,11,0.15)' }} />
            <div className="absolute top-4 right-1/4 w-2 h-2 rounded-full bg-amber/40" style={{ boxShadow: '0 0 20px 8px rgba(245,158,11,0.15)' }} />

            {/* Waiter */}
            <motion.div
              className="absolute left-6 top-12"
              animate={flowPhase === 'serve' ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl">🧑‍🍳</div>
                <AnimatePresence mode="wait">
                  {flowPhase === 'serve' && currentDish && (
                    <motion.div
                      key={`serving-${dishIndex}`}
                      className="px-2 py-0.5 rounded text-[10px] font-code mt-1"
                      style={{ background: `${currentDish.color}20`, color: currentDish.color, border: `1px solid ${currentDish.color}40` }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Serving {currentDish.name}!
                    </motion.div>
                  )}
                  {flowPhase === 'ask' && (
                    <motion.div
                      className="px-3 py-1 rounded-full text-xs font-display mt-1"
                      style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      More? 🤔
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Customer */}
            <motion.div className="absolute right-6 top-12">
              <div className="flex flex-col items-center">
                <div className="text-4xl">😋</div>
                <AnimatePresence mode="wait">
                  {flowPhase === 'answer' && (
                    <motion.div
                      key={`answer-${dishIndex}`}
                      className="px-3 py-1 rounded-full text-xs font-display mt-1"
                      style={{
                        background: isLastDish ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                        color: isLastDish ? '#EF4444' : '#22C55E',
                        border: `1px solid ${isLastDish ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {isLastDish ? 'No, full! 🫃' : 'Yes please! 👍'}
                    </motion.div>
                  )}
                  {flowPhase === 'done' && (
                    <motion.div
                      className="px-3 py-1 rounded-full text-xs font-display mt-1"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      Full! 😴
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Table */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
              {/* Table top */}
              <div className="w-72 h-3 bg-amber-900/60 rounded-t-lg border-t-2 border-amber/40 relative"
                style={{ boxShadow: '0 -4px 20px rgba(245,158,11,0.1)' }}
              >
                {/* Plates on table */}
                <div className="absolute -top-14 left-0 right-0 flex justify-center gap-3">
                  {servedDishes.map((dish, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center"
                      initial={{ y: -40, opacity: 0, scale: 0.3 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                      <span className="text-2xl">{dish.emoji}</span>
                      <span className="text-[10px] font-code" style={{ color: dish.color }}>{dish.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Table legs */}
              <div className="flex justify-between px-8">
                <div className="w-1.5 h-10 bg-amber-900/40 rounded-b" />
                <div className="w-1.5 h-10 bg-amber-900/40 rounded-b" />
              </div>
            </div>

            {/* Loop flow indicator at bottom */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-2">
                {DISHES.map((d, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full border"
                    style={{
                      borderColor: i <= dishIndex ? d.color : 'rgba(255,255,255,0.1)',
                      background: i <= dishIndex ? `${d.color}40` : 'transparent',
                    }}
                    animate={i === dishIndex ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.6, repeat: i === dishIndex ? Infinity : 0 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Key insight + comparison */}
          <div className="flex gap-4 w-full max-w-lg">
            <motion.div
              className="flex-1 rounded-xl px-4 py-3 border text-center"
              style={{ borderColor: '#00BFFF40', background: '#00BFFF08' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="font-code text-sm font-bold" style={{ color: '#00BFFF' }}>while</div>
              <div className="text-xs text-dim mt-1">Check FIRST</div>
              <div className="text-xs text-dim">then execute</div>
              <div className="text-[10px] text-dim/60 mt-1">May run 0 times</div>
            </motion.div>

            <motion.div
              className="flex-1 rounded-xl px-4 py-3 border text-center relative overflow-hidden"
              style={{ borderColor: '#F59E0B40', background: '#F59E0B08' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="font-code text-sm font-bold" style={{ color: '#F59E0B' }}>do-while</div>
              <div className="text-xs text-dim mt-1">Execute FIRST</div>
              <div className="text-xs text-dim">then check</div>
              <div className="text-[10px] font-bold mt-1" style={{ color: '#EF4444' }}>Runs 1+ times!</div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2"
                style={{ borderColor: '#F59E0B' }}
                animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Right — Code panel */}
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
              <span className="text-xs text-dim ml-2 font-code">restaurant.c</span>
            </div>

            <div className="px-3 py-3 font-code text-xs leading-relaxed">
              {CODE_LINES.map((line, i) => {
                const isHighlighted = highlightLine === i;
                const isDoWhileBlock = i >= 5 && i <= 10;

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-1.5 py-0.5 rounded transition-colors duration-300"
                    style={{
                      background: isHighlighted
                        ? 'rgba(245,158,11,0.12)'
                        : isDoWhileBlock ? 'rgba(139,92,246,0.03)' : 'transparent',
                      borderLeft: isHighlighted
                        ? '2px solid var(--accent-amber)'
                        : isDoWhileBlock ? '2px solid rgba(139,92,246,0.15)' : '2px solid transparent',
                    }}
                    animate={{ opacity: highlightLine >= 0 && !isHighlighted && highlightLine > i ? 0.4 : 1 }}
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
              key={`${flowPhase}-${dishIndex}`}
              className="mt-3 text-center text-xs font-body text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              {flowPhase === 'idle' && 'Customer sits down...'}
              {flowPhase === 'serve' && currentDish && `Serving ${currentDish.name} ${currentDish.emoji} (loop iteration ${loopCount + 1})`}
              {flowPhase === 'ask' && 'Waiter asks: "Want more?"'}
              {flowPhase === 'answer' && !isLastDish && 'Customer: "Yes!" → loop continues'}
              {flowPhase === 'answer' && isLastDish && 'Customer: "No!" → while(more) is FALSE'}
              {flowPhase === 'done' && 'Loop exited — customer is full!'}
            </motion.div>
          </AnimatePresence>

          {/* Output terminal */}
          <div
            className="mt-4 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(17, 22, 51, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30">
              <span className="text-[10px] text-dim font-code">output</span>
            </div>
            <div className="px-3 py-2 font-code text-xs max-h-32 overflow-y-auto">
              {servedDishes.length === 0 && <span className="text-dim/40">waiting...</span>}
              {servedDishes.map((dish, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-green">Served: {dish.name}</span>
                  {i < DISHES.length - 1 && <span className="text-amber"> → More? Yes</span>}
                  {i === DISHES.length - 1 && <span className="text-red"> → More? No</span>}
                </motion.div>
              ))}
              {flowPhase === 'done' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gold mt-1"
                >
                  Full! 😊
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Narration
        text={
          step === 0
            ? 'The customer sits down. In a do-while restaurant, the first dish is guaranteed — no questions asked.'
            : flowPhase === 'serve'
            ? `The kitchen serves dish #${dishIndex + 1} — the body executes BEFORE checking the condition.`
            : flowPhase === 'ask'
            ? 'Now the waiter asks: "More?" — this is the while(more) check AFTER the body ran.'
            : flowPhase === 'answer' && !isLastDish
            ? 'Customer says "Yes!" — condition is true, so the loop runs again from the top.'
            : flowPhase === 'answer' && isLastDish
            ? 'Customer says "No, full!" — condition is false, so the loop finally exits.'
            : flowPhase === 'done'
            ? 'do-while always runs at least once. Unlike while, it acts first and asks questions later.'
            : 'do-while: act first, ask questions later. The body always runs at least once.'
        }
      />
    </div>
  );
}
