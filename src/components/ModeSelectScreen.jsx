import RetroButton from './RetroButton.jsx'

const BEST_OF_OPTIONS = [3, 5, 7]

export default function ModeSelectScreen({ bestOf, onBestOfChange, onStart, onMultiplayer, onHistory }) {
  return (
    <div className="screen">
      <div style={{ flex: 1 }} />

      <hr className="gold-divider" />
      <h1 className="screen-title">PROSHAMBO</h1>
      <hr className="gold-divider" />

      <div style={{ flex: 1 }} />

      <p className="section-label">BEST OF</p>
      <div className="best-of-row">
        {BEST_OF_OPTIONS.map(n => (
          <button
            key={n}
            className={`best-of-btn${bestOf === n ? ' active' : ''}`}
            onClick={() => onBestOfChange(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <RetroButton onClick={onStart}>VS CPU</RetroButton>
      <RetroButton onClick={onMultiplayer}>ONLINE</RetroButton>

      <div style={{ flex: 2 }} />

      <button className="text-btn" onClick={onHistory}>
        MATCH HISTORY
      </button>
    </div>
  )
}
