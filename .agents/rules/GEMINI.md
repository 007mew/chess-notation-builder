# Project Specification: "BoardSight" — Absolute Chess Board Coordinate Mastery Webapp

## 1. Core Objective & Philosophy
Build a high-performance, responsive web application designed with a single goal: forcing instantaneous, sub-second recognition and recall of chess coordinates (a1–h8) through progressive sensory overload, active recall, spatial anchoring, and spaced repetition.

The app must eliminate counting or calculating coordinates ("a, b, c... 1, 2, 3..."). It must condition visual reflex (sight to name) and motor reflex (name to touch) until board squares feel as instinctive as keys on a keyboard.

---

## 2. Technical Stack & Architecture
- **Framework:** Next.js (App Router) or Vite + React with TypeScript
- **Styling:** Tailwind CSS + Radix UI / shadcn/ui primitives + Framer Motion (for crisp micro-animations)
- **Audio Engine:** Howler.js or Web Audio API (synthesizer clicks, metronome tick, audio callouts, feedback chimes)
- **State Management:** Zustand or React Context with local storage persistence
- **Performance:** Zero latency input handling; board renders must achieve 60fps+; keyboard events bound globally during drills.

---

## 3. Pedagogical Architecture: The 4 Conditioning Pillars

### Pillar 1: Color Conditioning (The Invisible Grid)
- A chess master instantly knows whether any square is dark or light without looking at the board.
- Drills dedicated exclusively to binary classification: "Is E4 light or dark?"

### Pillar 2: Coordinate-to-Square (Locate)
- Given a coordinate (e.g., "G7"), click/tap the exact square on an empty or populated board under strict time constraints.

### Pillar 3: Square-to-Coordinate (Identify)
- A square flashes or a piece drops on a square. The user must type or tap the coordinate immediately.

### Pillar 4: Diagonal & Route Mapping (Spatial Relationships)
- Drills focused on identifying long diagonals (e.g., a1–h8, h1–a8, c1–h6) and knight jumps (e.g., "What 2 squares can a knight on B1 jump to in rank 3?").

---

## 4. Drills & Training Modes

### Mode 1: "Light or Dark?" (Subconscious Grounding)
- **UI:** Massive prompt displaying a coordinate (e.g., `f4`). Two large buttons (`Dark` / `Light`) mapped to keyboard keys `[F]` and `[J]`.
- **Mechanics:** 
  - Rapid-fire 60-second blitz or 100-rep sprint.
  - Streak multipliers. Sub-500ms answers grant "Reflex Bonus".
  - Instant tactile feedback: subtle green flash for correct, screen shake + discordant buzz on error.

### Mode 2: "Target Strike" (Coordinate -> Click)
- **Mechanics:**
  - Board is displayed (toggleable: Coordinates visible on edge / Coordinates hidden / White perspective / Black perspective).
  - Audio voice callout or on-screen prompt: "D5".
  - User clicks the square as fast as possible.
  - **Heatmap Generation:** Track average click time and error rate per square over time.

### Mode 3: "Fast Type" (Square -> Coordinate)
- **Mechanics:**
  - A bright reticle highlights a square on the board.
  - User types the two-character string directly via keyboard (e.g., pressing `e` then `4`).
  - No need to hit Enter; auto-submits on the 2nd valid keystroke.
  - Wrong keystroke immediately resets input and logs an error.

### Mode 4: "Blindfold Commando" (Mental Projection)
- **Mechanics:**
  - Board is completely invisible or faded to a faint outline.
  - Prompt: "Path from C1 to G5. Name the square intersected on the long diagonal."
  - Or: "A bishop starts on C1. Can it reach F7 in 2 moves? Name the intermediate square."
  - Trains absolute mental projection of square geometries.

### Mode 5: "Knight Hop Reflex"
- **Mechanics:**
  - A knight sits on a square (e.g., `d4`).
  - Three target squares light up sequentially or an auditory prompt calls out a rank/file constraint.
  - User must identify the landing squares by coordinate within 3 seconds.

### Mode 6: "Deathrun / Survival" (Gauntlet Mode)
- **Mechanics:**
  - Starts with 5 seconds on the clock.
  - Every correct answer adds +0.8s.
  - Prompts randomly alternate between "Find Square", "Color Test", and "Type Coordinate".
  - Game ends when timer reaches zero or 3 mistakes occur.

---

## 5. Sensory & Cognitive Reinforcement Engine

1. **Audio Reinforcement (Web Speech API / Pre-recorded Voice):**
   - Toggleable high-clarity voice that reads coordinates aloud as drills run, training the auditory cortex alongside visual pathways.
2. **Perspective Inversion:**
   - Option to auto-flip board orientation randomly every 10 reps (White vs. Black point of view) so perspective dependence is broken early.
3. **Ghost Mode (Progressive Coordinate Fading):**
   - Ranks (1-8) and Files (a-h) edge labels start at 100% opacity.
   - Every 10 consecutive correct answers, opacity drops by 20% until the board is completely borderless and unlabeled.
4. **Error Punishment & Spaced Repetition (SRS):**
   - Any square missed is tagged as a "Trouble Square".
   - The engine automatically injects that specific square 3 times in the next 15 prompts until answered correctly under 800ms twice in a row.

---

## 6. Analytics & User Profile Dashboard
- **Interactive 8x8 Mastery Heatmap:**
  - Color-coded grid showing mastery level for each of the 64 squares:
    - Deep Red: >2.0s or >15% error rate.
    - Amber: 1.0s - 2.0s.
    - Bright Emerald Green: <0.7s reaction time with >95% accuracy.
- **Diagnostics Summary:**
  - "Weakest quadrant" (e.g., "Black queenside: c8, d8, c7, d7").
  - "Color Confusion Index" (Percentage of times light/dark squares were misidentified).
  - Reaction time curve over 30 days.

---

## 7. UI / UX Design Directives
- **Theme:** Clean, modern, high-contrast dark mode (slate/zinc background with high-legibility board textures).
- **Customization:**
  - Board themes: Classic Walnut, Clean Slate, Neo Green (Chess.com style), Lichess Wood, Cyber Monochrome.
  - Piece styles: Standard Staunton, Alpha, Minimalist vector.
- **Responsiveness:**
  - Desktop: Full keyboard shortcuts (numpad/keys for typing, quick-select).
  - Mobile: Clean virtual pad toggle (a-h bar and 1-8 bar) or tap-to-select board optimization with zero double-tap zoom latency.
- **PWA Ready:** Manifest and service workers configured for offline practice.