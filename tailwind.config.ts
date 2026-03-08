import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg-void)',
        surface: 'var(--bg-surface)',
        primary: 'var(--text-primary)',
        dim: 'var(--text-dim)',
        gold: 'var(--accent-gold)',
        blue: 'var(--accent-blue)',
        green: 'var(--accent-green)',
        red: 'var(--accent-red)',
        amber: 'var(--accent-amber)',
        purple: 'var(--accent-purple)',
        cyan: 'var(--accent-cyan)',
        orange: 'var(--accent-orange)',
      },
      fontFamily: {
        display: ['var(--font-space-mono)', 'monospace'],
        body: ['var(--font-outfit)', 'sans-serif'],
        code: ['var(--font-fira-code)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
