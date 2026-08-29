const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDZDj5BaBZq0zq0mCOtnUru2KbPNc5eP1s",
  authDomain: "mezatliyoruz-c6611.firebaseapp.com",
  projectId: "mezatliyoruz-c6611",
  storageBucket: "mezatliyoruz-c6611.firebasestorage.app",
  messagingSenderId: "302474123937",
  appId: "1:302474123937:web:882df0635ffdb428e96ee0",
  measurementId: "G-LTYQ147J30"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDoc() {
  try {
    const docRef = doc(db, 'cms', 'home_collage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('DOCUMENT DATA:', JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log('DOCUMENT DOES NOT EXIST!');
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}

checkDoc();
