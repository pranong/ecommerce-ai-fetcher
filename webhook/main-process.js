// main.js
const { fetchEbayListings } = require('./utils/ebay-fetcher/fetch-ebay');
const { downloadImages } = require('./utils/image-downloader');
const { generateEmbeddings, checkImageIsclothing } = require('./utils/embedder');
const { calculateSimilarity } = require('./utils/similarity');
// const { sendNotification } = require('./utils/notification/line/notifier');
const { sendNotification } = require('./utils/notification/telegram/notifier');
const { saveEmbedToTemp } = require('./utils/feedback-handler');
const { loadFeedback } = require('./utils/feedback');

const fs = require('fs/promises');

const SIMILARITY_THRESHOLD = 0.99;
let seenListingIds = new Set();

async function processListing(listing) {
  const imagePaths = await downloadImages(listing);
  const imageIsClothing = await checkImageIsclothing(imagePaths, listing);
  if (imageIsClothing || imagePaths == []) {
    const imageEmbeds = await generateEmbeddings(imagePaths);
    const feedback = loadFeedback();

    // const isTooSimilar = feedback.not_interested.some(past =>
    //   imageEmbeds.some(current => calculateSimilarity(past.embedding, current) >= SIMILARITY_THRESHOLD)
    // );

    const interestedEmbeds = feedback.interested
      .map(item => item.embedding?.embedding || item.embedding || []);

    const notInterestedEmbeds = feedback.not_interested
      .map(item => item.embedding?.embedding || item.embedding || []);

    const matchesInterest = interestedEmbeds.some(past =>
      imageEmbeds.some(current =>
        calculateSimilarity(past, current) >= SIMILARITY_THRESHOLD
      )
    );

    const matchesNotInterest = notInterestedEmbeds.some(past =>
      imageEmbeds.some(current =>
        calculateSimilarity(past, current) >= SIMILARITY_THRESHOLD
      )
    );

    console.log('matchesInterest', matchesInterest, 'matchesNotInterest', matchesNotInterest)

    if (matchesInterest && !matchesNotInterest) {
      await saveEmbedToTemp(listing, imageEmbeds)
      await sendNotification(listing);
    }

    await sendNotification(listing)
  }
}

async function mainProcess(keywords) {
  console.log('yay', keywords)
  console.log('START Listing')
  await deleteFolder('./tmp')
  const listings = await fetchEbayListings(keywords, 200);
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

async function deleteFolder(path) {
  try {
    await fs.rm(path, { recursive: true, force: true });
    console.log('Folder deleted');
  } catch (err) {
    console.error('Error deleting folder:', err);
  }
}

module.exports = { mainProcess };
