import { useState, useEffect, useRef } from 'react'
import RetroButton from './RetroButton.jsx'
import { MOVES, MOVE_KEYS } from '../game/moves.js'
import {
  subscribeToRoom, setCharacter, startGame,
  submitMove, resolveRound, advanceRound, rematch, deleteRoom,
} from '../game/room.js'
import { recordOnlineMatch } from '../game/stats.js'

// ── Shared helpers ────────────────────────────────────────────────────────

const FACES_RIGHT = new Set([1, 3, 4, 5])

function MoveIcon({ move, size = 36 }) {
  const path = MOVES[move]?.svgPath
  if (!path) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="#E8ECF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WrestlerIcon({ wrestler, flip }) {
  const base = import.meta.env.BASE_URL
  return (
    <img
      className="score-icon"
      src={`${base}images/wrestler_${wrestler}_icon.jpeg`}
      alt=""
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    />
  )
}

// ── Score header ──────────────────────────────────────────────────────────

function ScoreHeader({ room, playerRole }) {
  const myChar   = (playerRole === 'p1' ? room.p1Character : room.p2Character) + 1
  const oppChar  = (playerRole === 'p1' ? room.p2Character : room.p1Character) + 1
  const myScore  = playerRole === 'p1' ? room.p1Score : room.p2Score
  const oppScore = playerRole === 'p1' ? room.p2Score : room.p1Score
  const myFlip   = !FACES_RIGHT.has(myChar)
  const oppFlip  = FACES_RIGHT.has(oppChar)

  return (
    <div className="score-header">
      <div className="score-player">
        <WrestlerIcon wrestler={myChar} flip={myFlip} />
        <div className="score-info">
          <span className="score-name">YOU</span>
          <span className="score-number">{myScore}</span>
        </div>
      </div>
      <span className="score-vs">VS</span>
      <div className="score-player score-player--cpu">
        <WrestlerIcon wrestler={oppChar} flip={oppFlip} />
        <div className="score-info">
          <span className="score-name">OPP</span>
          <span className="score-number">{oppScore}</span>
        </div>
      </div>
    </div>
  )
}

// ── Character select phase ────────────────────────────────────────────────

function CharacterSelectPhase({ room, roomCode, playerRole }) {
  const base = import.meta.env.BASE_URL
  const myChar = playerRole === 'p1' ? room.p1Character : room.p2Character
  const oppChar = playerRole === 'p1' ? room.p2Character : room.p1Character
  const [selected, setSelected] = useState(myChar >= 0 ? myChar : null)
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    await setCharacter(roomCode, playerRole, selected)
    setSaving(false)
  }

  const waiting = room.phase === 'waiting'
  const iConfirmed = myChar >= 0
  const oppConfirmed = oppChar >= 0

  return (
    <>
      {waiting && playerRole === 'p1' && (
        <div className="room-code-banner">
          <span className="section-label">ROOM CODE</span>
          <span className="room-code-display">{roomCode}</span>
          <span className="section-label">SHARE WITH YOUR OPPONENT</span>
        </div>
      )}

      <p className="section-label" style={{ marginTop: 8 }}>
        {iConfirmed
          ? oppConfirmed ? 'STARTING...' : 'WAITING FOR OPPONENT...'
          : 'CHOOSE YOUR WRESTLER'}
      </p>
      <hr className="gold-divider" />

      <div className="wrestler-grid" style={{ opacity: iConfirmed ? 0.5 : 1, pointerEvents: iConfirmed ? 'none' : 'auto' }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`wrestler-card${selected === i - 1 ? ' selected' : ''}`}
            onClick={() => !iConfirmed && setSelected(i - 1)}
          >
            <img src={`${base}images/wrestler_${i}.jpeg`} alt={`Wrestler ${i}`} />
          </div>
        ))}
        <div className="fifth-wrestler-wrap">
          <div
            className={`wrestler-card${selected === 4 ? ' selected' : ''}`}
            onClick={() => !iConfirmed && setSelected(4)}
          >
            <img src={`${base}images/wrestler_5.jpeg`} alt="Wrestler 5" />
          </div>
        </div>
      </div>

      {!iConfirmed && (
        <RetroButton onClick={handleConfirm} disabled={selected === null || saving}>
          {saving ? 'CONFIRMING...' : 'CONFIRM'}
        </RetroButton>
      )}
    </>
  )
}

// ── Round: choosing ───────────────────────────────────────────────────────

