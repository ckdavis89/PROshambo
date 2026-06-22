import { useState } from 'react'
import RetroButton from './RetroButton.jsx'
import { createRoom, joinRoom } from '../game/room.js'

export default function MultiplayerLobbyScreen({ onJoined, onBack }) {
  const [view, setView] = useState('menu')       // 'menu' | 'create' | 'join'
  const [bestOf, setBestOf] = useState(3)
  const [roomCode, setRoomCode] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const code = await createRoom(bestOf)
      setRoomCode(code)
      setView('create')
      onJoined(code, 'p1')
    } catch {
      setError('Failed to create room. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    const code = joinInput.trim().toUpperCase()
    if (code.length !== 4) { setError('Enter a 4-letter room code.'); return }
    setLoading(true)
    setError('')
    try {
      await joinRoom(code)
      onJoined(code, 'p2')
    } catch (e) {
      setError(e.message || 'Could not join room.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="screen">
      <button className="text-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        ← BACK
      </button>

      <h2 className="mp-title">ONLINE</h2>
      <hr className="gold-divider" />

      {view === 'menu' && (
        <>
          <div style={{ flex: 1 }} />
          <p className="section-label">BEST OF</p>
          <div className="best-of-row">
            {[3, 5, 7].map(n => (
              <button
                key={n}
                className={`best-of-btn${bestOf === n ? ' active' : ''}`}
                onClick={() => setBestOf(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <RetroButton onClick={handleCreate} disabled={loading}>
            {loading ? 'CREATING...' : 'CREATE ROOM'}
          </RetroButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--navy-elevated)' }} />
            <span className="section-label" style={{ flexShrink: 0 }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--navy-elevated)' }} />
          </div>
          <div className="join-row">
            <input
              className="code-input"
              type="text"
              maxLength={4}
              placeholder="XXXX"
              value={joinInput}
              onChange={e => { setJoinInput(e.target.value.toUpperCase()); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoCapitalize="characters"
            />
            <RetroButton onClick={handleJoin} disabled={loading} className="join-btn">
              {loading ? '...' : 'JOIN'}
            </RetroButton>
          </div>
          {error && <p className="mp-error">{error}</p>}
          <div style={{ flex: 2 }} />
        </>
      )}
    </div>
  )
}
