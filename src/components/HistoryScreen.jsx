import { getStats, loadHistory, parseHistoryEntry } from '../game/stats.js'
import RetroButton from './RetroButton.jsx'

function WinRate({ wins, losses }) {
  const total = wins + losses
  return total === 0 ? '—' : Math.round((wins / total) * 100) + '%'
}

function StatsBlock({ wins, losses }) {
  return (
    <div className="stats-row">
      <div className="stat-item">
        <span className="stat-value">{wins}</span>
        <span className="stat-label">WINS</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: 'var(--lose-red)' }}>{losses}</span>
        <span className="stat-label">LOSSES</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: 'var(--silver-accent)' }}>
          <WinRate wins={wins} losses={losses} />
        </span>
        <span className="stat-label">WIN RATE</span>
      </div>
    </div>
  )
}

export default function HistoryScreen({ onBack }) {
  const { vsCpuWins, vsCpuLosses, onlineWins, onlineLosses } = getStats()
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

      <p className="section-label" style={{ marginBottom: 6 }}>VS CPU</p>
      <StatsBlock wins={vsCpuWins} losses={vsCpuLosses} />

      <p className="section-label" style={{ marginTop: 16, marginBottom: 6 }}>ONLINE</p>
      <StatsBlock wins={onlineWins} losses={onlineLosses} />

      <hr className="gold-divider" style={{ marginTop: 16 }} />

      {history.length === 0 ? (
        <p className="history-empty">NO MATCHES YET</p>
      ) : (
        <div className="history-list">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`history-item history-item--${entry.outcome === 'WIN' ? 'win' : 'lose'}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className={`history-result history-result--${entry.outcome === 'WIN' ? 'win' : 'lose'}`}>
                  {entry.outcome}
                </span>
                <span className="history-mode">{entry.mode === 'ONLINE' ? 'ONLINE' : 'VS CPU'}</span>
              </div>
              <span className="history-score">{entry.myScore} — {entry.oppScore}</span>
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
