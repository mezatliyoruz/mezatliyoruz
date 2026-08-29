const fs = require('fs');
const content = fs.readFileSync('d:/Mobil Projeler/Mezatliyoruz/src/app/create.tsx', 'utf8');
const lines = content.split('\n');
console.log('--- create.tsx price inputs match ---');
lines.forEach((line, idx) => {
  if (line.includes('placeholder="Fiyat"') || line.includes('keyboardType="numeric"') || line.includes('value={price}')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
