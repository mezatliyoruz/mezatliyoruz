const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInAnonymously } = require('firebase/auth');
const sharp = require('sharp');

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
const storage = getStorage(app);
const auth = getAuth(app);

async function run() {
  // console.log("Authenticating anonymously...");
  // await signInAnonymously(auth);
  // console.log("Auth success!");

  const docRef = doc(db, 'cms', 'home_collage');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log("No collage doc found!");
    return;
  }

  const data = docSnap.data();
  console.log("Fetched collage data.");

  // Helper to compress and upload a URL
  async function processUrl(url, keyName) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return url;
    console.log(`Downloading ${keyName}: ${url}`);
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Compressing ${keyName}...`);
    // Compress image to 80% quality JPEG and max width 1200 for optimization
    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 80, progressive: true })
      .resize({ width: 1200, withoutEnlargement: true })
      .toBuffer();

    const filename = `optimized_${keyName}_${Date.now()}.jpg`;
    console.log(`Uploading ${filename} to storage...`);
    const fileRef = ref(storage, `listings/collage/${filename}`);
    
    await uploadBytes(fileRef, compressedBuffer, { contentType: 'image/jpeg' });
    const downloadUrl = await getDownloadURL(fileRef);
    console.log(`Uploaded! New URL: ${downloadUrl}`);
    return downloadUrl;
  }

  // Iterate and optimize both live and draft
  const targets = ['live', 'draft'];
  const sections = ['leftVertical', 'rightTop', 'rightBottom'];

  for (const target of targets) {
    if (!data[target]) continue;
    for (const section of sections) {
      const box = data[target][section];
      if (!box) continue;

      // Handle standard images array
      if (box.images && box.images.length > 0) {
        for (let i = 0; i < box.images.length; i++) {
          box.images[i] = await processUrl(box.images[i], `${target}_${section}_images_${i}`);
        }
      }

      // Handle imagesWeb array
      if (box.imagesWeb && box.imagesWeb.length > 0) {
        for (let i = 0; i < box.imagesWeb.length; i++) {
          box.imagesWeb[i] = await processUrl(box.imagesWeb[i], `${target}_${section}_web_${i}`);
        }
      }

      // Handle imagesMobile array
      if (box.imagesMobile && box.imagesMobile.length > 0) {
        for (let i = 0; i < box.imagesMobile.length; i++) {
          box.imagesMobile[i] = await processUrl(box.imagesMobile[i], `${target}_${section}_mobile_${i}`);
        }
      }
    }
  }

  console.log("Updating Firestore document...");
  await updateDoc(docRef, data);
  console.log("Firestore document updated successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
