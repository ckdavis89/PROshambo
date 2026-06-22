# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Guidelines

> These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Project Overview

PROshambo is a **web app** Rock-Paper-Scissors game where the three moves are **wrestling maneuvers** instead of hand gestures:
- **Rolling Elbow** beats Shooting Star Press
- **Piledriver** beats Rolling Elbow
- **Shooting Star Press** beats Piledriver

The game supports **VS CPU** mode (single-player). It is hosted as a static site on GitHub Pages.

## Environment

- **Node 20+** with npm. Run all commands from the project root.
- No backend — entirely client-side. All state is in-memory or `localStorage`.
- Targets modern browsers. No polyfills needed.

## Build & Dev Commands

```bash
# Start local dev server (hot reload)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

Deployment to GitHub Pages is handled automatically by `.github/workflows/deploy.yml` on every push to `main`.

## Architecture

Single-page React app built with Vite. No routing library — screen transitions are a `switch` on `state.screen` in `App.jsx`.

**State management**: `useReducer` in `App.jsx` holds all game state. The reducer is the single source of truth; components only call `dispatch` or invoke callbacks passed as props.

**Screen flow**:
1. `ModeSelectScreen` — user picks Best-of (3/5/7), taps VS CPU
2. `CharacterSelectScreen` — user picks one of 5 wrestlers
3. `GameScreen` — drives the round lifecycle: `PLAYER_CHOOSING` → `SHOWING_RESULT` → repeat
4. `HistoryScreen` — win/loss record and recent match list

**VS CPU countdown**: on entering `SHOWING_RESULT`, `GameScreen` runs a 3 → 2 → 1 countdown (600 ms per step, ~1.8 s total) before revealing the result. `useLayoutEffect` sets `showingCountdown = true` synchronously before the first paint to prevent a one-frame flash of the result.

**Score header during countdown**: `headerScores` is captured at the start of each `PLAYER_CHOOSING` phase and held fixed during the countdown, so the updated score doesn't appear in the header before the result is revealed.

**CPU AI** (`src/game/cpuAI.js`): random for the first `matchTarget` rounds; afterward, identifies the player's most-played move and counters it 65% of the time.

**Audio & haptics** (`src/hooks/useAudio.js`): Web Audio API via `<Audio>` elements loaded once on mount. Vibration via the Web Vibration API (mobile only, silently ignored on desktop). Five callbacks: `onModeSelected` (cheer), `onMoveTapped` (haptic only), `onWin` (fireworks), `onDraw` (boo), `onLose` (thud).

**Persistence** (`src/game/stats.js`): `localStorage`-backed. Tracks VS CPU win/loss totals and up to 50 recent matches.

## File Structure

```
src/
  App.jsx                   — useReducer state machine, screen routing
  App.css                   — all styles (CSS variables + component classes)
  main.jsx                  — React entry point
  game/
    moves.js                — Move definitions, SVG paths, beats() logic
    cpuAI.js                — CPU move selection
    stats.js                — localStorage read/write
  hooks/
    useAudio.js             — audio + vibration
  components/
    RetroButton.jsx         — reusable full-width action button
    ModeSelectScreen.jsx
    CharacterSelectScreen.jsx
    GameScreen.jsx
    HistoryScreen.jsx
public/
  audio/                    — boo.wav, cheer.mp3, fireworks.wav, thud.wav
  images/                   — wrestler_1–5.jpeg, wrestler_1–5_icon.jpeg, championship.png
```

## UI / Theming Conventions

The visual identity is a **retro arcade / dark navy + silver + gold** theme:
- Button labels, headings, and action prompts are **UPPERCASE**. Descriptive text is mixed case.
- The sole reusable button component is `RetroButton` in `components/RetroButton.jsx` — use it for all full-width action buttons.
- All colors are CSS custom properties defined at `:root` in `App.css`. Semantic tokens in use: `--gold` (accents/dividers), `--win-gold` (win result text), `--lose-red` (loss result text). Never hardcode color values; always reference these variables.
- Typography uses wide letter-spacing throughout. All type is styled via utility classes in `App.css`.
- Dark mode only — no light theme.

## Non-Obvious Patterns

- **`useLayoutEffect` for countdown**: `showingCountdown` is set to `true` in a `useLayoutEffect` (not `useEffect`) so it takes effect before the browser paints. This prevents the result from flashing for one frame when `SHOWING_RESULT` first renders. The actual countdown timers live in a separate `useEffect` on the same dependency.
- **`headerScores` pattern**: Scores displayed in the header are captured into local `headerScores` state when `PLAYER_CHOOSING` starts. This state is not updated again until the next round begins, so the header shows pre-round scores during the entire countdown + result reveal sequence.
- **No router**: Adding a new screen means adding a value to the `screen` string union, a reducer case to navigate to it, and a branch in the `switch` in `App.jsx`.
- **UI strings are hardcoded**: All in-game text is written as uppercase string literals directly in JSX. There is no i18n layer.
- **`import.meta.env.BASE_URL`**: Asset paths in components use `import.meta.env.BASE_URL` as a prefix (e.g. `` `${base}images/wrestler_1.jpeg` ``). This ensures assets resolve correctly whether the app is served from `/` or a GitHub Pages subpath.

## Key Invariants

- `beats()` in `src/game/moves.js` defines the win triangle — single source of truth for game logic. Do not duplicate win/loss checks anywhere else.
- `matchWinner` is computed and set in the same reducer case (`PLAYER_CHOOSES`) as the score update — never deferred.
- Audio fires inside the countdown's final `setTimeout` callback so it plays exactly once per result reveal.
- Sound files live in `public/audio/`; wrestler images in `public/images/`. Reference them via `import.meta.env.BASE_URL`, not hardcoded `/` paths.