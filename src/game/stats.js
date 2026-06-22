const PREFS_KEY = 'proshambo_stats'
const HISTORY_KEY = 'proshambo_history'
const MAX_HISTORY = 50

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  catch { return {} }
}

export function getStats() {
  const p = loadPrefs()
  return {
    vsCpuWins: p.vsCpuWins || 0,
    vsCpuLosses: p.vsCpuLosses || 0,
  }
}

export function recordMatch(winner, playerScore, cpuScore) {
  const p = loadPrefs()
  if (winner === 'PLAYER_WINS') p.vsCpuWins = (p.vsCpuWins || 0) + 1
  else p.vsCpuLosses = (p.vsCpuLosses || 0) + 1
  localStorage.setItem(PREFS_KEY, JSON.stringify(p))

  const history = loadHistory()
  history.unshift(`${winner}|${playerScore}|${cpuScore}|${Date.now()}`)
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

export function parseHistoryEntry(entry) {
  const [winner, playerScore, cpuScore, ts] = entry.split('|')
  return {
    winner,
    playerScore: parseInt(playerScore),
    cpuScore: parseInt(cpuScore),
    date: new Date(parseInt(ts)).toLocaleDateString(),
  }
}
