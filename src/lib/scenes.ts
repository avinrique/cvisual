import { lazy, ComponentType } from 'react';

export interface SceneConfig {
  id: string;
  act: number;
  title: string;
  component: React.LazyExoticComponent<ComponentType>;
  accentColor: string;
  interactive?: boolean;
}

export const scenes: SceneConfig[] = [
  {
    id: 'opening',
    act: 0,
    title: 'The Machine That Listens',
    component: lazy(() => import('@/components/scenes/Opening')),
    accentColor: 'var(--accent-gold)',
  },
  // Act 1
  {
    id: 'instagram-hook',
    act: 1,
    title: 'The Instagram Question',
    component: lazy(() => import('@/components/scenes/Act1/InstagramHook')),
    accentColor: 'var(--accent-blue)',
  },
  {
    id: 'calculator-demo',
    act: 1,
    title: 'The Calculator',
    component: lazy(() => import('@/components/scenes/Act1/CalculatorDemo')),
    accentColor: 'var(--accent-amber)',
  },
  {
    id: 'first-printf',
    act: 1,
    title: 'The First printf',
    component: lazy(() => import('@/components/scenes/Act1/FirstPrintf')),
    accentColor: 'var(--accent-gold)',
  },
  {
    id: 'console-explained',
    act: 1,
    title: 'The Console',
    component: lazy(() => import('@/components/scenes/Act1/ConsoleExplained')),
    accentColor: 'var(--text-primary)',
  },
  {
    id: 'format-specifiers',
    act: 1,
    title: 'Format Specifiers',
    component: lazy(() => import('@/components/scenes/Act1/FormatSpecifiers')),
    accentColor: 'var(--accent-blue)',
    interactive: true,
  },
  {
    id: 'scanf-reverse',
    act: 1,
    title: 'scanf: The Reverse',
    component: lazy(() => import('@/components/scenes/Act1/ScanfReverse')),
    accentColor: 'var(--accent-blue)',
  },
  {
    id: 'bmi-calculator',
    act: 1,
    title: 'BMI Calculator',
    component: lazy(() => import('@/components/scenes/Act1/BMICalculator')),
    accentColor: 'var(--accent-amber)',
  },
  // Act 2
  {
    id: 'light-switch',
    act: 2,
    title: 'The Light Switch',
    component: lazy(() => import('@/components/scenes/Act2/LightSwitch')),
    accentColor: 'var(--accent-gold)',
    interactive: true,
  },
  {
    id: 'truth-of-five',
    act: 2,
    title: 'The Truth of Five',
    component: lazy(() => import('@/components/scenes/Act2/TruthOfFive')),
    accentColor: 'var(--accent-green)',
  },
  {
    id: 'comparison-scale',
    act: 2,
    title: 'Comparison Operators',
    component: lazy(() => import('@/components/scenes/Act2/ComparisonScale')),
    accentColor: 'var(--accent-gold)',
    interactive: true,
  },
  {
    id: 'logic-gates',
    act: 2,
    title: 'Logic Gates',
    component: lazy(() => import('@/components/scenes/Act2/LogicGates')),
    accentColor: 'var(--accent-purple)',
    interactive: true,
  },
  // Act 3
  {
    id: 'road-fork',
    act: 3,
    title: 'The Road Fork',
    component: lazy(() => import('@/components/scenes/Act3/RoadFork')),
    accentColor: 'var(--accent-green)',
    interactive: true,
  },
  {
    id: 'else-if-staircase',
    act: 3,
    title: 'The Staircase',
    component: lazy(() => import('@/components/scenes/Act3/ElseIfStaircase')),
    accentColor: 'var(--accent-purple)',
    interactive: true,
  },
  {
    id: 'switch-elevator',
    act: 3,
    title: 'The Elevator',
    component: lazy(() => import('@/components/scenes/Act3/SwitchElevator')),
    accentColor: 'var(--accent-purple)',
    interactive: true,
  },
  // Act 4
  {
    id: 'million-line-problem',
    act: 4,
    title: 'The Million Line Problem',
    component: lazy(() => import('@/components/scenes/Act4/MillionLineProblem')),
    accentColor: 'var(--accent-amber)',
  },
  {
    id: 'for-loop-track',
    act: 4,
    title: 'The Running Track',
    component: lazy(() => import('@/components/scenes/Act4/ForLoopTrack')),
    accentColor: 'var(--accent-amber)',
    interactive: true,
  },
  {
    id: 'multiplication-factory',
    act: 4,
    title: 'Multiplication Factory',
    component: lazy(() => import('@/components/scenes/Act4/MultiplicationFactory')),
    accentColor: 'var(--accent-amber)',
  },
  {
    id: 'while-guard-dog',
    act: 4,
    title: 'The Guard Dog',
    component: lazy(() => import('@/components/scenes/Act4/WhileGuardDog')),
    accentColor: 'var(--accent-amber)',
    interactive: true,
  },
  {
    id: 'do-while-restaurant',
    act: 4,
    title: 'The Restaurant',
    component: lazy(() => import('@/components/scenes/Act4/DoWhileRestaurant')),
    accentColor: 'var(--accent-amber)',
  },
  {
    id: 'nested-loop-clock',
    act: 4,
    title: 'The Clock',
    component: lazy(() => import('@/components/scenes/Act4/NestedLoopClock')),
    accentColor: 'var(--accent-amber)',
    interactive: true,
  },
  // Act 5
  {
    id: 'break-exit',
    act: 5,
    title: 'Emergency Exit',
    component: lazy(() => import('@/components/scenes/Act5/BreakExit')),
    accentColor: 'var(--accent-red)',
  },
  {
    id: 'continue-trampoline',
    act: 5,
    title: 'The Trampoline',
    component: lazy(() => import('@/components/scenes/Act5/ContinueTrampoline')),
    accentColor: 'var(--accent-cyan)',
  },
  {
    id: 'return-eject',
    act: 5,
    title: 'The Eject Button',
    component: lazy(() => import('@/components/scenes/Act5/ReturnEject')),
    accentColor: 'var(--text-primary)',
  },
  {
    id: 'goto-spaghetti',
    act: 5,
    title: 'Spaghetti City',
    component: lazy(() => import('@/components/scenes/Act5/GotoSpaghetti')),
    accentColor: 'var(--accent-red)',
  },
  {
    id: 'debugging-mind',
    act: 5,
    title: 'The Debugging Mind',
    component: lazy(() => import('@/components/scenes/Act5/DebuggingMind')),
    accentColor: 'var(--accent-red)',
    interactive: true,
  },
  {
    id: 'closing',
    act: 6,
    title: 'Module Complete',
    component: lazy(() => import('@/components/scenes/Closing')),
    accentColor: 'var(--accent-gold)',
  },
];

export const actNames: Record<number, string> = {
  0: 'Opening',
  1: 'Act 1: I/O Pipeline',
  2: 'Act 2: Truth',
  3: 'Act 3: Crossroads',
  4: 'Act 4: The Loop',
  5: 'Act 5: Breaking Free',
  6: 'Closing',
};
