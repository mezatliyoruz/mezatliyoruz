import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDZDj5BaBZq0zq0mCOtnUru2KbPNc5eP1s",
  authDomain: "mezatliyoruz-c6611.firebaseapp.com",
  projectId: "mezatliyoruz-c6611",
  storageBucket: "mezatliyoruz-c6611.firebasestorage.app",
  messagingSenderId: "302474123937",
  appId: "1:302474123937:web:882df0635ffdb428e96ee0",
  measurementId: "G-LTYQ147J30"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
