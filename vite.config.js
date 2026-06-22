import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to './' for GitHub Pages project repos.
// If your repo is named "proshambo", this works as-is.
// If assets 404 after deploy, change base to '/<your-repo-name>/'.
export default defineConfig({
  plugins: [react()],
  base: './',
})
