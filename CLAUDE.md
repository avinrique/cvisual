# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An animated, interactive educational presentation that teaches C programming concepts (I/O, booleans, conditionals, loops, control flow) through visual metaphors. Built as a single-page Next.js app with scene-based navigation, similar to a slide deck with rich animations.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm start` — serve production build

## Architecture

**Single-page app** — `src/app/page.tsx` dynamically imports `SceneManager` (SSR disabled). The entire app runs client-side.

**Scene system** — All content is organized as scenes defined in `src/lib/scenes.ts`. Each scene is a lazy-loaded React component with metadata (act, title, accentColor, interactive flag). Scenes are grouped into Acts 1-5 plus Opening/Closing.

**State management** — Zustand store (`src/lib/store.ts`) manages scene navigation, animation speed, pause state, and audio toggle. Navigation is debounced (300ms).

**Scene components** live in `src/components/scenes/` organized by act:
- `scenes/Opening.tsx`, `scenes/Closing.tsx`
- `scenes/Act1/` through `scenes/Act5/`

**Shared components** (`src/components/shared/`): `Terminal`, `CodeTyper`, `BitCharacter`, `GlowBox`, `Narration`, `InteractiveIndicator` — reusable visual building blocks used across scenes.

**HUD components**: `NavigationHUD`, `PipelineHUD`, `SpeedControl` — overlay UI rendered by SceneManager.

**Hooks** (`src/components/hooks/`): `useSceneProgress` (step-based progress within a scene), `useTypewriter`, `useAudio`, `useAnimationSpeed`.

**Animation** — Uses both Framer Motion and GSAP. Shared animation variants in `src/lib/animations.ts`. Scenes typically use Framer Motion for layout animations and GSAP for complex timeline sequences.

**Styling** — Tailwind CSS with CSS custom properties for theming. Colors (`void`, `surface`, `primary`, `dim`, `gold`, `blue`, etc.) and fonts (`display`/Space Mono, `body`/Outfit, `code`/Fira Code) are mapped from CSS variables in `tailwind.config.ts`.

## Adding a New Scene

1. Create component in appropriate `src/components/scenes/Act{N}/` directory
2. Add entry to the `scenes` array in `src/lib/scenes.ts` with lazy import
3. Scene receives no props — use `useAppStore` for global state and `useSceneProgress` for internal step progression
