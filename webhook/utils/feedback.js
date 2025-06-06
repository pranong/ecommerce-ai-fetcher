const fs = require('fs');
const path = require('path');

const FEEDBACK_PATH = path.join(__dirname, '..', 'feedback.json');

function loadFeedback() {
  if (!fs.existsSync(FEEDBACK_PATH)) {
    return { interested: [], not_interested: [] };
  }
  return JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
}

function saveFeedback(feedback) {
  fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(feedback, null, 2));
}

function addFeedback(type, listingId, embedding) {
  const feedback = loadFeedback();
  feedback[type].push({ listingId, embedding });
  saveFeedback(feedback);
}

module.exports = { loadFeedback, saveFeedback, addFeedback };