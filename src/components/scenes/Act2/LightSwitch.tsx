'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Terminal from '@/components/shared/Terminal';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import Narration from '@/components/shared/Narration';

export default function LightSwitch() {
  const [isOn, setIsOn] = useState(false);

  const codeOn = `if (1) {
  printf("Light is ON!");
  // 1 = TRUE
}`;
  const codeOff = `if (0) {
  // This NEVER runs
  // 0 = FALSE
}`;

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center transition-all duration-700"
      style={{
        background: isOn
          ? 'radial-gradient(ellipse at 50% 40%, #2a2520 0%, #1a1408 40%, #0d0a04 100%)'
          : 'radial-gradient(ellipse at 50% 50%, #0a0a14 0%, #050510 50%, #000005 100%)',
      }}
    >
      {/* Ambient light glow when ON */}
      <AnimatePresence>
        {isOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.15) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Wall plate + switch */}
      <div className="flex flex-col items-center gap-12">
        {/* Giant number display */}
        <motion.div
          className="text-center"
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
        >
          <motion.span
            className="font-display font-bold select-none"
            style={{
              fontSize: 'clamp(80px, 15vw, 160px)',
              color: isOn ? '#FFD700' : '#333',
              textShadow: isOn
                ? '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3)'
                : 'none',
            }}
            key={isOn ? 'one' : 'zero'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isOn ? '1' : '0'}
          </motion.span>

          {/* Labels */}
          <motion.div
            className="flex gap-6 justify-center mt-2"
            key={isOn ? 'on-labels' : 'off-labels'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isOn ? (
              <>
                <span className="font-code text-sm px-3 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">TRUE</span>
                <span className="font-code text-sm px-3 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">ON</span>
                <span className="font-code text-sm px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">YES</span>
              </>
            ) : (
              <>
                <span className="font-code text-sm px-3 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">FALSE</span>
                <span className="font-code text-sm px-3 py-1 rounded bg-gray-500/20 text-gray-500 border border-gray-500/30">OFF</span>
                <span className="font-code text-sm px-3 py-1 rounded bg-gray-500/20 text-gray-500 border border-gray-500/30">NO</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* 3D Light Switch */}
        <div className="relative" style={{ perspective: '600px' }}>
          <motion.div
            className="relative cursor-pointer select-none"
            onClick={() => setIsOn(!isOn)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Wall plate */}
            <div
              className="w-24 h-40 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #e8e0d0 0%, #d4cbb8 100%)',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.5),
                  inset 0 -1px 0 rgba(0,0,0,0.1),
                  0 4px 20px rgba(0,0,0,0.5),
                  0 0 0 2px rgba(0,0,0,0.1)
                `,
              }}
            >
              {/* Toggle */}
              <motion.div
                className="w-10 h-16 rounded-sm relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #f5f0e6 0%, #d9d0bd 100%)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.8),
                    0 2px 8px rgba(0,0,0,0.3)
                  `,
                  transformOrigin: isOn ? 'bottom center' : 'top center',
                }}
                animate={{
                  rotateX: isOn ? -15 : 15,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                {/* Subtle ridge on toggle */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-4 rounded-full"
                  style={{
                    height: 2,
                    background: 'rgba(0,0,0,0.15)',
                    top: isOn ? '30%' : '65%',
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          <InteractiveIndicator className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap" />
        </div>

        {/* BitCharacter */}
        <motion.div
          className="absolute bottom-24 left-8"
          animate={{ x: isOn ? 10 : 0 }}
        >
          <BitCharacter
            mood={isOn ? 'happy' : 'scared'}
            size={50}
            color={isOn ? '#FFD700' : '#555'}
            label="Bit"
          />
        </motion.div>
      </div>

      {/* Code overlay */}
      <motion.div
        className="absolute top-6 right-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Terminal title="boolean.c" width="w-72" showCursor={false}>
          <pre className="font-code text-xs leading-relaxed">
            <code style={{ color: isOn ? '#22C55E' : '#EF4444' }}>
              {isOn ? codeOn : codeOff}
            </code>
          </pre>
        </Terminal>
      </motion.div>

      <Narration
        text={
          isOn
            ? 'In C, 1 means true. Any non-zero value is truth.'
            : 'Zero is the only falsehood in C. Flip the switch to see truth.'
        }
      />
    </div>
  );
}
