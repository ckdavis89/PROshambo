import { useRef, useEffect } from 'react'

export default function useAudio() {
  const sounds = useRef({})

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const load = (name, file) => {
      const audio = new Audio(`${base}audio/${file}`)
      audio.preload = 'auto'
      sounds.current[name] = audio
    }
    load('boo', 'boo.wav')
    load('cheer', 'cheer.mp3')
    load('fireworks', 'fireworks.wav')
    load('thud', 'thud.wav')

    return () => {
      Object.values(sounds.current).forEach(a => { a.src = '' })
      sounds.current = {}
    }
  }, [])

  function play(name) {
    const a = sounds.current[name]
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  return {
    onModeSelected: () => { play('cheer'); vibrate(50) },
    onMoveTapped:   () => vibrate(40),
    onWin:          () => { play('fireworks'); vibrate([80, 40, 80, 40, 200]) },
    onDraw:         () => { play('boo'); vibrate(250) },
    onLose:         () => { play('thud'); vibrate(150) },
  }
}
