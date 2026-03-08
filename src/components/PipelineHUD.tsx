'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface PipelineHUDProps {
  activeStage?: 'input' | 'process' | 'output' | null;
}

export default function PipelineHUD({ activeStage }: PipelineHUDProps) {
  const visible = useAppStore(s => s.pipelineHUDVisible);

  const stages = [
    { id: 'input', label: 'INPUT', color: 'var(--accent-blue)', glowColor: 'var(--glow-blue)' },
    { id: 'process', label: 'PROCESS', color: 'var(--accent-amber)', glowColor: 'var(--glow-amber)' },
    { id: 'output', label: 'OUTPUT', color: 'var(--accent-green)', glowColor: 'var(--glow-green)' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-6 right-4 z-40 flex items-center gap-1"
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <motion.div
                className="px-2 py-1 rounded text-[10px] font-display tracking-wider border"
                style={{
                  borderColor: activeStage === stage.id ? stage.color : 'rgba(255,255,255,0.1)',
                  color: activeStage === stage.id ? stage.color : 'var(--text-dim)',
                  boxShadow: activeStage === stage.id ? `0 0 10px ${stage.glowColor}` : 'none',
                  background: activeStage === stage.id ? `${stage.color}15` : 'transparent',
                }}
                animate={
                  activeStage === stage.id
                    ? { scale: [1, 1.05, 1], transition: { duration: 0.5 } }
                    : {}
                }
              >
                {stage.label}
              </motion.div>
              {i < stages.length - 1 && (
                <span className="text-dim text-xs mx-1">&rarr;</span>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
