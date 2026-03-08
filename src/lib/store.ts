import { create } from 'zustand';

interface AppState {
  currentSceneIndex: number;
  totalScenes: number;
  pipelineHUDVisible: boolean;
  audioEnabled: boolean;
  isTransitioning: boolean;

  nextScene: () => void;
  prevScene: () => void;
  goToScene: (index: number) => void;
  showPipelineHUD: () => void;
  toggleAudio: () => void;
  setTransitioning: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSceneIndex: 0,
  totalScenes: 0,
  pipelineHUDVisible: false,
  audioEnabled: false,
  isTransitioning: false,

  nextScene: () => {
    const { currentSceneIndex, totalScenes } = get();
    if (currentSceneIndex < totalScenes - 1) {
      set({ currentSceneIndex: currentSceneIndex + 1 });
    }
  },

  prevScene: () => {
    const { currentSceneIndex } = get();
    if (currentSceneIndex > 0) {
      set({ currentSceneIndex: currentSceneIndex - 1 });
    }
  },

  goToScene: (index: number) => {
    const { totalScenes } = get();
    if (index >= 0 && index < totalScenes) {
      set({ currentSceneIndex: index });
    }
  },

  showPipelineHUD: () => set({ pipelineHUDVisible: true }),
  toggleAudio: () => set(s => ({ audioEnabled: !s.audioEnabled })),
  setTransitioning: (v) => set({ isTransitioning: v }),
}));
