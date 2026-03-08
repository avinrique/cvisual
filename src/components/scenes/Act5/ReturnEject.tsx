'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BitCharacter from '@/components/shared/BitCharacter';
import Narration from '@/components/shared/Narration';
import { useAnimationSpeed } from '@/components/hooks/useAnimationSpeed';

export default function ReturnEject() {
  const [phase, setPhase] = useState(0);
  const { scaledTimeout } = useAnimationSpeed();

  useEffect(() => {
    const cleanups = [
      scaledTimeout(() => setPhase(1), 1500),
      scaledTimeout(() => setPhase(2), 3500),
      scaledTimeout(() => setPhase(3), 5000),
      scaledTimeout(() => setPhase(4), 6500),
      scaledTimeout(() => setPhase(5), 8000),
    ];
    return () => cleanups.forEach(fn => fn());
  }, [scaledTimeout]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* The main() room */}
      <motion.div
        className="relative w-[90%] max-w-2xl h-[70%] max-h-[500px] rounded-lg border-2"
        style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(17,22,51,0.6)' }}
        animate={phase >= 4 ? { opacity: 0.2, scale: 0.95 } : { opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Room label */}
        <motion.div
          className="absolute -top-4 left-4 px-3 py-1 rounded bg-void border border-white/10 font-code text-xs"
          style={{ color: '#8B5CF6' }}
        >
          int main() {'{ }'}
        </motion.div>

        {/* Interior elements */}
        <div className="absolute inset-4 flex flex-col justify-between">
          {/* Loop track (top area) */}
          <motion.div
            className="flex items-center gap-2"
            animate={phase >= 4 ? { opacity: 0.2 } : {}}
          >
            <svg width="180" height="60" viewBox="0 0 180 60">
              <ellipse cx="90" cy="30" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeDasharray="6 4" />
              <text x="90" y="34" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">for loop</text>
            </svg>
          </motion.div>

          {/* Elevator/staircase in middle */}
          <motion.div
            className="flex items-center gap-6 justify-center"
            animate={phase >= 4 ? { opacity: 0.2 } : {}}
          >
            {/* Staircase */}
            <div className="flex flex-col items-end">
              {[3, 2, 1].map(i => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10"
                  style={{ width: 20 + i * 15, height: 10 }}
                />
              ))}
              <span className="text-xs font-code text-dim mt-1">variables</span>
            </div>

            {/* Elevator */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-24 border-2 border-white/10 rounded relative bg-surface/30">
                <div className="absolute top-1 left-1 right-1 h-1 bg-white/10 rounded" />
                <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/10 rounded" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-code text-dim">if/else</span>
              </div>
            </div>
          </motion.div>

          {/* Door at bottom */}
          <div className="flex justify-center">
            <motion.div
              className="relative w-24 h-36 flex flex-col items-center justify-end"
            >
              {/* return 0 label above door */}
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.div
                    className="absolute -top-6 px-3 py-1 rounded font-code text-sm font-bold"
                    style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.5)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    return 0;
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Door */}
              <motion.div
                className="w-20 h-32 rounded-t-lg border-2 flex items-center justify-center relative overflow-hidden"
                style={{
                  borderColor: phase >= 2 ? '#FFD700' : 'rgba(255,255,255,0.2)',
                  background: phase >= 3 ? 'rgba(255,215,0,0.1)' : 'rgba(17,22,51,0.9)',
                }}
                animate={phase >= 3 ? {
                  boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 20px rgba(255,215,0,0.3)', '0 0 0px rgba(255,215,0,0)'],
                } : {}}
                transition={{ duration: 1.5, repeat: phase >= 3 ? Infinity : 0 }}
              >
                <div className="absolute right-2 top-1/2 w-2 h-4 rounded bg-amber/50" />
                {phase >= 3 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-amber/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bit character walking to door */}
        <motion.div
          className="absolute"
          animate={
            phase < 2
              ? { left: '30%', bottom: '25%' }
              : phase < 3
              ? { left: '42%', bottom: '15%' }
              : phase < 4
              ? { left: '42%', bottom: '5%' }
              : { left: '42%', bottom: '-15%', opacity: 0 }
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <BitCharacter
            mood={phase >= 3 ? 'happy' : 'neutral'}
            size={45}
            color="#00BFFF"
          />
        </motion.div>
      </motion.div>

      {/* Room goes dark overlay */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            className="absolute inset-0 bg-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 2 }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="font-code text-xl mb-2" style={{ color: '#FFD700' }}>return 0;</div>
              <div className="text-dim font-body text-sm">The function is over. The room goes dark.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Narration
        text="return ends the function and sends a value back to the caller. return 0 means: everything went fine."
        delay={2}
      />
    </div>
  );
}
