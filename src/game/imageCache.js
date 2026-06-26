const cache = {}

export function preloadImage(src) {
  if (cache[src]) return Promise.resolve(cache[src])
  return fetch(src)
    .then(r => r.blob())
    .then(blob => {
      cache[src] = URL.createObjectURL(blob)
      return cache[src]
    })
    .catch(() => src)
}

export function cachedSrc(src) {
  return cache[src] ?? src
}