function ChoosingPhase({ room, roomCode, playerRole }) {
  const myMove = playerRole === 'p1' ? room.round.p1Move : room.round.p2Move
  const [submitting, setSubmitting] = useState(false)

  async function handleMove(move) {
    setSubmitting(true)
    await submitMove(roomCode, playerRole, move)
    setSubmitting(false)
  }

  if (myMove) {
    return (
      <div className="mp-waiting">
        <p className="move-prompt" style={{ marginTop: 0 }}>MOVE LOCKED IN</p>
        <MoveIcon move={myMove} size={64} />
        <p className="section-label" style={{ marginTop: 16 }}>WAITING FOR OPPONENT...</p>
      </div>
    )
  }

  return (
    <>
      <p className="move-prompt">CHOOSE YOUR MOVE</p>
      <div className="move-buttons">
        {MOVE_KEYS.map(key => (
          <button key={key} className="move-btn" onClick={() => handleMove(key)} disabled={submitting}>
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

// ── Round: revealing ──────────────────────────────────────────────────────

function RevealingPhase({ room, roomCode, playerRole, isP1 }) {
  const { p1Move, p2Move, result } = room.round
  const myMove  = playerRole === 'p1' ? p1Move : p2Move
  const oppMove = playerRole === 'p1' ? p2Move : p1Move

  const outcome =
    result === 'draw'    ? 'draw' :
    result === 'p1_wins' ? (playerRole === 'p1' ? 'win' : 'lose') :
                           (playerRole === 'p2' ? 'win' : 'lose')

  const headlineText  = outcome === 'win' ? 'YOU WIN!' : outcome === 'lose' ? 'YOU LOSE' : 'DRAW'
  const headlineClass = `result-headline--${outcome === 'win' ? 'win' : outcome === 'lose' ? 'lose' : 'draw'}`

  async function handleNext() {
    await advanceRound(roomCode, room.roundNumber)
  }

  return (
    <div className="round-result">
      <p className={`result-headline ${headlineClass}`}>{headlineText}</p>
      <div className="move-reveal">
        <div className="move-reveal-side">
          <span className="move-reveal-label">YOU</span>
          <MoveIcon move={myMove} size={48} />
          <span className="move-reveal-name">{MOVES[myMove]?.name}</span>
        </div>
        <span className="move-reveal-vs">VS</span>
        <div className="move-reveal-side">
          <span className="move-reveal-label">OPP</span>
          <MoveIcon move={oppMove} size={48} />
          <span className="move-reveal-name">{MOVES[oppMove]?.name}</span>
        </div>
      </div>
      {!room.matchWinner && (
        isP1
          ? <RetroButton onClick={handleNext}>NEXT ROUND</RetroButton>
          : <p className="section-label" style={{ padding: '16px 0' }}>WAITING FOR PLAYER 1...</p>
      )}
    </div>
  )
}

// ── Match over ────────────────────────────────────────────────────────────

function MatchOverPhase({ room, roomCode, playerRole, isP1, onLeave }) {
  const base = import.meta.env.BASE_URL
  const playerWon = room.matchWinner === playerRole
  const [rematching, setRematching] = useState(false)
  const recorded = useRef(false)

  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    const myScore  = playerRole === 'p1' ? room.p1Score : room.p2Score
    const oppScore = playerRole === 'p1' ? room.p2Score : room.p1Score
    recordOnlineMatch(playerWon ? 'WIN' : 'LOSS', myScore, oppScore)
  }, [])

  async function handleRematch() {
    setRematching(true)
    await rematch(roomCode, room.bestOf)
    setRematching(false)
  }

  async function handleLeave() {
    await deleteRoom(roomCode)
    onLeave()
  }

  return (
    <div className="match-over">
      <p className={`match-result-text ${playerWon ? 'match-result-text--win' : 'match-result-text--lose'}`}>
        {playerWon ? 'YOU WIN!' : 'YOU LOSE'}
      </p>
      {playerWon && (
        <img className="championship-img" src={`${base}images/championship.png`} alt="Championship belt" />
      )}
      <p className="match-score">
        {playerRole === 'p1' ? room.p1Score : room.p2Score}
        {' — '}
        {playerRole === 'p1' ? room.p2Score : room.p1Score}
      </p>
      <div className="match-over-buttons">
        {isP1
          ? <RetroButton variant="gold" onClick={handleRematch} disabled={rematching}>
              {rematching ? 'STARTING...' : 'REMATCH'}
            </RetroButton>
          : <p className="section-label" style={{ padding: '8px 0' }}>WAITING FOR P1 TO REMATCH...</p>
        }
        <button className="text-btn" onClick={handleLeave}>LEAVE ROOM</button>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────

export default function MultiplayerGameScreen({ roomCode, playerRole, onLeave }) {
  const [room, setRoom] = useState(null)
  const isP1 = playerRole === 'p1'
  const resolving = useRef(false)

  useEffect(() => subscribeToRoom(roomCode, setRoom), [roomCode])

  // P1 only: start game when both characters are set
  useEffect(() => {
    if (!room || !isP1) return
    if (room.phase === 'character_select' && room.p1Character >= 0 && room.p2Character >= 0) {
      startGame(roomCode)
    }
  }, [room?.p1Character, room?.p2Character, room?.phase])

  // P1 only: resolve round when both moves are in
  useEffect(() => {
    if (!room || !isP1) return
    if (room.phase === 'playing' &&
        room.round.phase === 'choosing' &&
        room.round.p1Move && room.round.p2Move &&
        !resolving.current) {
      resolving.current = true
      resolveRound(roomCode, room).finally(() => { resolving.current = false })
    }
  }, [room?.round?.p1Move, room?.round?.p2Move])

  if (!room) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className="section-label">CONNECTING...</p>
      </div>
    )
  }

  const showCharSelect = room.phase === 'waiting' || room.phase === 'character_select'

  return (
    <div className="screen">
      {showCharSelect && (
        <CharacterSelectPhase room={room} roomCode={roomCode} playerRole={playerRole} />
      )}

      {room.phase === 'playing' && (
        <>
          <ScoreHeader room={room} playerRole={playerRole} />
          {room.round.phase === 'choosing' && (
            <ChoosingPhase room={room} roomCode={roomCode} playerRole={playerRole} />
          )}
          {room.round.phase === 'revealing' && (
            <RevealingPhase room={room} roomCode={roomCode} playerRole={playerRole} isP1={isP1} />
          )}
        </>
      )}

      {room.phase === 'finished' && (
        <>
          <ScoreHeader room={room} playerRole={playerRole} />
          <MatchOverPhase
            room={room}
            roomCode={roomCode}
            playerRole={playerRole}
            isP1={isP1}
            onLeave={onLeave}
          />
        </>
      )}
    </div>
  )
}
