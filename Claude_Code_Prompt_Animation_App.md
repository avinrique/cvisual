# CLAUDE CODE PROMPT
## Build: "The Machine That Listens" — Interactive C Programming Visual Learning Platform

---

Copy everything below this line and paste it into Claude Code.

---

```
Build a complete interactive web application called "The Machine That Listens" — an animated, cinematic visual learning experience that teaches C programming Module 2 (Console I/O & Statements). This is NOT a slideshow or presentation. It is a scroll-driven / scene-driven animated storytelling experience with code visualizations, like a fusion of 3Blue1Brown + Apple product pages + CS50 lectures.

## TECH STACK

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Animation:** Framer Motion for orchestrated animations + GSAP (ScrollTrigger) for scroll-driven scenes
- **Code Display:** Prism.js or Shiki for syntax-highlighted C code with typewriter effects
- **Canvas/WebGL:** Use HTML Canvas or Three.js (lightweight) ONLY for particle effects and the opening cursor scene
- **Styling:** Tailwind CSS + CSS variables for the color system
- **Audio (optional):** Tone.js for subtle UI sounds (typewriter clicks, whooshes) — make this toggleable
- **State Management:** Zustand for tracking which scene/act the user is on
- **Deployment-ready:** Output should be a working Next.js project with `npm run dev` working

## VISUAL DESIGN SYSTEM

### Color Palette (CSS Variables)
```css
--bg-void: #0A0E27;          /* Deep navy, main background */
--bg-surface: #111633;        /* Slightly lighter surface */
--text-primary: #E8ECF4;      /* Off-white text */
--text-dim: #6B7394;          /* Muted text */
--accent-gold: #FFD700;       /* printf / output */
--accent-blue: #00BFFF;       /* scanf / input */
--accent-green: #22C55E;      /* TRUE / success */
--accent-red: #EF4444;        /* FALSE / error / break */
--accent-amber: #F59E0B;      /* for loop / process */
--accent-purple: #8B5CF6;     /* switch statement */
--accent-cyan: #06B6D4;       /* continue */
--accent-orange: #FF6B35;     /* address-of / & */
--glow-gold: rgba(255, 215, 0, 0.3);
--glow-blue: rgba(0, 191, 255, 0.3);
```

### Typography
- **Display/Titles:** "Space Mono" or "JetBrains Mono" (monospace, techy feel)
- **Body/Narration:** "Outfit" or "Satoshi" (clean geometric sans-serif)
- **Code:** "Fira Code" with ligatures enabled

### Global Style Rules
- Background is ALWAYS dark (#0A0E27)
- Elements glow with colored box-shadows matching their accent
- Subtle grain/noise texture overlay on the background (CSS filter or SVG)
- All animations should feel smooth and cinematic — ease-out curves, spring physics
- No harsh borders — use glows, gradients, and subtle shadows instead

## APPLICATION STRUCTURE

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts, global styles
│   ├── page.tsx            # Main experience page
│   └── globals.css         # CSS variables, base styles, grain overlay
├── components/
│   ├── SceneManager.tsx    # Controls scene transitions, scroll progress
│   ├── NavigationHUD.tsx   # Persistent top/side nav showing acts & progress
│   ├── PipelineHUD.tsx     # The INPUT→PROCESS→OUTPUT boxes (top-right, persistent)
│   ├── scenes/
│   │   ├── Opening.tsx         # Blinking cursor, title reveal
│   │   ├── Act1/
│   │   │   ├── InstagramHook.tsx    # Phone login → IPO pipeline reveal
│   │   │   ├── CalculatorDemo.tsx   # Numbers flowing through calculator
│   │   │   ├── FirstPrintf.tsx      # Code typing + "Hello World" traveling to terminal
│   │   │   ├── ConsoleExplained.tsx # Four real-world console examples
│   │   │   ├── FormatSpecifiers.tsx # Mailbox system animation
│   │   │   ├── ScanfReverse.tsx     # Blue path, address delivery animation
│   │   │   └── BMICalculator.tsx    # Rube Goldberg machine montage
│   │   ├── Act2/
│   │   │   ├── LightSwitch.tsx      # 0/1 toggle animation
│   │   │   ├── TruthOfFive.tsx      # Number 5 at the bouncer gate
│   │   │   ├── ComparisonScale.tsx  # Weighing scale for ==, !=, >, <
│   │   │   └── LogicGates.tsx       # AND/OR/NOT gate animations
│   │   ├── Act3/
│   │   │   ├── RoadFork.tsx         # Bit character at if/else fork
│   │   │   ├── ElseIfStaircase.tsx  # Grand staircase with lighting steps
│   │   │   └── SwitchElevator.tsx   # Elevator metaphor with break lever
│   │   ├── Act4/
│   │   │   ├── MillionLineProblem.tsx # Dramatic code scrolling → single for loop
│   │   │   ├── ForLoopTrack.tsx      # Running track with 3 stations
│   │   │   ├── MultiplicationFactory.tsx # Assembly line animation
│   │   │   ├── WhileGuardDog.tsx     # Password guard dog scene
│   │   │   ├── DoWhileRestaurant.tsx # Waiter metaphor + diagram comparison
│   │   │   └── NestedLoopClock.tsx   # Clock hands + star pattern
│   │   ├── Act5/
│   │   │   ├── BreakExit.tsx        # Track crumbling emergency exit
│   │   │   ├── ContinueTrampoline.tsx # Bouncing over a station
│   │   │   ├── ReturnEject.tsx      # Exiting the main() room
│   │   │   ├── GotoSpaghetti.tsx    # City grid → spaghetti chaos
│   │   │   └── DebuggingMind.tsx    # = vs == spot the difference
│   │   └── Closing.tsx             # Return to cursor, recap, fade out
│   ├── shared/
│   │   ├── BitCharacter.tsx    # Reusable animated "Bit" character (glowing circle with eyes)
│   │   ├── Terminal.tsx        # Reusable terminal window component
│   │   ├── CodeTyper.tsx       # Typewriter effect for code blocks
│   │   ├── GlowBox.tsx        # Reusable glowing container
│   │   ├── ConveyorBelt.tsx   # Reusable conveyor animation
│   │   └── Narration.tsx      # Voiceover text display with fade-in
│   └── hooks/
│       ├── useSceneProgress.ts  # Track scroll position within a scene
│       ├── useTypewriter.ts     # Typewriter text animation hook
│       └── useAudio.ts          # Sound effect triggers (optional)
├── lib/
│   ├── scenes.ts           # Scene definitions, order, metadata
│   └── animations.ts       # Shared animation variants/presets
└── public/
    └── fonts/              # Self-hosted fonts
```

