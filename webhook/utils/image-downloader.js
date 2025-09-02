const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadImages(listing) {
  const folder = path.join(__dirname, '..', 'tmp', (listing.id).replace(/\|/g, "-"));
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const imagePaths = [];
  for (let i = 0; i < listing.imageUrls.length; i++) {
    const response = await axios.get(listing.imageUrls[i], { responseType: 'arraybuffer', httpsAgent: agent });
    const buffer = Buffer.from(response.data, 'binary');
    const filePath = path.join(folder, `img${i}.jpg`);
    await sharp(buffer).resize(224, 224).toFile(filePath);
    imagePaths.push(filePath);
  }
  return imagePaths;
}

module.exports = { downloadImages };
