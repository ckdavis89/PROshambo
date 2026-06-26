import { useRef, useEffect } from 'react'

export default function useAudio() {
  const ctxRef = useRef(null)
  const buffers = useRef({})

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx
    let cancelled = false

    const base = import.meta.env.BASE_URL
    async function load(name, file) {
      const res = await fetch(`${base}audio/${file}`)
      const arr = await res.arrayBuffer()
      const decoded = await ctx.decodeAudioData(arr)
      if (!cancelled) buffers.current[name] = decoded
    }

    load('boo', 'boo.wav')
    load('cheer', 'cheer.mp3')
    load('fireworks', 'fireworks.wav')
    load('thud', 'thud.wav')

    return () => {
      cancelled = true
      ctx.close()
    }
  }, [])

  function play(name) {
    const ctx = ctxRef.current
    const buffer = buffers.current[name]
    if (!ctx || !buffer) return
    const doPlay = () => {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      src.start(0)
    }
    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay)
    } else {
      doPlay()
    }
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
