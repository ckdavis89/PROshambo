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
    onlineWins: p.onlineWins || 0,
    onlineLosses: p.onlineLosses || 0,
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

export function recordOnlineMatch(outcome, myScore, oppScore) {
  const p = loadPrefs()
  if (outcome === 'WIN') p.onlineWins = (p.onlineWins || 0) + 1
  else p.onlineLosses = (p.onlineLosses || 0) + 1
  localStorage.setItem(PREFS_KEY, JSON.stringify(p))

  const history = loadHistory()
  history.unshift(`ONLINE|${outcome}|${myScore}|${oppScore}|${Date.now()}`)
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

export function parseHistoryEntry(entry) {
  const parts = entry.split('|')
  if (parts[0] === 'ONLINE') {
    const [, outcome, myScore, oppScore, ts] = parts
    return {
      mode: 'ONLINE',
      outcome,
      myScore: parseInt(myScore),
      oppScore: parseInt(oppScore),
      date: new Date(parseInt(ts)).toLocaleDateString(),
    }
  }
  // Legacy VS CPU format: winner|playerScore|cpuScore|timestamp
  const [winner, playerScore, cpuScore, ts] = parts
  return {
    mode: 'VS_CPU',
    outcome: winner === 'PLAYER_WINS' ? 'WIN' : 'LOSS',
    myScore: parseInt(playerScore),
    oppScore: parseInt(cpuScore),
    date: new Date(parseInt(ts)).toLocaleDateString(),
  }
}
