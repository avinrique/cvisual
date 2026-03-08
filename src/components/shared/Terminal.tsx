'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TerminalProps {
  children: ReactNode;
  title?: string;
  className?: string;
  showCursor?: boolean;
  width?: string;
}

export default function Terminal({
  children,
  title = 'terminal',
  className = '',
  showCursor = true,
  width = 'w-full max-w-lg',
}: TerminalProps) {
  return (
    <motion.div
      className={`rounded-lg overflow-hidden ${width} ${className}`}
      style={{
        background: 'rgba(17, 22, 51, 0.9)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        transform: 'perspective(1000px) rotateX(1deg)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/30">
        <div className="w-3 h-3 rounded-full bg-red/80" />
        <div className="w-3 h-3 rounded-full bg-amber/80" />
        <div className="w-3 h-3 rounded-full bg-green/80" />
        <span className="text-xs text-dim ml-2 font-code">{title}</span>
      </div>

      {/* Content */}
      <div className="p-4 font-code text-sm leading-relaxed min-h-[60px]">
        {children}
        {showCursor && (
          <span className="inline-block w-2 h-4 bg-primary ml-0.5 align-middle cursor-blink" />
        )}
      </div>
    </motion.div>
  );
}
