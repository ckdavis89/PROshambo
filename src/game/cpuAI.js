import { MOVE_KEYS } from './moves.js'

const COUNTER = {
  ROLLING_ELBOW: 'PILEDRIVER',
  PILEDRIVER: 'SHOOTING_STAR_PRESS',
  SHOOTING_STAR_PRESS: 'ROLLING_ELBOW',
}

function randomMove() {
  return MOVE_KEYS[Math.floor(Math.random() * MOVE_KEYS.length)]
}

export function chooseCpuMove(playerHistory, matchTarget) {
  if (playerHistory.length < matchTarget) return randomMove()

  const counts = {}
  for (const move of playerHistory) {
    counts[move] = (counts[move] || 0) + 1
  }
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  return Math.random() < 0.65 ? COUNTER[mostCommon] : randomMove()
}
