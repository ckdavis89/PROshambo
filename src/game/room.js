import { ref, set, get, update, onValue, off, remove } from 'firebase/database'
import { db } from '../firebase.js'
import { beats } from './moves.js'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

export function generateRoomCode() {
  let code = ''
  for (let i = 0; i < 4; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  return code
}

export function computeRoundResult(p1Move, p2Move) {
  if (p1Move === p2Move) return 'draw'
  return beats(p1Move, p2Move) ? 'p1_wins' : 'p2_wins'
}

function freshRound() {
  return { phase: 'choosing', p1Move: null, p2Move: null, result: null }
}

export async function createRoom(bestOf) {
  const code = generateRoomCode()
  await set(ref(db, `rooms/${code}`), {
    bestOf,
    matchTarget: Math.ceil(bestOf / 2),
    createdAt: Date.now(),
    phase: 'waiting',
    p1Character: -1,
    p2Character: -1,
    p1Score: 0,
    p2Score: 0,
    roundNumber: 1,
    round: freshRound(),
    matchWinner: null,
  })
  return code
}

export async function joinRoom(code) {
  const snap = await get(ref(db, `rooms/${code}`))
  if (!snap.exists()) throw new Error('Room not found')
  const room = snap.val()
  if (room.phase !== 'waiting') throw new Error('Room is full or already started')
  await update(ref(db, `rooms/${code}`), { phase: 'character_select' })
  return room
}

export async function setCharacter(code, player, character) {
  await update(ref(db, `rooms/${code}`), { [`${player}Character`]: character })
}

export async function startGame(code) {
  await update(ref(db, `rooms/${code}`), { phase: 'playing' })
}

export async function submitMove(code, player, move) {
  await update(ref(db, `rooms/${code}/round`), { [`${player}Move`]: move })
}

export async function resolveRound(code, room) {
  const result = computeRoundResult(room.round.p1Move, room.round.p2Move)
  const newP1Score = room.p1Score + (result === 'p1_wins' ? 1 : 0)
  const newP2Score = room.p2Score + (result === 'p2_wins' ? 1 : 0)
  const matchWinner =
    newP1Score >= room.matchTarget ? 'p1' :
    newP2Score >= room.matchTarget ? 'p2' : null

  await update(ref(db, `rooms/${code}`), {
    'round/phase': 'revealing',
    'round/result': result,
    p1Score: newP1Score,
    p2Score: newP2Score,
    ...(matchWinner ? { matchWinner, phase: 'finished' } : {}),
  })
}

export async function advanceRound(code, roundNumber) {
  await update(ref(db, `rooms/${code}`), {
    roundNumber: roundNumber + 1,
    round: freshRound(),
  })
}

export async function rematch(code, bestOf) {
  await update(ref(db, `rooms/${code}`), {
    phase: 'character_select',
    p1Character: -1,
    p2Character: -1,
    p1Score: 0,
    p2Score: 0,
    roundNumber: 1,
    round: freshRound(),
    matchWinner: null,
  })
}

export async function deleteRoom(code) {
  await remove(ref(db, `rooms/${code}`))
}

export function subscribeToRoom(code, callback) {
  const roomRef = ref(db, `rooms/${code}`)
  onValue(roomRef, snap => { if (snap.exists()) callback(snap.val()) })
  return () => off(roomRef)
}
