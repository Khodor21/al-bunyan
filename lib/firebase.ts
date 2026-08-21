import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { Messaging, getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function getFirebaseApp(): FirebaseApp {
  // Singleton: reuse existing app if already initialized
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

/**
 * Returns a Firebase Messaging instance, or null if the browser does not
 * support FCM (e.g. Safari without PWA, Firefox without permission).
 *
 * Always use isSupported() before calling getMessaging() to avoid crashes.
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('[firebase] Firebase Messaging is not supported in this browser.')
      return null
    }

    const app = getFirebaseApp()
    return getMessaging(app)
  } catch (err) {
    console.error('[firebase] Error initializing Firebase Messaging:', err)
    return null
  }
}
