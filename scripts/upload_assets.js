const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyAW2-O1ufx2pCNvP18bKViAO1dIMxEGqV4",
  authDomain: "mezatliyoruz.firebaseapp.com",
  projectId: "mezatliyoruz",
  storageBucket: "mezatliyoruz.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const videosDir = path.join(__dirname, '../assets/videos');
const imagesDir = path.join(__dirname, '../assets/images');
const outputJsonPath = path.join(__dirname, 'uploaded_assets.json');

async function uploadFile(filePath, destinationPath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const storageRef = ref(storage, destinationPath);
    console.log(`Uploading ${filePath} to ${destinationPath}...`);
    
    // Set metadata content type
    const contentType = filePath.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
    const metadata = { contentType };
    
    const snapshot = await uploadBytes(storageRef, fileBuffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log(`Success! URL: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    throw error;
  }
}

async function main() {
  const mapping = {
    videos: {},
    images: {}
  };

  // 1. Upload videos
  const videos = [
    'video_1.mp4', 'video_2.mp4', 'video_3.mp4',
    'video_4.mp4', 'video_5.mp4', 'video_6.mp4'
  ];

  for (const video of videos) {
    const filePath = path.join(videosDir, video);
    if (fs.existsSync(filePath)) {
      const key = video.replace('.mp4', '');
      const url = await uploadFile(filePath, `videos/${video}`);
      mapping.videos[key] = url;
    }
  }

  // 2. Upload frame images
  for (let v = 1; v <= 6; v++) {
    for (let f = 1; f <= 3; f++) {
      const imageName = `video_${v}_frame_${f}.jpg`;
      const filePath = path.join(imagesDir, imageName);
      if (fs.existsSync(filePath)) {
        const key = `v${v}_f${f}`;
        const url = await uploadFile(filePath, `images/${imageName}`);
        mapping.images[key] = url;
      }
    }
  }

  // Write mapping JSON
  fs.writeFileSync(outputJsonPath, JSON.stringify(mapping, null, 2));
  console.log(`\nAll assets uploaded successfully! Mapping saved to ${outputJsonPath}`);
}

main().catch(console.error);
