import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import RetroButton from './RetroButton.jsx'
import { MOVES, MOVE_KEYS } from '../game/moves.js'
import { cachedSrc } from '../game/imageCache.js'

function MoveIcon({ move, size = 40 }) {
  const path = MOVES[move]?.svgPath
  if (!path) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="#E8ECF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Wrestlers 1, 3, 4, 5 face right; wrestler 2 faces left.
// Player (left side) should face right; CPU (right side) should face left.
const FACES_RIGHT = new Set([1, 3, 4, 5])

function ScoreHeader({ playerScore, cpuScore, playerWrestler, cpuWrestler }) {
  const base = import.meta.env.BASE_URL
  const playerFlipped = !FACES_RIGHT.has(playerWrestler)
  const cpuFlipped = FACES_RIGHT.has(cpuWrestler)
  return (
    <div className="score-header">
      <div className="score-player">
        <img
          className="score-icon"
          src={cachedSrc(`${base}images/wrestler_${playerWrestler}_icon.jpeg`)}
          alt="You"
          style={playerFlipped ? { transform: 'scaleX(-1)' } : undefined}
        />
        <div className="score-info">
          <span className="score-name">YOU</span>
          <span className="score-number">{playerScore}</span>
        </div>
      </div>
      <span className="score-vs">VS</span>
      <div className="score-player score-player--cpu">
        <img
          className="score-icon"
          src={cachedSrc(`${base}images/wrestler_${cpuWrestler}_icon.jpeg`)}
          alt="CPU"
          style={cpuFlipped ? { transform: 'scaleX(-1)' } : undefined}
        />
        <div className="score-info">
          <span className="score-name">CPU</span>
          <span className="score-number">{cpuScore}</span>
        </div>
      </div>
    </div>
  )
}

function MoveChooser({ onChoose }) {
  return (
    <>
      <p className="move-prompt">CHOOSE YOUR MOVE</p>
      <div className="move-buttons">
        {MOVE_KEYS.map(key => (
          <button key={key} className="move-btn" onClick={() => onChoose(key)}>
            <MoveIcon move={key} size={40} />
            <div className="move-btn-text">
              <span className="move-btn-name">{MOVES[key].name}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

const videoBlobCache = {}

function getVideoBlobUrl(src) {
  if (videoBlobCache[src]) return Promise.resolve(videoBlobCache[src])
  return fetch(src)
    .then(r => r.blob())
    .then(blob => {
      videoBlobCache[src] = URL.createObjectURL(blob)
      return videoBlobCache[src]
    })
    .catch(() => src)
}

function CountdownDisplay({ value }) {
  return (
    <div className="countdown">
      <span className="countdown-value">{value}</span>
      <span className="countdown-label">GET READY</span>
    </div>
  )
}

function MoveReveal({ move, label, direction, onComplete }) {
  const base = import.meta.env.BASE_URL
  const videoPath = MOVES[move]?.video
  const duration = MOVES[move]?.videoDuration ?? 3000
  const fullUrl = videoPath ? `${base}${videoPath}` : null
  const [src, setSrc] = useState(fullUrl ? (videoBlobCache[fullUrl] ?? null) : null)
  const firedRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!fullUrl || src) return
    let cancelled = false
    getVideoBlobUrl(fullUrl).then(url => {
      if (!cancelled) setSrc(url)
    })
    return () => { cancelled = true }
  }, [fullUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  if (!videoPath || !src) return null
  return (
    <div className={`move-reveal-anim move-reveal-anim--${direction}`}>
      <span className="move-reveal-anim-label">{label}</span>
      <video
        className="move-video"
        src={src}
        autoPlay
        muted
        playsInline
        onPlaying={() => {
          if (firedRef.current) return
          firedRef.current = true
          if (onComplete) timerRef.current = setTimeout(onComplete, duration)
        }}
      />
      <span className="move-reveal-anim-name">{MOVES[move]?.name}</span>
    </div>
  )
}

function RoundResultDisplay({ roundResult, playerMove, cpuMove, currentStreak, streakIsPlayer }) {
  const headlineClass =
    roundResult === 'PLAYER_WINS' ? 'result-headline--win' :
    roundResult === 'CPU_WINS'    ? 'result-headline--lose' : 'result-headline--draw'
  const headlineText =
    roundResult === 'PLAYER_WINS' ? 'YOU WIN!' :
    roundResult === 'CPU_WINS'    ? 'CPU WINS' : 'DRAW'

  return (
    <div className="round-result">
      <p className={`result-headline ${headlineClass}`}>{headlineText}</p>
      <div className="move-reveal">
        <div className="move-reveal-side">
          <span className="move-reveal-label">YOU</span>
          <MoveIcon move={playerMove} size={48} />
          <span className="move-reveal-name">{MOVES[playerMove]?.name}</span>
        </div>
        <span className="move-reveal-vs">VS</span>
        <div className="move-reveal-side">
          <span className="move-reveal-label">CPU</span>
          <MoveIcon move={cpuMove} size={48} />
          <span className="move-reveal-name">{MOVES[cpuMove]?.name}</span>
        </div>
      </div>
      {currentStreak >= 2 && (
        <p className="streak-badge">
          {streakIsPlayer ? 'YOUR' : 'CPU'} STREAK: {currentStreak}
        </p>
      )}
    </div>
  )
}

function getStars(playerScore, cpuScore) {
  if (cpuScore === 0) return 5
  if (playerScore - cpuScore >= 2) return 4
  return 3
}

function MatchOverDisplay({ matchWinner, playerScore, cpuScore, matchTarget, playerMoveSummary, playerWrestler, onRematch, onMenu }) {
  const base = import.meta.env.BASE_URL
  const playerWins = matchWinner === 'PLAYER_WINS'
  const stars = playerWins ? getStars(playerScore, cpuScore) : 0

  return (
    <div className="match-over">
      <p className={`match-result-text ${playerWins ? 'match-result-text--win' : 'match-result-text--lose'}`}>
        {playerWins ? 'YOU WIN!' : 'CPU WINS'}
      </p>

      {playerWins && (
        <img className="championship-img" src={cachedSrc(`${base}images/championship.png`)} alt="Championship belt" />
      )}

      {playerWins && (
        <div className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
      )}

      <p className="match-score">{playerScore} — {cpuScore}</p>

      {Object.keys(playerMoveSummary).length > 0 && (
        <div className="move-summary">
          <p className="move-summary-title">YOUR MOVES</p>
          {MOVE_KEYS.map(key => (
            <div key={key} className="move-summary-row">
              <span className="move-summary-name">{MOVES[key].shortName}</span>
              <span className="move-summary-count">{playerMoveSummary[key] || 0}</span>
            </div>
          ))}
        </div>
      )}

      <div className="match-over-buttons">
        <RetroButton variant="gold" onClick={onRematch}>REMATCH</RetroButton>
        <button className="text-btn" onClick={onMenu}>MAIN MENU</button>
      </div>
    </div>
  )
}

// Phases: 'countdown' → 'player_video' → 'cpu_video' → null (result)
export default function GameScreen({ state, audio, onPlayerChooses, onNextRound, onRematch, onMenu }) {
  const [phase, setPhase] = useState(null)
  const [countdownValue, setCountdownValue] = useState(3)
  const [headerScores, setHeaderScores] = useState({ player: 0, cpu: 0 })
  useLayoutEffect(() => {
    if (state.roundState === 'PLAYER_CHOOSING') {
      setHeaderScores({ player: state.playerScore, cpu: state.cpuScore })
    } else if (state.roundState === 'SHOWING_RESULT') {
      setPhase('countdown')
      setCountdownValue(3)
    }
  }, [state.roundState]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    MOVE_KEYS.forEach(key => {
      const src = MOVES[key]?.video
      if (src) getVideoBlobUrl(`${base}${src}`)
    })
  }, [])

  useEffect(() => {
    if (state.roundState !== 'SHOWING_RESULT') return
    const timers = [
      setTimeout(() => setCountdownValue(2), 600),
      setTimeout(() => setCountdownValue(1), 1200),
      setTimeout(() => setPhase('player_video'), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [state.roundState]) // eslint-disable-line react-hooks/exhaustive-deps

  function finishReveal() {
    setPhase(null)
    setHeaderScores({ player: state.playerScore, cpu: state.cpuScore })
    if (state.matchWinner === 'PLAYER_WINS' || state.roundResult === 'PLAYER_WINS') audio.onWin()
    else if (state.matchWinner === 'CPU_WINS' || state.roundResult === 'CPU_WINS') audio.onLose()
    else audio.onDraw()
  }

  const playerWrestler = state.playerCharacter + 1
  const cpuWrestler = state.cpuCharacter + 1
  const showResult = state.roundState === 'SHOWING_RESULT' && phase === null
  const isRevealing = phase === 'player_video' || phase === 'cpu_video'

  return (
    <div className="screen" onClick={isRevealing ? finishReveal : undefined}>
      <ScoreHeader
        playerScore={headerScores.player}
        cpuScore={headerScores.cpu}
        playerWrestler={playerWrestler}
        cpuWrestler={cpuWrestler}
      />

      {state.roundState === 'PLAYER_CHOOSING' && (
        <MoveChooser onChoose={onPlayerChooses} />
      )}

      {phase === 'countdown' && (
        <CountdownDisplay value={countdownValue} />
      )}

      {phase === 'player_video' && (
        <MoveReveal
          move={state.playerMove}
          label="YOU CHOSE"
          direction="left"
          onComplete={() => setPhase('cpu_video')}
        />
      )}

      {phase === 'cpu_video' && (
        <MoveReveal
          move={state.cpuMove}
          label="CPU CHOSE"
          direction="right"
          onComplete={finishReveal}
        />
      )}

      {showResult && !state.matchWinner && (
        <>
          <RoundResultDisplay
            roundResult={state.roundResult}
            playerMove={state.playerMove}
            cpuMove={state.cpuMove}
            currentStreak={state.currentStreak}
            streakIsPlayer={state.streakIsPlayer}
          />
          <RetroButton onClick={onNextRound}>NEXT ROUND</RetroButton>
        </>
      )}

      {showResult && state.matchWinner && (
        <MatchOverDisplay
          matchWinner={state.matchWinner}
          playerScore={state.playerScore}
          cpuScore={state.cpuScore}
          matchTarget={state.matchTarget}
          playerMoveSummary={state.playerMoveSummary}
          playerWrestler={playerWrestler}
          onRematch={onRematch}
          onMenu={onMenu}
        />
      )}
    </div>
  )
}
