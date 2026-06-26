export const MOVES = {
  ROLLING_ELBOW: {
    name: 'ROLLING ELBOW',
    shortName: 'ELBOW',
    video: 'images/rolling_elbow.mp4',
    videoDuration: 4500,
    svgPath: 'M6,20 Q4,20 4,18 L4,14 Q4,12 6,12 L6,9 Q6,7 8,7 Q10,7 10,9 Q11,8 12,9 L12,7 Q12,5 14,5 Q16,5 16,7 L16,9 Q18,9 18,12 L18,18 Q18,20 16,20Z M4,14 Q2,13 2,15 Q2,17 4,16',
  },
  PILEDRIVER: {
    name: 'PILEDRIVER',
    shortName: 'PILEDRIVER',
    video: 'images/piledriver.mp4',
    videoDuration: 3200,
    svgPath: 'M7,15 L7,8 Q7,6 9,6 Q11,6 11,8 L11,15 M11,15 L11,6 Q11,4 13,4 Q15,4 15,6 L15,15 M15,15 L15,6 Q15,4 17,4 Q19,4 19,6 L19,15 M19,15 L19,9 Q19,7 21,7 Q23,7 23,9 L23,15 M7,15 Q5,15 5,17 L5,20 Q5,22 7,22 L21,22 Q23,22 23,20 L23,15 M5,17 L1,17 Q0,17 0,19 Q0,21 1,21 L5,21',
  },
  SHOOTING_STAR_PRESS: {
    name: 'SHOOTING STAR PRESS',
    shortName: 'SSP',
    video: 'images/ssp.mp4',
    videoDuration: 3000,
    svgPath: 'M8,16 L4,5 Q4,3 6,3 Q8,3 8,5 L12,16 M12,16 L16,5 Q16,3 18,3 Q20,3 20,5 L16,16 M8,16 Q4,16 4,18 Q4,21 6,21 L18,21 Q20,21 20,18 Q20,16 16,16',
  },
}

export const MOVE_KEYS = ['ROLLING_ELBOW', 'PILEDRIVER', 'SHOOTING_STAR_PRESS']

const BEATS = {
  ROLLING_ELBOW: 'SHOOTING_STAR_PRESS',
  PILEDRIVER: 'ROLLING_ELBOW',
  SHOOTING_STAR_PRESS: 'PILEDRIVER',
}

export function beats(move, other) {
  return BEATS[move] === other
}

export function resolveRound(playerMove, cpuMove) {
  if (playerMove === cpuMove) return 'DRAW'
  if (beats(playerMove, cpuMove)) return 'PLAYER_WINS'
  return 'CPU_WINS'
}
