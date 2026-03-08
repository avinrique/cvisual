'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Terminal from '@/components/shared/Terminal';
import Narration from '@/components/shared/Narration';

export default function BMICalculator() {
  const [phase, setPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rube Goldberg chain: 0: funnels appear, 1: numbers drop in,
  // 2: roll down ramps, 3: height*height, 4: weight/height^2,
  // 5: BMI drops out, 6: printf catches, 7: terminal shows

  const weight = 70;
  const height = 1.75;
  const heightSquared = +(height * height).toFixed(4);
  const bmi = +(weight / heightSquared).toFixed(1);

  useEffect(() => {
    const delays = [800, 2000, 3500, 5000, 6200, 7500, 8800];
    const t = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d));
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void"
    >
      {/* Title */}
      <motion.h2
        className="absolute top-8 font-display text-lg text-amber tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        BMI = weight / (height * height)
      </motion.h2>

      {/* Machine visualization */}
      <div className="relative w-[600px] h-[400px]">
        {/* Two funnels at top */}
        <motion.div
          className="absolute left-16 top-0 flex flex-col items-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Weight funnel */}
          <div className="relative">
            <svg width="80" height="60" viewBox="0 0 80 60">
              <path d="M10 0 L70 0 L50 60 L30 60 Z" fill="none" stroke="var(--accent-blue)" strokeWidth="2" />
            </svg>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-blue font-code text-xs">
              weight
            </span>
          </div>
          {/* Number dropping — stays visible until phase 5, animates to divide box at phase 4 */}
          {/* Funnel is at left:64px. Divide box is at left:265px top:265px (80x64). */}
          {/* Relative to funnel origin: divide box center ≈ x:241 y:297 */}
          {phase >= 1 && phase < 5 && (
            <motion.div
              className="absolute font-code text-lg text-blue font-bold"
              style={{ textShadow: '0 0 10px var(--glow-blue)' }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: phase >= 4 ? 285 : phase >= 2 ? 120 : 30,
                x: phase >= 4 ? 225 : phase >= 2 ? 60 : 0,
                opacity: 1,
              }}
              transition={{ duration: 1.2, ease: 'easeIn' }}
            >
              {weight}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="absolute right-16 top-0 flex flex-col items-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Height funnel */}
          <div className="relative">
            <svg width="80" height="60" viewBox="0 0 80 60">
              <path d="M10 0 L70 0 L50 60 L30 60 Z" fill="none" stroke="var(--accent-green)" strokeWidth="2" />
            </svg>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-green font-code text-xs">
              height
            </span>
          </div>
          {/* Number dropping */}
          {phase >= 1 && (
            <motion.div
              className="absolute font-code text-lg text-green font-bold"
              style={{ textShadow: '0 0 10px var(--glow-green)' }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: phase >= 2 ? 120 : 30,
                x: phase >= 2 ? -60 : 0,
                opacity: phase >= 3 ? 0 : 1,
              }}
              transition={{ duration: 1.2, ease: 'easeIn' }}
            >
              {height}
            </motion.div>
          )}
        </motion.div>

        {/* Ramps (diagonal lines) */}
        <motion.svg
          className="absolute inset-0"
          width="600"
          height="400"
          viewBox="0 0 600 400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.3 }}
        >
          {/* Left ramp from weight funnel to divide box */}
          <line x1="130" y1="60" x2="305" y2="290" stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Right ramp from height funnel to multiply box */}
          <line x1="470" y1="60" x2="320" y2="180" stroke="var(--accent-green)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Down from multiply to divide */}
          <line x1="320" y1="200" x2="305" y2="270" stroke="var(--accent-amber)" strokeWidth="1.5" strokeDasharray="4 4" />
        </motion.svg>

        {/* Multiply box: height * height */}
        <motion.div
          className="absolute left-[280px] top-[160px] w-20 h-16 rounded-lg border flex flex-col items-center justify-center"
          style={{
            borderColor: phase >= 3 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)',
            background: phase >= 3 ? 'rgba(245,158,11,0.1)' : 'rgba(17,22,51,0.8)',
            boxShadow: phase >= 3 ? '0 0 15px var(--glow-amber)' : 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-amber font-code text-lg">x</span>
          <span className="text-xs text-dim">multiply</span>
        </motion.div>

        {/* Height squared result */}
        {phase >= 3 && (
          <motion.div
            className="absolute left-[275px] top-[230px] font-code text-sm text-amber"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: phase >= 4 ? 0 : 1,
              y: phase >= 4 ? 40 : 0,
            }}
            transition={{ duration: 0.8 }}
          >
            {height} x {height} = {heightSquared}
          </motion.div>
        )}

        {/* Divide box: weight / height^2 */}
        <motion.div
          className="absolute left-[265px] top-[265px] w-20 h-16 rounded-lg border flex flex-col items-center justify-center"
          style={{
            borderColor: phase >= 4 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
            background: phase >= 4 ? 'rgba(255,215,0,0.1)' : 'rgba(17,22,51,0.8)',
            boxShadow: phase >= 4 ? '0 0 15px var(--glow-gold)' : 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-gold font-code text-lg">/</span>
          <span className="text-xs text-dim">divide</span>
        </motion.div>

        {/* BMI result dropping out */}
        {phase >= 5 && (
          <motion.div
            className="absolute left-[260px] top-[340px] flex flex-col items-center"
            initial={{ opacity: 0, y: -20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <motion.div
              className="px-4 py-2 rounded-lg border-2 border-gold/60 font-code text-2xl text-gold font-bold"
              style={{
                background: 'rgba(255,215,0,0.1)',
                boxShadow: '0 0 30px var(--glow-gold)',
              }}
              animate={{
                y: phase >= 6 ? 30 : 0,
                x: phase >= 6 ? 80 : 0,
                scale: phase >= 6 ? 0.7 : 1,
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              BMI: {bmi}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* printf catching and announcing */}
      {phase >= 6 && (
        <motion.div
          className="flex items-center gap-2 -mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-code text-sm text-gold">printf(&quot;BMI: %.1f\n&quot;, bmi);</span>
          <motion.span
            className="text-lg"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            </svg>
          </motion.span>
        </motion.div>
      )}

      {/* Terminal output */}
      {phase >= 7 && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Terminal title="output" showCursor={true} width="w-80">
            <motion.div
              className="text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-green">Enter weight: <span className="text-primary">{weight}</span></div>
              <div className="text-green">Enter height: <span className="text-primary">{height}</span></div>
              <motion.div
                className="text-gold mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                BMI: {bmi}
              </motion.div>
            </motion.div>
          </Terminal>
        </motion.div>
      )}

      {phase >= 7 && (
        <Narration
          text="scanf pours data in, the machine crunches it, printf announces the result. That's the complete I/O pipeline."
          delay={0.5}
        />
      )}
    </div>
  );
}
