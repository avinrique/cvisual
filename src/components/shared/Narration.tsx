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
      <motion.p
        className="text-center text-xl md:text-2xl font-body italic max-w-2xl leading-relaxed"
        style={{
          color: 'var(--accent-gold)',
          textShadow: '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
        }}
        animate={{
          textShadow: [
            '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
            '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.5)',
            '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        &ldquo;{text}&rdquo;
      </motion.p>
    </motion.div>
  );
}
