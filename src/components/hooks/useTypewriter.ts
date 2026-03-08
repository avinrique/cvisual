'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  variableSpeed?: boolean;
  onComplete?: () => void;
  enabled?: boolean;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  variableSpeed = true,
  onComplete,
  enabled = true,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const indexRef = useRef(0);

  const reset = useCallback(() => {
    setDisplayText('');
    setIsComplete(false);
    setIsStarted(false);
    indexRef.current = 0;
  }, []);

  useEffect(() => {
    if (isComplete || !enabled) return;

    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay, isComplete, enabled]);

  useEffect(() => {
    if (!isStarted || isComplete) return;

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;

        const char = text[indexRef.current - 1];
        let nextDelay = speed;
        if (variableSpeed) {
          if (char === '.' || char === '!' || char === '?') nextDelay = speed * 6;
          else if (char === ',') nextDelay = speed * 3;
          else if (char === ' ') nextDelay = speed * 0.5;
          else nextDelay = speed + (Math.random() - 0.5) * speed * 0.5;
        }

        timeoutId = setTimeout(type, nextDelay);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    let timeoutId = setTimeout(type, speed);
    return () => clearTimeout(timeoutId);
  }, [isStarted, text, speed, variableSpeed, isComplete, onComplete]);

  return { displayText, isComplete, reset, isStarted };
}
