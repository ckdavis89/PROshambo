# PROshambo

A wrestling-themed Rock-Paper-Scissors web app. Instead of hand gestures, the three moves are wrestling maneuvers:

- **Rolling Elbow** beats Shooting Star Press
- **Piledriver** beats Rolling Elbow
- **Shooting Star Press** beats Piledriver

**Play it live:** https://ckdavis89.github.io/PROshambo/

---

## Modes

- **VS CPU** — Single player. Pick your wrestler, choose a best-of series, and battle the AI. The CPU starts randomly then adapts to your move patterns from round 5 onward.
- **Online** — Real-time multiplayer over Firebase. One player creates a room and shares the 4-letter code; the other joins from any device.

## Local Development

**Requirements:** Node 20+

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
```

## Deployment

Pushes to `main` automatically build and deploy to GitHub Pages via GitHub Actions.

## Multiplayer Setup

Online mode requires a Firebase project. See [`src/firebase.js`](src/firebase.js) for configuration instructions.
