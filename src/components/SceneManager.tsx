'use client';
import { useEffect, useRef, Suspense, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { scenes } from '@/lib/scenes';
import { useAppStore } from '@/lib/store';
import NavigationHUD from './NavigationHUD';
import PipelineHUD from './PipelineHUD';
import SpeedControl from './SpeedControl';

export default function SceneManager() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSceneIndex = useAppStore(s => s.currentSceneIndex);
  const nextScene = useAppStore(s => s.nextScene);
  const prevScene = useAppStore(s => s.prevScene);
  const totalScenes = scenes.length;

  // Set total scenes on mount + auto-focus
  useEffect(() => {
    useAppStore.setState({ totalScenes: scenes.length });
    // Auto-focus the container so keyboard events work immediately
    containerRef.current?.focus();
  }, []);

  const togglePause = useAppStore(s => s.togglePause);

  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePause();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextScene();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevScene();
        break;
    }
  }, [nextScene, prevScene, togglePause]);

  // Global keyboard listener as fallback
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyDown]);

  // Touch/swipe support
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const absDeltaY = Math.abs(deltaY);
      const absDeltaX = Math.abs(deltaX);

      if (Math.max(absDeltaX, absDeltaY) < 50) return;

      if (absDeltaY > absDeltaX) {
        if (deltaY > 0) nextScene();
        else prevScene();
      } else {
        if (deltaX > 0) nextScene();
        else prevScene();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextScene, prevScene]);

  const currentScene = scenes[currentSceneIndex];
  const SceneComponent = currentScene.component;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-screen h-screen overflow-hidden bg-void outline-none"
    >
      <NavigationHUD />
      <PipelineHUD />
      <SpeedControl />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-3 h-5 bg-primary cursor-blink" />
              </div>
            }
          >
            <SceneComponent />
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons — always visible */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); prevScene(); }}
          disabled={currentSceneIndex === 0}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-primary transition-colors"
          title="Previous (← or ↑)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-xs text-dim font-code tabular-nums">
          {currentSceneIndex + 1}/{totalScenes}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); nextScene(); }}
          disabled={currentSceneIndex === totalScenes - 1}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-primary transition-colors"
          title="Next (→ or ↓ or Space)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
