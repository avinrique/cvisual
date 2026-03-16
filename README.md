# CVisual — Animated C Programming Course

An interactive, animated educational presentation that teaches C programming fundamentals through visual metaphors and hands-on exploration. Think of it as a cinematic slide deck where every concept comes alive with rich animations, interactive widgets, and a friendly guide character named **Bit**.

## Why CVisual?

Learning C can feel intimidating — pointers, memory, cryptic syntax. Most resources dump walls of text and expect you to "just get it." CVisual takes a different approach:

- **Visual metaphors** — Every concept maps to something tangible. A `for` loop is a running track. `if/else` is a fork in the road. The modulo operator is a vending machine that spits out remainders.
- **Step-by-step animation** — Code doesn't just appear; it types out, highlights line by line, and visually executes so you can watch the program think.
- **Interactive scenes** — Drag sliders, click buttons, toggle values. See how changing `age` from 17 to 18 makes Bit walk down a completely different path.
- **Beginner-first pacing** — 34 scenes organized into 5 acts, each building on the last. No concept is used before it's taught.

## What's Covered (Module 2)

### Act 1: I/O Pipeline (10 scenes)
Input, output, variables, data types, format specifiers, `scanf`, `printf`, assignment operators (`+=`, `-=`), increment/decrement (`i++`/`++i`), and the modulo operator (`%`).

### Act 2: Truth (4 scenes)
Booleans, truthy/falsy values in C, comparison operators, and logical operators (`&&`, `||`, `!`).

### Act 3: Crossroads (5 scenes)
`if/else`, nested conditionals, `else if` chains, `switch` statements, and the ternary operator (`?:`).

### Act 4: The Loop (8 scenes)
`for` loops, `while` loops, `do-while`, nested loops, infinite loop traps, and off-by-one errors.

### Act 5: Breaking Free (5 scenes)
`break`, `continue`, `return`, `goto` (and why to avoid it), and debugging mindset.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use **arrow keys** to navigate between scenes and steps.

## Controls

| Key | Action |
|-----|--------|
| `→` / `↓` | Next step or next scene |
| `←` / `↑` | Previous step or previous scene |
| Speed control | Adjust animation speed from the HUD |

Interactive scenes have sliders, buttons, and toggles — look for the "Try it" indicator.

## Tech Stack

- **Next.js 14** — React framework with app router
- **Framer Motion** — Layout and transition animations
- **GSAP** — Complex timeline sequences
- **Zustand** — Lightweight state management
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **TypeScript** — Full type safety

## Project Structure

```
src/
├── app/                  # Next.js app router (single page)
├── components/
│   ├── scenes/           # All 34 scene components
│   │   ├── Act1/         # I/O Pipeline scenes
│   │   ├── Act2/         # Truth & Boolean scenes
│   │   ├── Act3/         # Conditionals scenes
│   │   ├── Act4/         # Loop scenes
│   │   ├── Act5/         # Control flow scenes
│   │   ├── Opening.tsx
│   │   └── Closing.tsx
│   ├── shared/           # Reusable components (Terminal, BitCharacter, GlowBox, etc.)
│   └── hooks/            # Custom hooks (useSceneProgress, useTypewriter, etc.)
├── lib/
│   ├── scenes.ts         # Scene registry and metadata
│   ├── store.ts          # Zustand global state
│   └── animations.ts     # Shared animation variants
```

## Who Is This For?

- **Students** learning C for the first time
- **Educators** looking for visual teaching aids
- **Anyone** who tried learning C and bounced off dry textbook explanations

## Building for Production

```bash
npm run build
npm start
```

## License

ISC
