import { create } from 'zustand';

let lastNavTime = 0;
const NAV_DEBOUNCE_MS = 300;

function canNavigate(): boolean {
  const now = Date.now();
  if (now - lastNavTime < NAV_DEBOUNCE_MS) return false;
  lastNavTime = now;
  return true;
}

interface AppState {
  currentSceneIndex: number;
  totalScenes: number;
  pipelineHUDVisible: boolean;
  audioEnabled: boolean;
  isTransitioning: boolean;
  animationSpeed: number;
  isPaused: boolean;

  nextScene: () => void;
  prevScene: () => void;
  goToScene: (index: number) => void;
  showPipelineHUD: () => void;
  toggleAudio: () => void;
  setTransitioning: (v: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  togglePause: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSceneIndex: 0,
  totalScenes: 0,
  pipelineHUDVisible: false,
  audioEnabled: false,
  isTransitioning: false,
  animationSpeed: 1,
  isPaused: false,

  nextScene: () => {
    if (!canNavigate()) return;
    const { currentSceneIndex, totalScenes } = get();
    if (currentSceneIndex < totalScenes - 1) {
      set({ currentSceneIndex: currentSceneIndex + 1, isPaused: false });
    }
  },

  prevScene: () => {
    if (!canNavigate()) return;
    const { currentSceneIndex } = get();
    if (currentSceneIndex > 0) {
      set({ currentSceneIndex: currentSceneIndex - 1, isPaused: false });
    }
  },

  goToScene: (index: number) => {
    const { totalScenes } = get();
    if (index >= 0 && index < totalScenes) {
      set({ currentSceneIndex: index, isPaused: false });
    }
  },

  showPipelineHUD: () => set({ pipelineHUDVisible: true }),
  toggleAudio: () => set(s => ({ audioEnabled: !s.audioEnabled })),
  setTransitioning: (v) => set({ isTransitioning: v }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  togglePause: () => set(s => ({ isPaused: !s.isPaused })),
}));
