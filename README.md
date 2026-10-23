# BoardSight — Chess Coordinate Mastery & Reflex Engine

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> **High-performance, responsive chess coordinate trainer designed to condition sub-second visual and motor reflexes (a1–h8) through progressive sensory overload, active recall, spatial anchoring, and spaced repetition.**

---

## 🎯 Pedagogical Pillars

BoardSight eliminates counting or calculating coordinates (*"a, b, c... 1, 2, 3..."*). Squares become as instinctive as keys on a keyboard.

1. **Pillar 1: Color Conditioning (The Invisible Grid)**
   * Rapid-fire binary classification: *"Is E4 light or dark?"*
   * Direct tactile keys: `[F]` for Dark, `[J]` for Light. Sub-500ms answers grant Reflex Bonuses.
2. **Pillar 2: Coordinate-to-Square (Target Strike)**
   * Visual prompts and Web Speech audio callouts (*"D5"*).
   * Tap/click the target square on the board under strict time constraints.
3. **Pillar 3: Square-to-Coordinate (Fast Type)**
   * A square highlights with an animated reticle.
   * Type the two-character coordinate directly (`e` then `4`) — auto-submits on the 2nd valid keystroke without pressing Enter.
   * Includes virtual touch keypad for mobile practice.
4. **Pillar 4: Diagonal & Route Mapping (Spatial Vision)**
   * **Blindfold Commando:** Mental projection of unseen board geometry (diagonal intersections, bishop pivot steps, knight destinations).
   * **Knight Hop Reflex:** Identify and tap all legal knight landing squares within a 6-second window.
5. **Gauntlet Mode: Deathrun / Survival**
   * Starts with 5.0 seconds on the clock; each correct answer adds `+0.8s`.
   * Randomly cycles between clicking squares, color testing, and fast typing under a 3-strike penalty.

---

## ⚡ Interactive Features

* **Right-Click Tactical Annotations:** Draw glowing SVG arrows between squares (right-click drag) and circle highlights (right-click square), just like Chess.com and Lichess. Left-click anywhere to clear.
* **Crosshair Ray Guide:** Hovering over any square highlights its full rank and file intersection with a live coordinate badge.
* **Reflex Rhythm Metronome:** Set subconscious rhythm pacing at 60, 90, 120, or 150 BPM.
* **Interactive 8x8 Mastery Heatmap:** Color-coded performance grid (Green `<0.7s & >95% acc`, Amber `1.0s-2.0s`, Red `>2.0s/errors`). Filter by quadrant, rank, or file, and click *"Drill This Subset"* to target weak zones.
* **Performance Recap Modal:** Grades sessions from `S+` to `D` with fastest/slowest square breakdowns and 1-click weakest square retraining.
* **Spaced Repetition System (SRS):** Missed squares are flagged as Trouble Squares and automatically injected 3 times across the next 15 prompts.
* **Ghost Mode:** Edge rank/file labels progressively fade 20% every 10 streak until completely borderless.
* **Perspective Inversion:** Auto-flips White vs. Black orientation every 10 reps.
* **Synthesizer Audio & Web Speech API:** Procedural audio tones (harmonic correct chimes, discordant error buzzes, metronome ticks) and speech synthesis pronunciation.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `1` – `6` | Switch between Training Modes 1 to 6 |
| `7` | Open 8x8 Mastery Heatmap & Diagnostics |
| `F` / `J` | Light or Dark? (`[F]` = Dark, `[J]` = Light) |
| `a`–`h` then `1`–`8` | Fast Type coordinate entry |
| `Space` | Start / Restart active drill |
| `R` | Flip Board Perspective (White ↔ Black) |
| `M` | Toggle Sound Effects (Mute / Unmute) |
| `?` | Open Keyboard Shortcuts Guide |
| `Right Click + Drag` | Draw tactical board arrows |
| `Right Click Square` | Toggle square circle highlight |
| `Left Click` | Clear board arrows & markers |

---

## 🛠️ Tech Stack

* **Framework:** React 18 with TypeScript
* **Build Tool:** Vite 6
* **Styling:** Tailwind CSS with custom animations
* **Audio:** Web Audio API (procedural synthesis) + Web Speech API (voice callouts)
* **Icons:** Lucide React
* **Confetti:** canvas-confetti
* **PWA:** Service worker caching (`public/sw.js`) and manifest (`public/manifest.json`) for offline training

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ (tested on Node v24)
* npm 9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/007mew/chess-notation-builder.git
cd chess-notation-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Run production build & type check
npm run build
```

---

## 📄 License
MIT License. Created for chess players aspiring for instant, sub-second board vision.
