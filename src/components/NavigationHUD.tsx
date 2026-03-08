'use client';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { scenes, actNames } from '@/lib/scenes';

export default function NavigationHUD() {
  const currentSceneIndex = useAppStore(s => s.currentSceneIndex);
  const goToScene = useAppStore(s => s.goToScene);
  const totalScenes = scenes.length;

  const progress = totalScenes > 0 ? ((currentSceneIndex + 1) / totalScenes) * 100 : 0;
  const currentScene = scenes[currentSceneIndex];

  // Get unique acts and first scene index for each
  const acts = Array.from(new Set(scenes.map(s => s.act)));
  const actFirstIndex = acts.map(act => scenes.findIndex(s => s.act === act));

  return (
    <>
      {/* Progress bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-surface z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue via-gold to-green"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Scene title */}
      <motion.div
        key={currentScene?.id}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span className="text-xs font-display text-dim tracking-widest uppercase">
          {currentScene?.title}
        </span>
      </motion.div>

      {/* Act pills on left */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {acts.map((act, i) => {
          const isActive = currentScene?.act === act;
          return (
            <motion.button
              key={act}
              onClick={() => goToScene(actFirstIndex[i])}
              className={`group flex items-center gap-2 text-[10px] px-2 py-1 rounded font-display tracking-wider transition-colors ${
                isActive
                  ? 'bg-white/10 text-primary'
                  : 'text-dim hover:text-primary hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              title={actNames[act]}
            >
              {act === 0 ? '▸' : act === 6 ? '■' : `A${act}`}
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-300 text-[9px] text-dim">
                {actNames[act]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
