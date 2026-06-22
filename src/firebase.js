import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// ---------------------------------------------------------------------------
// SETUP INSTRUCTIONS
// 1. Go to https://console.firebase.google.com and create a project.
// 2. Add a web app to the project (the </> icon on the project overview page).
// 3. In the Firebase console, go to Build → Realtime Database → Create database.
//    Choose any region, start in TEST MODE (open rules) for now.
// 4. Replace the placeholder values below with your project's config.
//    (Found in Project Settings → Your apps → SDK setup and configuration)
//
// Realtime Database rules to paste in the Firebase console (Rules tab):
// {
//   "rules": {
//     "rooms": {
//       ".read": true,
//       ".write": true
//     }
//   }
// }
// ---------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBdsNCk9HApTIPwjrnU-AF2vqEBBR6Pmd8",
  authDomain: "proshambo-12480.firebaseapp.com",
  databaseURL: "https://proshambo-12480-default-rtdb.firebaseio.com",
  projectId: "proshambo-12480",
  storageBucket: "proshambo-12480.firebasestorage.app",
  messagingSenderId: "75777262105",
  appId: "1:75777262105:web:d90c088228feea9483a088",
  measurementId: "G-VPKXY5S0F8"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
