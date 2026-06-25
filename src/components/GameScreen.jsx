import { useState, useEffect, useLayoutEffect } from 'react'
import RetroButton from './RetroButton.jsx'
import { MOVES, MOVE_KEYS } from '../game/moves.js'

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
          src={`${base}images/wrestler_${playerWrestler}_icon.jpeg`}
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
          src={`${base}images/wrestler_${cpuWrestler}_icon.jpeg`}
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

function CountdownDisplay({ value }) {
  return (
    <div className="countdown">
      <span className="countdown-value">{value}</span>
      <span className="countdown-label">GET READY</span>
    </div>
  )
}

function MoveGifReveal({ move, label, gifKey, direction }) {
  const base = import.meta.env.BASE_URL
  const gif = MOVES[move]?.gif
  if (!gif) return null
  return (
    <div className={`gif-reveal gif-reveal--${direction}`}>
      <span className="gif-reveal-label">{label}</span>
      <img key={gifKey} className="move-gif" src={`${base}${gif}`} alt={MOVES[move]?.name} />
      <span className="gif-reveal-name">{MOVES[move]?.name}</span>
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
        <img className="championship-img" src={`${base}images/championship.png`} alt="Championship belt" />
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

// Phases: 'countdown' → 'player_gif' → 'cpu_gif' → null (result)
export default function GameScreen({ state, audio, onPlayerChooses, onNextRound, onRematch, onMenu }) {
  const [phase, setPhase] = useState(null)
  const [countdownValue, setCountdownValue] = useState(3)
  const [headerScores, setHeaderScores] = useState({ player: 0, cpu: 0 })
  const [gifBust, setGifBust] = useState(0)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    MOVE_KEYS.forEach(key => {
      const gif = MOVES[key]?.gif
      if (gif) new Image().src = `${base}${gif}`
    })
  }, [])

  useLayoutEffect(() => {
    if (state.roundState === 'PLAYER_CHOOSING') {
      setHeaderScores({ player: state.playerScore, cpu: state.cpuScore })
    } else if (state.roundState === 'SHOWING_RESULT') {
      setPhase('countdown')
      setCountdownValue(3)
      setGifBust(prev => prev + 1)
    }
  }, [state.roundState]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.roundState !== 'SHOWING_RESULT') return
    const playerGifDur = MOVES[state.playerMove]?.gifDuration ?? 3000
    const cpuGifDur = MOVES[state.cpuMove]?.gifDuration ?? 3000
    const timers = [
      setTimeout(() => setCountdownValue(2), 600),
      setTimeout(() => setCountdownValue(1), 1200),
      setTimeout(() => setPhase('player_gif'), 1800),
      setTimeout(() => setPhase('cpu_gif'), 1800 + playerGifDur),
      setTimeout(() => {
        setPhase(null)
        setHeaderScores({ player: state.playerScore, cpu: state.cpuScore })
        if (state.matchWinner === 'PLAYER_WINS' || state.roundResult === 'PLAYER_WINS') audio.onWin()
        else if (state.matchWinner === 'CPU_WINS' || state.roundResult === 'CPU_WINS') audio.onLose()
        else audio.onDraw()
      }, 1800 + playerGifDur + cpuGifDur),
    ]
    return () => timers.forEach(clearTimeout)
  }, [state.roundState]) // eslint-disable-line react-hooks/exhaustive-deps

  const playerWrestler = state.playerCharacter + 1
  const cpuWrestler = state.cpuCharacter + 1
  const showResult = state.roundState === 'SHOWING_RESULT' && phase === null

  return (
    <div className="screen">
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

      {phase === 'player_gif' && (
        <MoveGifReveal move={state.playerMove} label="YOU CHOSE" gifKey={`p${gifBust}`} direction="left" />
      )}

      {phase === 'cpu_gif' && (
        <MoveGifReveal move={state.cpuMove} label="CPU CHOSE" gifKey={`c${gifBust}`} direction="right" />
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
