'use client';
import { motion } from 'framer-motion';

export default function InteractiveIndicator({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center gap-2 text-xs text-dim ${className}`}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        className="text-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        👆
      </motion.span>
      <span className="font-body uppercase tracking-wider">Try it</span>
    </motion.div>
  );
}
