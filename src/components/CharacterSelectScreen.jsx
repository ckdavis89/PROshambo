import { useState } from 'react'
import RetroButton from './RetroButton.jsx'
import { cachedSrc } from '../game/imageCache.js'

const WRESTLERS = [1, 2, 3, 4, 5]

export default function CharacterSelectScreen({ onStart, onBack }) {
  const [selected, setSelected] = useState(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="screen">
      <button className="text-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        ← BACK
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center' }}>
        CHOOSE YOUR WRESTLER
      </h2>
      <hr className="gold-divider" />

      <div className="wrestler-grid">
        {WRESTLERS.slice(0, 4).map(i => (
          <div
            key={i}
            className={`wrestler-card${selected === i - 1 ? ' selected' : ''}`}
            onClick={() => setSelected(i - 1)}
          >
            <img src={cachedSrc(`${base}images/wrestler_${i}.jpeg`)} alt={`Wrestler ${i}`} />
          </div>
        ))}
        <div className="fifth-wrestler-wrap">
          <div
            className={`wrestler-card${selected === 4 ? ' selected' : ''}`}
            onClick={() => setSelected(4)}
          >
            <img src={cachedSrc(`${base}images/wrestler_5.jpeg`)} alt="Wrestler 5" />
          </div>
        </div>
      </div>

      <RetroButton onClick={() => onStart(selected)} disabled={selected === null}>
        FIGHT!
      </RetroButton>
    </div>
  )
}
