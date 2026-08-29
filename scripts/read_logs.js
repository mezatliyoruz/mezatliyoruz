const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

const url = 'https://storage.googleapis.com/eas-workflows-production/logs/92251c20-82e2-42da-9c88-8cde9f793444/31f985e3-d12a-48a0-b1f0-6af48500f8fb/2026-08-28T09%3A20%3A43Z-307ab9e9-5488-4d43-8ca4-9229ee46f8b6.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260828%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260828T092546Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=91a7ea528525b585fc4e8652900fc0cf7252d53e39f0333b8a5c6e00d548331a7c830fd132dda71ddad03a0e13389b17c98c8f0861c9b9e0b77e1d49e15a22d28631703d6923a10be87dbd8c2147c5c0254f4021beda408dec95efc627e851e75e54dc4315f47a34b0fca1b738a234d41c6d3f208eac419b0e9de53813ffed1e83bcde76d0e2a6ce8a557b49c1d0ed5cd6af754761e1a09c5091b3cc23fe1d6db4ee288357954d8b7b9b20e9e188e821cb45229c7172bd4a954cfd020e26661ebbab4efcaac1537bbab53d6bac157c6e32a9a3904939085adb3545ad4a4cffdaddd703aa5f6a442c31e41834bcb4e7c09b405ee4863fde4629dd8ca9183ffd67';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    zlib.brotliDecompress(buffer, (err, decoded) => {
      if (err) {
        console.error('Brotli decompression failed:', err);
      } else {
        const text = decoded.toString('utf8');
        fs.writeFileSync('eas-decoded-logs.txt', text);
        console.log('Successfully decompressed and wrote logs to eas-decoded-logs.txt');
      }
    });
  });
}).on('error', (e) => {
  console.error(e);
});
