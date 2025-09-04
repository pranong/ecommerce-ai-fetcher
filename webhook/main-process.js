// main.js
const { fetchEbayListings, fetchByItem } = require('./utils/ebay-fetcher/fetch-ebay');
const { downloadImages } = require('./utils/image-downloader');
const { checkImageIsclothing } = require('./utils/embedder');
const { calculateSimilarity } = require('./utils/similarity');
// const { sendNotification } = require('./utils/notification/line/notifier');
const { sendNotification, getKeywords, getExcludes } = require('./utils/notification/telegram/notifier');
const { saveEmbedToTemp } = require('./utils/feedback-handler');
const { loadFeedback } = require('./utils/feedback');

// const fs = require('fs/promises');
const fs = require('fs');
const path = require('path');


const SIMILARITY_THRESHOLD = 0.99;
let seenListingIds = new Set();

async function processListing(listing) {
  console.log('TITLE:', listing.title)
  console.log('IMG_URL:',listing.imageUrls)
  if (listing.imageUrls.length == 0) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REMOVE ID FROM LIST FOR RETRY')
  //   let itemDetail = await fetchByItem(listing)
    console.log('id', listing.id)
    seenListingIds.delete(listing.id);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REMOVE ID FROM LIST FOR RETRY')
  //   listing = { ...listing, imageUrls: itemDetail.data.image ? [itemDetail.data.image.imageUrl] : [] }
  }
  const imagePaths = await downloadImages(listing);
  const imageIsClothing = await checkImageIsclothing(imagePaths, listing);

  // if (imageIsClothing || imagePaths == [] || listing.categories.find(x => ['15687', '11450', '185100'].includes(x.categoryId))) {
  if (imageIsClothing) {
    console.log('          isClothing: true')
    await sendNotification(listing)
  } else {
    console.log('          isClothing: false')
  }
}

async function mainProcess() {
  let keywords = getKeywords();
  let excludes = getExcludes();
  await deleteFolderByDate('./tmp')

  console.log('===========================================START MAIN_PROCESS===========================================')
  const listings = await fetchEbayListings(keywords, excludes, 200);
  console.log('============================================END MAIN_PROCESS============================================')
  
  if (seenListingIds.size > 0) {
    for (const listing of listings) {
      if (!seenListingIds.has(listing.id)) {
        seenListingIds.add(listing.id);
        await processListing(listing);
      }
    }
  } else {
    for (const listing of listings) {
      seenListingIds.add(listing.id);
    }
  }
}

async function deleteFolderByDate(tmpDir) {
  try {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    // Ensure tmp directory exists
    if (!fs.existsSync(tmpDir)) {
      console.log('tmp directory does not exist.');
      fs.mkdirSync(tmpDir, { recursive: true });
    } else {
      fs.readdir(tmpDir, (err, files) => {
        if (err) {
          console.error('Failed to read tmp directory:', err);
          return;
        }

        files.forEach(file => {
          const fullPath = path.join(tmpDir, file);

          fs.stat(fullPath, (err, stats) => {
            if (err) {
              console.error('Failed to get stats for', fullPath, err);
              return;
            }

            if (stats.isDirectory()) {
              const age = now - stats.ctimeMs;

              if (age > FIVE_MINUTES) {
                fs.rm(fullPath, { recursive: true, force: true }, (err) => {
                  if (err) {
                    console.error('Failed to delete', fullPath, err);
                  } else {
                    console.log('Deleted (created < 5min ago):', fullPath);
                  }
                });
              }
            }
          });
        });
      });
    }
  } catch (err) {
    console.error('Error deleting folder:', err);
  }
}

module.exports = { mainProcess };
