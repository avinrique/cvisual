'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowBox from '@/components/shared/GlowBox';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

const BASE = 7;

export default function MultiplicationFactory() {
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [products, setProducts] = useState<{ m: number; p: number }[]>([]);
  const [spark, setSpark] = useState(false);
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    if (currentMultiplier >= 10) return;

    const cancelTimer = scaledTimeout(() => {
      const m = currentMultiplier + 1;
      setCurrentMultiplier(m);
      setSpark(true);
      scaledTimeout(() => {
        setSpark(false);
        setProducts(prev => [...prev, { m, p: BASE * m }]);
      }, 500);
    }, 1400);

    return () => cancelTimer();
  }, [currentMultiplier, scaledTimeout]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void px-4">
      <motion.h2
        className="font-display text-xl md:text-2xl mb-6"
        style={{ color: '#FFD700' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        The Multiplication Factory
      </motion.h2>

      <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-4xl">
        {/* Assembly line */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Platform with base number */}
          <div className="flex items-center gap-4">
            <GlowBox color="#00BFFF" intensity={0.5}>
              <span className="font-code text-3xl font-bold" style={{ color: '#00BFFF' }}>{BASE}</span>
            </GlowBox>

            <motion.span className="text-2xl text-dim font-code">&times;</motion.span>

            {/* Incoming multiplier on belt */}
            <div className="relative w-20 h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentMultiplier > 0 && currentMultiplier <= 10 && (
                  <motion.div
                    key={currentMultiplier}
                    className="absolute"
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -80, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5 }}
                  >
                    <GlowBox color="#F59E0B" intensity={0.4}>
                      <span className="font-code text-2xl font-bold" style={{ color: '#F59E0B' }}>{currentMultiplier}</span>
                    </GlowBox>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.span className="text-2xl text-dim font-code">=</motion.span>

            {/* Spark & product */}
            <div className="relative w-20 h-16 flex items-center justify-center">
              {spark && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <motion.div
                      key={deg}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FFD700' }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((deg * Math.PI) / 180) * 25,
                        y: Math.sin((deg * Math.PI) / 180) * 25,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  ))}
                </motion.div>
              )}
              <AnimatePresence mode="wait">
                {products.length > 0 && (
                  <motion.div
                    key={products[products.length - 1].p}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <GlowBox color="#22C55E" intensity={0.4}>
                      <span className="font-code text-2xl font-bold" style={{ color: '#22C55E' }}>
                        {products[products.length - 1].p}
                      </span>
                    </GlowBox>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Conveyor belt visual */}
          <div className="w-full max-w-sm h-4 rounded bg-surface border border-white/10 overflow-hidden">
            <motion.div
              className="flex gap-2 h-full items-center px-2"
              animate={{ x: [0, -16] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-3 h-0.5 bg-dim/30 flex-shrink-0" />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Multiplication table */}
        <div
          className="rounded-lg p-4 w-56"
          style={{ background: 'rgba(17,22,51,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="text-xs font-code text-dim mb-2 text-center">Multiplication Table of {BASE}</div>
          <div className="space-y-1">
            {products.map((p, i) => (
              <motion.div
                key={i}
                className="flex justify-between font-code text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span className="text-dim">{BASE} x {p.m}</span>
                <span className="text-dim">=</span>
                <span style={{ color: '#22C55E' }}>{p.p}</span>
              </motion.div>
            ))}
            {products.length === 0 && (
              <div className="text-dim text-xs text-center py-4">Building...</div>
            )}
          </div>
        </div>
      </div>

      {/* Code display */}
      <motion.div
        className="mt-6 font-code text-xs text-dim max-w-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2 }}
      >
        for(int i=1; i&lt;=10; i++) printf(&quot;{BASE} x %d = %d\n&quot;, i, {BASE}*i);
      </motion.div>
    </div>
  );
}