## DETAILED SCENE SPECIFICATIONS

### OPENING SCENE (0:00 - 0:45 equivalent)

When the page loads:
1. Black screen. After 1 second, a blinking cursor appears center-screen (CSS animation, white rectangle, 1s interval)
2. After 2 seconds, text types itself letter by letter: "Hello?" (green monospace, 200ms per char)
3. After a pause: "Is anyone there?" types below it (dimmer color)
4. Camera (viewport) slowly zooms out — the text is revealed to be inside a small terminal window floating in the void
5. Narration text fades in at bottom: "Every program ever written... starts with a question."
6. Title drops in from above, letter by letter with spring physics:
   - "THE MACHINE THAT LISTENS" (large, Space Mono, white with subtle gold glow)
   - Subtitle fades in: "Console I/O & Statements in C"
7. A gentle downward scroll indicator pulses at the bottom

**Implementation:** Use Canvas or a simple DOM animation for the cursor. Framer Motion for the zoom-out and title entrance. The "typing" effect should feel organic — slightly variable timing between characters.

### ACT 1 SCENES

#### Scene: Instagram Hook
- Show a stylized phone mockup (CSS-drawn, not an image) with a login form
- User types into the username field (animated)
- The typed text ("avin") lifts off the phone as glowing particles
- Particles travel along a curved path (SVG path animation) into a box labeled "PROGRAM"
- Out the other side: "Welcome back, Avin" emerges
- Three boxes slide in with spring animation: [INPUT] → [PROCESS] → [OUTPUT]
- Each box has its accent color and a subtle glow
- These boxes then shrink and dock to the top-right corner as a persistent HUD element

