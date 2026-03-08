'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ConveyorBeltProps {
  items: { id: string; content: ReactNode; slot?: boolean }[];
  direction?: 'left' | 'right';
  speed?: number;
  className?: string;
}

export default function ConveyorBelt({
  items,
  direction = 'right',
  speed = 2,
  className = '',
}: ConveyorBeltProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Belt track */}
      <div className="relative h-16 flex items-center">
        {/* Belt surface */}
        <div className="absolute inset-0 bg-surface rounded border border-white/10">
          {/* Moving dashes */}
          <motion.div
            className="absolute inset-0 flex items-center gap-4 px-4"
            animate={{ x: direction === 'right' ? [0, -20] : [-20, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-4 h-0.5 bg-dim/30 flex-shrink-0" />
            ))}
          </motion.div>
        </div>

        {/* Items on belt */}
        <div className="relative flex items-center gap-3 px-4 z-10">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{
                x: direction === 'right' ? -50 : 50,
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: index * (1 / speed),
                duration: 0.5,
              }}
              className={`flex-shrink-0 px-3 py-1 rounded font-code text-sm ${
                item.slot
                  ? 'border-2 border-dashed border-blue/50 bg-blue/10 min-w-[40px] text-center'
                  : 'text-primary'
              }`}
            >
              {item.content}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Belt supports */}
      <div className="flex justify-between px-2 mt-1">
        <div className="w-4 h-4 rounded-full border-2 border-dim/30" />
        <div className="w-4 h-4 rounded-full border-2 border-dim/30" />
      </div>
    </div>
  );
}
