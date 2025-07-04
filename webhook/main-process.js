// main.js
const { fetchEbayListings } = require('./utils/ebay-fetcher/fetch-ebay');
const { downloadImages } = require('./utils/image-downloader');
const { generateEmbeddings, checkImageIsclothing, checkImageIsclothingYolo } = require('./utils/embedder');
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
  const imagePaths = await downloadImages(listing);
  const imageIsClothing = await checkImageIsclothing(imagePaths, listing);
  if (imageIsClothing || imagePaths == [] || listing.categories.find(x => ['15687', '11450', '185100'].includes(x.categoryId))) {
    console.log('imageIsClothing?>>>>>>>>>>>>>>>>>>>>', imageIsClothing)
    console.log('imagePaths == []>>>>>>>>>>>>>>>>>>>>', imagePaths == [])
    console.log('categories', listing.categories)
    console.log('categories in [15687, 11450, 185100]', listing.categories.find(x => ['15687', '11450', '185100'].includes(x.categoryId)))
    // const imageEmbeds = await generateEmbeddings(imagePaths);
    // const feedback = loadFeedback();

    // // const isTooSimilar = feedback.not_interested.some(past =>
    // //   imageEmbeds.some(current => calculateSimilarity(past.embedding, current) >= SIMILARITY_THRESHOLD)
    // // );

    // const interestedEmbeds = feedback.interested
    //   .map(item => item.embedding?.embedding || item.embedding || []);

    // const notInterestedEmbeds = feedback.not_interested
    //   .map(item => item.embedding?.embedding || item.embedding || []);

    // const matchesInterest = interestedEmbeds.some(past =>
    //   imageEmbeds.some(current =>
    //     calculateSimilarity(past, current) >= SIMILARITY_THRESHOLD
    //   )
    // );

    // const matchesNotInterest = notInterestedEmbeds.some(past =>
    //   imageEmbeds.some(current =>
    //     calculateSimilarity(past, current) >= SIMILARITY_THRESHOLD
    //   )
    // );

    // console.log('matchesInterest', matchesInterest, 'matchesNotInterest', matchesNotInterest)

    // if (matchesInterest && !matchesNotInterest) {
    //   await saveEmbedToTemp(listing, imageEmbeds)
    //   await sendNotification(listing);
    // }

    await sendNotification(listing)
  } else {
    console.log('isClothing?>>>>>>> false')
  }
}

async function mainProcess() {
  let keywords = getKeywords();
  let excludes = getExcludes();
  console.log('START Listing')
  await deleteFolderByDate('./tmp')
  const listings = await fetchEbayListings(keywords, excludes, 200);
  console.log('FINISH Listing')

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