#### Scene: First Printf
- A cinematic code editor appears (dark bg, line numbers, syntax highlighting)
- Code types itself line by line with syntax coloring:
  ```c
  #include <stdio.h>
  
  int main()
  {
      printf("Hello, World!\n");
  }
  ```
- When `#include <stdio.h>` completes: a tooltip bubble pops out explaining "Standard Input Output — this is how C gets its voice"
- When the opening brace `{` is typed: it swings open like a door (rotate animation)
- When `printf` is typed: it glows gold, a megaphone icon materializes next to it
- The string "Hello, World!" lifts off the code, travels along a golden curved path to a terminal on the right side
- Terminal displays: `Hello, World!` with the cursor blinking after it
- The `\n` is shown as a small arrow that pushes the cursor down one line

#### Scene: Format Specifiers (Mailbox System)
- Four mailboxes appear in a row, each popping up with spring animation
- Each has a different color flag: blue (%d), green (%f), red (%c), yellow (%s)
- Code appears: `int age = 21; printf("My age is %d\n", age);`
- Animation sequence:
  1. A box labeled "age" with "21" inside it appears
  2. The printf string becomes a conveyor belt moving left to right
  3. The %d on the belt is an empty blue slot
  4. "21" lifts from the age box, floats to the slot, drops in with a click
  5. Conveyor outputs: "My age is 21" on the terminal
- Make this INTERACTIVE: let the user click to change the value in the "age" box and watch the animation replay

#### Scene: Scanf Reverse
- The conveyor belt from printf REVERSES direction
- `scanf` appears in electric blue with a microphone icon
- Show a variable "age" as an empty box on a shelf with an address label: "0x7FFF"
- Animation:
  1. Terminal shows "Enter age: " (golden path going out)
  2. A keyboard appears at bottom, user types "21"
  3. "21" becomes a blue glowing particle
  4. It travels along a blue path INTO the program
  5. It reads the address label (&age) like checking GPS
  6. Finds the box, drops in — box glows, no longer empty
- The & symbol should get a special zoom-in moment with the narration: "The ampersand means 'the address of'"

### ACT 2 SCENES

#### Scene: Light Switch
- A realistic-looking light switch on a wall (CSS 3D transform)
- Make it INTERACTIVE — user can click to toggle
- Switch UP: room floods with light, giant "1" appears, labels: TRUE / ON / YES
- Switch DOWN: darkness, giant "0", labels: FALSE / OFF / NO
- Smooth transition between states

#### Scene: Truth of Five
- Number 5 as a character standing at a gate
- Gate has a bouncer and sign: "Only non-zero may enter"
- 5 checks itself → not zero → gate opens → walks through → "True" prints
- Then 0 approaches → bouncer blocks → gate stays shut
- Then a PARADE of numbers marches toward the gate: 42, -7, 100, 0.5 — all get through
- 0 stands alone outside, dejected (add droopy eyes to the 0 character)

#### Scene: Comparison Operators (Weighing Scale)
- Golden SVG weighing scale in center
- INTERACTIVE: User picks which operator to demonstrate
- For each: numbers drop onto the two platforms
- Scale tips or balances based on the comparison
- Green checkmark (true) or red X (false) appears
- Show all 6 operators: ==, !=, >, <, >=, <=

#### Scene: Logic Gates
- Overhead maze/circuit view
- AND gate: Two doors in sequence — BOTH must open
  - Animate a character trying to pass through
  - Show the code: `if(age >= 18 && age <= 60)` with number line overlay
- OR gate: Two doors side by side — EITHER works
- NOT gate: A mirror that flips 1→0 and 0→1
- Make gates INTERACTIVE: user toggles input conditions, sees the result

### ACT 3 SCENES

