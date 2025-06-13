const express = require('express');
const { mainProcess } = require('./main-process');
const { lookupEmbeddingForListing, addFeedback } = require('./utils/feedback-handler')
const { createHash } = require('node:crypto');

require('dotenv').config();

const app = express();

// challenge_code
app.get('/ebayChallenge', async (req, res) => {
    console.log(req.query.challenge_code)
    const hash = createHash('sha256');
    hash.update(req.query.challenge_code);
    hash.update('my-secure-random-token-9d2a83a7b');
    hash.update('https://18ed-49-229-134-167.ngrok-free.app/ebayChallenge');
    const responseHash = hash.digest('hex');
    console.log(new Buffer.from(responseHash).toString());
    //   await Promise.all(events.map(handleEvent));
    res.status(200).json({"challengeResponse": new Buffer.from(responseHash).toString()});
});

app.post('/ebayChallenge', async (req, res) => {
    const events = req.body;
    // console.log('ebayChallenge events', events)
    res.status(200).end();
});

mainProcess()
setInterval(function() {
    mainProcess()
}, 30 * 1000);

app.listen(3500, () => {
    console.log('LINE webhook listening on port 3500');
});