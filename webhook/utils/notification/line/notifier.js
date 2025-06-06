const { Client } = require('@line/bot-sdk');
require('dotenv').config();

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

async function sendNotification(listing, imageEmbeds) {
  const message = {
    type: 'template',
    altText: ('(' + listing.currency+ listing.price + ') ' + listing.title),
    template: {
      type: 'buttons',
      thumbnailImageUrl: listing.imageUrls[0], // Must be HTTPS
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
      title: (listing.currency + ' ' + listing.price + '-' + listing.title).slice(0, 40), // max 40 chars
      text: 'Tap below to view or give feedback.',
      actions: [
        {
          type: 'uri',
          label: 'View on eBay',
          uri: listing.url,
        },
        {
          type: 'postback',
          label: 'Interested',
          data: JSON.stringify({
            action: 'feedback',
            decision: 'interested',
            listingId: listing.id,
          }),
        },
        {
          type: 'postback',
          label: 'Not Interested',
          data: JSON.stringify({
            action: 'feedback',
            decision: 'not_interested',
            listingId: listing.id,
          }),
        },
      ],
    },
  };
  await client.broadcast(message);
}

module.exports = { sendNotification };