#### Scene: Road Fork (if/else)
- "Bit" character walks along a path that splits into two
- Signpost at the fork shows the condition
- INTERACTIVE: User sets the value of `age` using a slider
- If age >= 18: left path lights up green, Bit walks left, "Eligible to vote" appears
- If age < 18: left path turns red with barrier, right path lights up, Bit walks right, "Not eligible"
- Code overlays transparently alongside the animation

#### Scene: Else-If Staircase
- Grand staircase (isometric or side-view perspective)
- Each step labeled with a condition: marks >= 90, marks >= 75, marks >= 50, else
- INTERACTIVE: User inputs a marks value (slider from 0-100)
- Bit climbs from bottom, checks each step
- The FIRST matching step lights up green, door opens on that step
- All steps above the matching one become translucent (skipped)
- Corresponding code highlights the matching branch

#### Scene: Switch Elevator
- An elevator with buttons: +, -, ×, ÷
- INTERACTIVE: User picks an operator and two numbers
- Bit enters elevator, presses button, zooms to that floor
- Code executes on that floor
- Show what happens WITHOUT break: elevator keeps falling through floors (chaos animation)
- Show WITH break: lever pulled, elevator stops, doors open to exit
- Default floor shown as basement level

### ACT 4 SCENES

#### Scene: Million Line Problem
- Stick figure programmer at desk, typing printf statements
- Progress bar at bottom: "0.0003% complete"
- Code scrolls infinitely downward
- SMASH CUT: single `for` line glows with power
- The million lines in background crumble like falling dominoes (particle effect)

#### Scene: For Loop Track
- Circular running track from bird's-eye view
- Three stations marked with colors:
  - START (init): `int i = 1` — coach hands jersey
  - CHECK (condition): `i <= 10` — referee with clipboard
  - UPDATE: `i++` — machine that increments jersey number
- INTERACTIVE: User can set the loop bounds and step through each iteration
- Each lap: Bit runs around, jersey number visible, printf station outputs the number
- When condition fails: referee waves red flag, Bit exits track
- Show a counter of iterations on screen

#### Scene: While Loop Guard Dog
- A door with an animated guard dog (simple 2D, cartoony)
- Password prompt scenario
- INTERACTIVE: User types passwords, dog checks each one
- Wrong password: dog barks, shakes head, user sent back
- Correct password: dog wags tail, door opens, "Access granted!"
- The code updates in real-time showing the while loop logic

#### Scene: Do-While Restaurant
- Restaurant with animated waiter
- Waiter ALWAYS brings first dish (code runs once)
- THEN asks "More?" (condition check after)
- Side-by-side loop diagrams:
  - WHILE: CHECK first → then CODE
  - DO-WHILE: CODE first → then CHECK
- The "runs at least once" part should pulse red
- Show ATM menu as the practical example

#### Scene: Nested Loops Clock
- Clock face with hour and minute hands
- For each hour hand move, minute hand does full revolution
- Below: star pattern builds row by row
- INTERACTIVE: User adjusts the number of rows, pattern updates live

### ACT 5 SCENES

#### Scene: Break — Emergency Exit
- Bit running on track (reuse Act 4 visual)
- At iteration 5: bright red EXIT door appears on track edge
- Bit turns, runs through door
- Track behind CRUMBLES with particle effects
- Output shows: "1 2 3 4" — 5 never appears
- Code highlights the break statement

#### Scene: Continue — Trampoline
- Bit on track again
- At iteration 3: a trampoline appears
- Bit hits trampoline, BOUNCES over the printf station
- Lands at update station, keeps running
- Output: "1 2 _ 4 5" with visible gap
- Side-by-side comparison panel: break (track crumbles) vs continue (bounce and keep going)

#### Scene: Goto — Spaghetti City
- Top-down city grid, cars following orderly lanes
- A red goto arrow paints across the grid diagonally
- Cars follow it → crashes → more goto arrows → total chaos
- Camera zooms out: the mess looks like spaghetti
- Text overlay: "This is why goto is discouraged"
- The spaghetti unravels into clean organized streets (structured code)

