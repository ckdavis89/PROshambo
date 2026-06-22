import { useReducer, useCallback, useState } from 'react'
import ModeSelectScreen from './components/ModeSelectScreen.jsx'
import CharacterSelectScreen from './components/CharacterSelectScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import MultiplayerLobbyScreen from './components/MultiplayerLobbyScreen.jsx'
import MultiplayerGameScreen from './components/MultiplayerGameScreen.jsx'
import { resolveRound } from './game/moves.js'
import { chooseCpuMove } from './game/cpuAI.js'
import { recordMatch } from './game/stats.js'
import useAudio from './hooks/useAudio.js'

const initial = {
  screen: 'MODE_SELECT',
  bestOf: 3,
  matchTarget: 2,
  playerCharacter: 0,
  cpuCharacter: 0,
  roundState: 'PLAYER_CHOOSING',
  playerMove: null,
  cpuMove: null,
  playerScore: 0,
  cpuScore: 0,
  roundResult: null,
  matchWinner: null,
  playerHistory: [],
  currentStreak: 0,
  streakIsPlayer: null,
  playerMoveSummary: {},
}

function computeStreak(state, result) {
  if (result === 'DRAW') return { currentStreak: 0, streakIsPlayer: null }
  const isPlayer = result === 'PLAYER_WINS'
  if (state.streakIsPlayer === isPlayer) {
    return { currentStreak: state.currentStreak + 1, streakIsPlayer: isPlayer }
  }
  return { currentStreak: 1, streakIsPlayer: isPlayer }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BEST_OF':
      return { ...state, bestOf: action.bestOf, matchTarget: Math.ceil(action.bestOf / 2) }

    case 'GO_CHARACTER_SELECT':
      return { ...state, screen: 'CHARACTER_SELECT' }

    case 'START_GAME':
      return {
        ...initial,
        screen: 'GAME',
        bestOf: state.bestOf,
        matchTarget: state.matchTarget,
        playerCharacter: action.playerCharacter,
        cpuCharacter: Math.floor(Math.random() * 5),
      }

    case 'PLAYER_CHOOSES': {
      const { move } = action
      const cpuMove = chooseCpuMove(state.playerHistory, state.matchTarget)
      const roundResult = resolveRound(move, cpuMove)
      const newPlayerScore = state.playerScore + (roundResult === 'PLAYER_WINS' ? 1 : 0)
      const newCpuScore = state.cpuScore + (roundResult === 'CPU_WINS' ? 1 : 0)
      const matchWinner =
        newPlayerScore >= state.matchTarget ? 'PLAYER_WINS' :
        newCpuScore >= state.matchTarget ? 'CPU_WINS' : null
      const newHistory = [...state.playerHistory, move]
      const streak = computeStreak(state, roundResult)

      if (matchWinner) recordMatch(matchWinner, newPlayerScore, newCpuScore)

      return {
        ...state,
        playerMove: move,
        cpuMove,
        roundResult,
        playerScore: newPlayerScore,
        cpuScore: newCpuScore,
        matchWinner,
        playerHistory: newHistory,
        roundState: 'SHOWING_RESULT',
        ...streak,
        playerMoveSummary: matchWinner
          ? newHistory.reduce((acc, m) => ({ ...acc, [m]: (acc[m] || 0) + 1 }), {})
          : state.playerMoveSummary,
      }
    }

    case 'NEXT_ROUND':
      return { ...state, roundState: 'PLAYER_CHOOSING', playerMove: null, cpuMove: null, roundResult: null }

    case 'REMATCH':
      return {
        ...initial,
        screen: 'GAME',
        bestOf: state.bestOf,
        matchTarget: state.matchTarget,
        playerCharacter: state.playerCharacter,
        cpuCharacter: Math.floor(Math.random() * 5),
      }

    case 'GO_HISTORY':
      return { ...state, screen: 'HISTORY' }

    case 'GO_MULTIPLAYER':
      return { ...state, screen: 'MULTIPLAYER_LOBBY' }

    case 'GO_MULTIPLAYER_GAME':
      return { ...state, screen: 'MULTIPLAYER_GAME' }

    case 'GO_MODE_SELECT':
      return { ...state, screen: 'MODE_SELECT' }

    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [mpInfo, setMpInfo] = useState(null)
  const audio = useAudio()

  const handleModeStart = useCallback(() => {
    audio.onModeSelected()
    dispatch({ type: 'GO_CHARACTER_SELECT' })
  }, [audio])

  const handleStartGame = useCallback((playerCharacter) => {
    dispatch({ type: 'START_GAME', playerCharacter })
  }, [])

  const handlePlayerChooses = useCallback((move) => {
    audio.onMoveTapped()
    dispatch({ type: 'PLAYER_CHOOSES', move })
  }, [audio])

  switch (state.screen) {
    case 'MODE_SELECT':
      return (
        <ModeSelectScreen
          bestOf={state.bestOf}
          onBestOfChange={(v) => dispatch({ type: 'SET_BEST_OF', bestOf: v })}
          onStart={handleModeStart}
          onMultiplayer={() => dispatch({ type: 'GO_MULTIPLAYER' })}
          onHistory={() => dispatch({ type: 'GO_HISTORY' })}
        />
      )
    case 'CHARACTER_SELECT':
      return (
        <CharacterSelectScreen
          onStart={handleStartGame}
          onBack={() => dispatch({ type: 'GO_MODE_SELECT' })}
        />
      )
    case 'GAME':
      return (
        <GameScreen
          state={state}
          audio={audio}
          onPlayerChooses={handlePlayerChooses}
          onNextRound={() => dispatch({ type: 'NEXT_ROUND' })}
          onRematch={() => dispatch({ type: 'REMATCH' })}
          onMenu={() => dispatch({ type: 'GO_MODE_SELECT' })}
        />
      )
    case 'HISTORY':
      return <HistoryScreen onBack={() => dispatch({ type: 'GO_MODE_SELECT' })} />

    case 'MULTIPLAYER_LOBBY':
      return (
        <MultiplayerLobbyScreen
          onJoined={(code, role) => {
            setMpInfo({ roomCode: code, playerRole: role })
            dispatch({ type: 'GO_MULTIPLAYER_GAME' })
          }}
          onBack={() => dispatch({ type: 'GO_MODE_SELECT' })}
        />
      )

    case 'MULTIPLAYER_GAME':
      return (
        <MultiplayerGameScreen
          roomCode={mpInfo.roomCode}
          playerRole={mpInfo.playerRole}
          onLeave={() => {
            setMpInfo(null)
            dispatch({ type: 'GO_MODE_SELECT' })
          }}
        />
      )

    default:
      return null
  }
}
