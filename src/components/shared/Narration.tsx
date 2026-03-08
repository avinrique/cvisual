'use client';
import { motion } from 'framer-motion';

interface NarrationProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function Narration({ text, delay = 0, className = '' }: NarrationProps) {
  return (
    <motion.div
      className={`absolute bottom-8 left-0 right-0 flex justify-center px-8 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    >
      <p className="text-dim text-center text-base md:text-lg font-body italic max-w-2xl leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </motion.div>
  );
}