#### Scene: Debugging Mind (= vs ==)
- Two doors side by side, nearly identical
- Door 1: `if(a = 5)` in red — ASSIGNMENT (bug!)
- Door 2: `if(a == 5)` in green — COMPARISON (correct!)
- INTERACTIVE: User picks a door to see what happens behind it
- Door 1: shows variable getting overwritten, always evaluates true, BUG warning
- Door 2: shows proper comparison, correct behavior
- The single vs double = grows enormous and pulses

### CLOSING SCENE
- Return to opening: dark void, terminal window, blinking cursor
- Cursor types a recap, each line paired with its icon/metaphor:
  ```
  I can listen.    → microphone icon (scanf)
  I can speak.     → megaphone icon (printf)  
  I can decide.    → fork icon (if/switch)
  I can repeat.    → track icon (loops)
  I can stop.      → exit icon (break/return)
  ```
- Terminal zooms out to reveal billions of tiny terminal windows across a globe
- Fade to black
- End card: "MODULE 2 — COMPLETE" with link to "Next: Arrays"

## NAVIGATION & UX

1. **Progress Bar:** Thin line at very top of viewport showing overall progress through all 5 acts
2. **Act Navigation:** Small pills on the left side: "Act 1" "Act 2" etc. — clickable to jump
3. **Scene Titles:** Each scene has a subtle title that fades in at the top when you enter it
4. **Pipeline HUD:** The INPUT→PROCESS→OUTPUT boxes stay in top-right after Act 1, Scene 1 reveals them. They light up contextually as relevant.
5. **Code Panel:** When code is shown, it appears in a floating dark panel with proper syntax highlighting. The panel should feel like it's hovering in 3D space (subtle shadow, slight rotation).
6. **Interaction Indicators:** When a scene is interactive, show a subtle pulsing hand/cursor icon with "Try it" text
7. **Keyboard Navigation:** Arrow keys or Space to advance scenes. Escape to open scene menu.
8. **Mobile Responsive:** Stack scenes vertically on mobile. Interactions become tap-based. Reduce particle effects for performance.

## PERFORMANCE REQUIREMENTS

- Target 60fps on all animations
- Lazy-load scenes that aren't in viewport
- Use `will-change` CSS property for animated elements
- Canvas/WebGL elements should only render when visible (IntersectionObserver)
- Total bundle size under 500KB (excluding fonts)
- Fonts loaded with `font-display: swap`

## INTERACTION PHILOSOPHY

Every scene should have AT LEAST one of:
1. **Scroll-triggered animation** — elements animate as user scrolls into view
2. **Interactive element** — user can manipulate values, toggle switches, click buttons
3. **Hover effect** — hovering over code/elements reveals tooltips or triggers micro-animations

The goal: the user should NEVER be passively reading. They're always discovering, clicking, scrolling, and watching things come alive.

## BUILD INSTRUCTIONS

1. Initialize the Next.js project with TypeScript and Tailwind
2. Install dependencies: framer-motion, gsap, @gsap/react, zustand, prism-react-renderer, tone (optional)
3. Build the shared components first (BitCharacter, Terminal, CodeTyper, GlowBox, Narration)
4. Build scenes in order: Opening → Act 1 → Act 2 → Act 3 → Act 4 → Act 5 → Closing
5. Wire up SceneManager with scroll-driven transitions
6. Add NavigationHUD and PipelineHUD
7. Test all interactions
8. Optimize for performance

Start building. Make it cinematic. Make it unforgettable.
```

---

## USAGE NOTES

**To use this prompt:**
1. Open Claude Code (terminal)
2. Navigate to your desired project directory
3. Paste the entire prompt above (everything inside the ``` block)
4. Claude Code will scaffold the project and start building

**Estimated build time:** This is a large project. Claude Code may need multiple sessions. You can break it into phases:
- **Phase 1:** Project setup + shared components + Opening + Act 1
- **Phase 2:** Act 2 + Act 3
- **Phase 3:** Act 4 + Act 5 + Closing
- **Phase 4:** Navigation, polish, performance optimization

**If Claude Code hits context limits,** paste this follow-up:
```
Continue building "The Machine That Listens" from where you left off. Check the existing files in the project, identify what's been built, and continue with the next unbuilt scene. Maintain the same design system and animation style.
```
