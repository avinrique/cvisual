'use client';
import { useState, useCallback } from 'react';

export function useSceneProgress(totalSteps: number = 1) {
  const [step, setStep] = useState(0);

  const progress = totalSteps > 0 ? step / totalSteps : 0;

  const advance = useCallback(() => {
    setStep(s => Math.min(s + 1, totalSteps));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setStep(0);
  }, []);

  return { step, progress, advance, reset, isComplete: step >= totalSteps };
}
