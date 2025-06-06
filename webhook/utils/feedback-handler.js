const fs = require('fs');
const path = require('path');

const FEEDBACK_PATH = path.join(__dirname, '..', 'feedback.json');
function loadFeedback() {
  if (!fs.existsSync(FEEDBACK_PATH)) {
    return { interested: [], not_interested: [], reasons: {}, temp:[] };
  }
  return JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
}

/**
 * Look up embedding and reason for a given listingId.
 * Returns an object: { embedding, type, reason } or null if not found.
 * type is 'interested' or 'not_interested'
 */
function lookupEmbeddingForListing(listingId) {
  const feedback = loadFeedback();

  for (const type of ['temp']) {
    const entry = feedback[type].find(e => e.listingId === listingId);
    if (entry) {
      const reason = feedback.reasons ? feedback.reasons[listingId] || null : null;
      return { embedding: entry.embedding, type, reason };
    }
  }
  return null; // Not found
}
function saveFeedback(feedback) {
  fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(feedback, null, 2));
}

/**
 * Add feedback for a listing.
 * @param {'interested'|'not_interested'} type 
 * @param {string} listingId 
 * @param {number[]} embedding 
 * @param {string|null} reason optional reason for 'not_interested' type
 */
function addFeedback(type, listingId, embedding, reason = null) {
  if (!['interested', 'not_interested','temp'].includes(type)) {
    throw new Error(`Invalid feedback type: ${type}`);
  }

  const feedback = loadFeedback();

  // Avoid duplicate entries
  const exists = feedback[type].some(e => e.listingId === listingId);
  if (!exists) {
    feedback[type].push({ listingId, embedding });
  }

  // Save reason if provided and type is 'not_interested'
  if (type === 'not_interested' && reason) {
    if (!feedback.reasons) feedback.reasons = {};
    feedback.reasons[listingId] = reason;
  }

  saveFeedback(feedback);
}

function saveEmbedToTemp(listing,imageEmbeds) {
    // console.log('listing', listing.id, imageEmbeds)
   addFeedback('temp', listing.id, imageEmbeds)
}

module.exports = { lookupEmbeddingForListing, addFeedback, saveEmbedToTemp };
