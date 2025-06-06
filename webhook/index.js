const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { mainProcess } = require('./main-process');
const { lookupEmbeddingForListing, addFeedback } = require('./utils/feedback-handler')
const { createHash } = require('node:crypto');

require('dotenv').config();

const app = express();

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

let keywords = '(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub)'

// Webhook handler
app.post('/webhook', middleware(config), async (req, res) => {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
});

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

// Example handler
async function handleEvent(event) {
    // console.log('event', event)
    if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const msg = event.message.text;

        if (msg == 'showKeywords') {
            return client.replyMessage(replyToken, {
                type: 'text',
                text: `Keywords: ${keywords}`,
            });
        } else if (msg == 'updateKeywords') {
            // return client.replyMessage(replyToken, {
            //     type: 'text',
            //     text: `Do you want to update keywords?`,
            //     quickReply: {
            //         items: [
            //             {
            //                 type: 'action',
            //                 action: {
            //                     type: 'postback',
            //                     label: 'Yes',
            //                     data: JSON.stringify({
            //                         action: 'confirmUpdateKeywords',
            //                         value: 'Y'
            //                     }),
            //                 },
            //             },
            //             {
            //                 type: 'action',
            //                 action: {
            //                     type: 'postback',
            //                     label: 'No',
            //                     data: JSON.stringify({
            //                         action: 'confirmUpdateKeywords',
            //                         value: 'N'
            //                     }),
            //                 },
            //             },
            //         ]
            //     }
            // });
        } else {
            return client.replyMessage(replyToken, {
                type: 'text',
                text: keywords,
            }); 
        }
    } else if (event.type === 'postback') {
        let data = JSON.parse(event.postback.data)
        if (data.action === 'feedback' && data.decision === 'not_interested') {
            console.log('feedback')
            // Ask for reason
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'Why are you not interested?',
                quickReply: {
                    items: [
                        {
                            type: 'action',
                            action: {
                                type: 'postback',
                                label: 'Graphic',
                                data: JSON.stringify({
                                    action: 'reason',
                                    reason: 'graphic',
                                    listingId: data.listingId,
                                    imageEmbeds: data.imageEmbeds
                                }),
                            },
                        },
                        {
                            type: 'action',
                            action: {
                                type: 'postback',
                                label: 'Stitching',
                                data: JSON.stringify({
                                    action: 'reason',
                                    reason: 'stitching',
                                    listingId: data.listingId,
                                    imageEmbeds: data.imageEmbeds
                                }),
                            },
                        },
                        {
                            type: 'action',
                            action: {
                                type: 'postback',
                                label: 'Tag',
                                data: JSON.stringify({
                                    action: 'reason',
                                    reason: 'tag',
                                    listingId: data.listingId,
                                    imageEmbeds: data.imageEmbeds
                                }),
                            },
                        },
                        {
                            type: 'action',
                            action: {
                                type: 'postback',
                                label: 'Other',
                                data: JSON.stringify({
                                    action: 'reason',
                                    reason: 'other',
                                    listingId: data.listingId,
                                    imageEmbeds: data.imageEmbeds
                                }),
                            },
                        },
                    ],
                },
            });
        }
        if (data.action === 'confirmUpdateKeywords') {
            
            // await client.replyMessage(event.replyToken, {
            //     type: 'text',
            //     text: `Got it. Thanks for the feedback (reason: ${data.reason}).`,
            // });
        }
        if (data.action === 'reason') {
            console.log('data', data)
            // Log feedback with reason
            const embedding = await lookupEmbeddingForListing(data.listingId); // You should implement this
            addFeedback('not_interested', data.listingId, embedding, data.reason);

            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: `Got it. Thanks for the feedback (reason: ${data.reason}).`,
            });
        }
        if (data.action === 'feedback' && data.decision === 'interested') {
            const embedding = await lookupEmbeddingForListing(data.listingId); // You should implement this
            addFeedback('interested', data.listingId, embedding);

            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'Noted! You’re interested in this one.',
            });
        }
    }
}

mainProcess(keywords)
setInterval(function() {
     mainProcess(keywords)
   }, 5 * 60 * 1000);

app.listen(3500, () => {
    console.log('LINE webhook listening on port 3500');
});