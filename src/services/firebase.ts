import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAW2-O1ufx2pCNvP18bKViAO1dIMxEGqV4",
  authDomain: "mezatliyoruz.firebaseapp.com",
  projectId: "mezatliyoruz",
  storageBucket: "mezatliyoruz.firebasestorage.app",
  messagingSenderId: "997570531035",
  appId: "1:997570531035:android:df1c141e3ef70736e286fe"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
