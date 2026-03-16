'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeTyperProps {
  code: string;
  language?: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  onLineComplete?: (lineIndex: number) => void;
  highlightLines?: number[];
  className?: string;
  showLineNumbers?: boolean;
  skipAnimation?: boolean;
}

export default function CodeTyper({
  code,
  language = 'c',
  speed = 40,
  delay = 0,
  onComplete,
  onLineComplete,
  highlightLines = [],
  className = '',
  showLineNumbers = true,
  skipAnimation = false,
}: CodeTyperProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const prevLineRef = useRef(0);

  // Allow parent to skip the typing animation
  useEffect(() => {
    if (skipAnimation && !complete) {
      setDisplayedLength(code.length);
      setComplete(true);
      onComplete?.();
    }
  }, [skipAnimation, complete, code.length, onComplete]);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || complete) return;

    const timer = setTimeout(() => {
      if (displayedLength < code.length) {
        setDisplayedLength(d => d + 1);

        // Check if we completed a line
        const currentText = code.slice(0, displayedLength + 1);
        const currentLine = currentText.split('\n').length - 1;
        if (currentLine > prevLineRef.current) {
          prevLineRef.current = currentLine;
          onLineComplete?.(currentLine - 1);
        }
      } else {
        setComplete(true);
        onComplete?.();
      }
    }, speed + (Math.random() - 0.5) * speed * 0.4);

    return () => clearTimeout(timer);
  }, [started, displayedLength, code, speed, complete, onComplete, onLineComplete]);

  const visibleCode = code.slice(0, displayedLength);
  // Pad with empty lines to maintain layout
  const totalLines = code.split('\n').length;
  const visibleLines = visibleCode.split('\n').length;
  const paddedCode = visibleCode + '\n'.repeat(Math.max(0, totalLines - visibleLines));

  return (
    <motion.div
      className={`rounded-lg overflow-hidden ${className}`}
      style={{
        background: 'rgba(17, 22, 51, 0.95)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Highlight theme={themes.nightOwl} code={paddedCode} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 overflow-x-auto text-sm"
            style={{ ...style, background: 'transparent', margin: 0 }}
          >
            {tokens.map((line, i) => {
              const isHighlighted = highlightLines.includes(i);
              return (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className={`${isHighlighted ? 'bg-white/5 -mx-4 px-4' : ''}`}
                  style={{
                    ...getLineProps({ line }).style,
                    opacity: i < visibleLines ? 1 : 0,
                  }}
                >
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-right mr-4 text-dim select-none text-xs">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
            {!complete && (
              <span className="inline-block w-2 h-4 bg-primary cursor-blink ml-0.5" />
            )}
          </pre>
        )}
      </Highlight>
    </motion.div>
  );
}
