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
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
