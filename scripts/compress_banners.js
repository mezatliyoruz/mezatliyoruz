const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../assets/images');
const banners = [
  'banner_live_auction.png',
  'banner_flea_market.png',
  'banner_producer.png'
];

async function compress() {
  for (const file of banners) {
    const filePath = path.join(imgDir, file);
    const backupPath = filePath + '.bak';
    
    // Backup original if not exists
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    console.log(`Compressing ${file}...`);
    // Read original backup (to avoid re-compressing already compressed files)
    const data = fs.readFileSync(backupPath);
    
    // Output compressed PNG using palette reduction and high compression
    await sharp(data)
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toFile(filePath);
      
    const oldSize = fs.statSync(backupPath).size;
    const newSize = fs.statSync(filePath).size;
    console.log(`Done! ${file} reduced from ${(oldSize/1024/1024).toFixed(2)}MB to ${(newSize/1024/1024).toFixed(2)}MB`);
  }
}

compress().catch(console.error);
