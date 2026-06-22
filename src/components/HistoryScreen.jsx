import { getStats, loadHistory, parseHistoryEntry } from '../game/stats.js'
import RetroButton from './RetroButton.jsx'

export default function HistoryScreen({ onBack }) {
  const { vsCpuWins, vsCpuLosses } = getStats()
  const history = loadHistory().map(parseHistoryEntry)

  return (
    <div className="screen">
      <button className="text-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        ← BACK
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center' }}>
        MATCH HISTORY
      </h2>
      <hr className="gold-divider" />

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value">{vsCpuWins}</span>
          <span className="stat-label">WINS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: 'var(--lose-red)' }}>{vsCpuLosses}</span>
          <span className="stat-label">LOSSES</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: 'var(--silver-accent)' }}>
            {vsCpuWins + vsCpuLosses === 0
              ? '—'
              : Math.round((vsCpuWins / (vsCpuWins + vsCpuLosses)) * 100) + '%'}
          </span>
          <span className="stat-label">WIN RATE</span>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="history-empty">NO MATCHES YET</p>
      ) : (
        <div className="history-list">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`history-item history-item--${entry.winner === 'PLAYER_WINS' ? 'win' : 'lose'}`}
            >
              <span className={`history-result history-result--${entry.winner === 'PLAYER_WINS' ? 'win' : 'lose'}`}>
                {entry.winner === 'PLAYER_WINS' ? 'WIN' : 'LOSS'}
              </span>
              <span className="history-score">
                {entry.playerScore} — {entry.cpuScore}
              </span>
              <span className="history-date">{entry.date}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <RetroButton onClick={onBack}>BACK TO MENU</RetroButton>
      </div>
    </div>
  )
}
