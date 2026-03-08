'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import Narration from '@/components/shared/Narration';

const dishes = ['Soup', 'Salad', 'Steak', 'Dessert'];

export default function DoWhileRestaurant() {
  const [phase, setPhase] = useState(0);
  const [dishIndex, setDishIndex] = useState(0);
  const [servedDishes, setServedDishes] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showATM, setShowATM] = useState(false);

  useEffect(() => {
    if (phase === 0) {
      // Auto-serve first dish immediately
      const t = setTimeout(() => {
        setServedDishes([dishes[0]]);
        setPhase(1);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase >= 1 && phase <= 3) {
      // Ask "More?"
      const t1 = setTimeout(() => setAsking(true), 800);
      const t2 = setTimeout(() => {
        setAsking(false);
        if (dishIndex + 1 < dishes.length) {
          const next = dishIndex + 1;
          setDishIndex(next);
          setServedDishes(prev => [...prev, dishes[next]]);
          setPhase(prev => prev + 1);
        } else {
          setPhase(5);
        }
      }, 2000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (phase === 4) {
      setTimeout(() => setShowComparison(true), 500);
      setTimeout(() => setShowATM(true), 2500);
    }
  }, [phase, dishIndex]);

  // After all dishes served
  useEffect(() => {
    if (servedDishes.length === dishes.length) {
      setTimeout(() => {
        setPhase(4);
        setAsking(false);
      }, 1500);
    }
  }, [servedDishes]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void px-4">
      <motion.h2
        className="font-display text-xl mb-6"
        style={{ color: '#FFD700' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        The do-while Restaurant
      </motion.h2>

      <div className="flex flex-col lg:flex-row items-start gap-8 max-w-5xl">
        {/* Restaurant scene */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Table */}
          <div className="relative w-64 h-40 flex items-end justify-center">
            {/* Waiter */}
            <motion.div className="absolute -left-8 top-0">
              <svg width="50" height="80" viewBox="0 0 50 80">
                <circle cx="25" cy="10" r="8" fill="#F59E0B" />
                <rect x="18" y="18" width="14" height="30" rx="3" fill="#1a1a2e" stroke="#F59E0B" strokeWidth="1" />
                {/* Bow tie */}
                <polygon points="22,20 25,23 28,20" fill="#EF4444" />
                <line x1="18" y1="48" x2="12" y2="72" stroke="#1a1a2e" strokeWidth="4" />
                <line x1="32" y1="48" x2="38" y2="72" stroke="#1a1a2e" strokeWidth="4" />
                {/* Serving arm */}
                <motion.g
                  animate={servedDishes.length > 0 && servedDishes.length <= dishes.length
                    ? { rotate: [0, -30, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  style={{ transformOrigin: '32px 25px' }}
                >
                  <line x1="32" y1="25" x2="48" y2="15" stroke="#1a1a2e" strokeWidth="3" />
                  <ellipse cx="48" cy="13" rx="8" ry="2" fill="#888" />
                </motion.g>
              </svg>
            </motion.div>

            {/* Table surface */}
            <div className="w-48 h-4 bg-amber/30 rounded-t border-t-2 border-amber/60 relative">
              {/* Served dishes */}
              <div className="absolute -top-10 left-0 right-0 flex justify-center gap-2">
                {servedDishes.map((dish, i) => (
                  <motion.div
                    key={i}
                    className="px-2 py-1 rounded bg-surface border border-green/30 text-xs font-code text-green"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {dish}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/4 w-1 h-12 bg-amber/40" />
            <div className="absolute bottom-0 right-1/4 w-1 h-12 bg-amber/40" />
          </div>

          {/* "More?" bubble */}
          <AnimatePresence>
            {asking && (
              <motion.div
                className="px-4 py-2 rounded-full border-2 border-amber/50 bg-amber/10 font-display text-amber text-sm"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                More? (condition check AFTER)
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key insight */}
          <motion.div
            className="mt-2 px-4 py-2 rounded border-2 font-code text-sm text-center"
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Always executes at least once!
          </motion.div>
        </div>

        {/* Comparison + code */}
        <div className="flex flex-col gap-4 w-80">
          {/* Side by side comparison */}
          {showComparison && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlowBox color="#00BFFF" intensity={0.3} className="flex-1">
                <div className="text-xs font-code">
                  <div style={{ color: '#00BFFF' }} className="mb-1">while</div>
                  <div className="text-dim">Check FIRST</div>
                  <div className="text-dim">then execute</div>
                  <div className="text-dim mt-1 text-xs">May run 0 times</div>
                </div>
              </GlowBox>
              <GlowBox color="#F59E0B" intensity={0.3} className="flex-1">
                <div className="text-xs font-code">
                  <div style={{ color: '#F59E0B' }} className="mb-1">do-while</div>
                  <div className="text-dim">Execute FIRST</div>
                  <div className="text-dim">then check</div>
                  <div className="text-red mt-1 text-xs">Runs 1+ times</div>
                </div>
              </GlowBox>
            </motion.div>
          )}

          {/* Code */}
          <GlowBox color="#8B5CF6" intensity={0.3}>
            <pre className="font-code text-xs leading-relaxed">
              <span style={{ color: '#8B5CF6' }}>do</span><span className="text-dim"> {'{'}</span>{'\n'}
              <span className="text-dim">{'  '}serveDish();</span>{'\n'}
              <span className="text-dim">{'  '}printf(&quot;More?&quot;);</span>{'\n'}
              <span className="text-dim">{'  '}scanf(&quot;%c&quot;, &amp;ans);</span>{'\n'}
              <span className="text-dim">{'}'} </span>
              <span style={{ color: '#8B5CF6' }}>while</span>
              <span className="text-dim">(ans == &apos;y&apos;);</span>
            </pre>
          </GlowBox>

          {/* ATM example */}
          <AnimatePresence>
            {showATM && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlowBox color="#06B6D4" intensity={0.2}>
                  <div className="text-xs font-code">
                    <div style={{ color: '#06B6D4' }} className="mb-1">Practical: ATM Menu</div>
                    <div className="text-dim">do {'{'}</div>
                    <div className="text-dim">{'  '}showMenu();</div>
                    <div className="text-dim">{'  '}choice = getInput();</div>
                    <div className="text-dim">{'  '}processChoice(choice);</div>
                    <div className="text-dim">{'}'} while(choice != 0);</div>
                    <div className="text-dim/60 mt-1 text-xs italic">Menu always shows once!</div>
                  </div>
                </GlowBox>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Narration text="do-while: act first, ask questions later." delay={3} />
    </div>
  );
}
