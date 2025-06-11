const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Replace with your real user or group chat ID
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let keywords = '(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub)'

bot.on('message', (msg) => {
    console.log('Your Chat ID:', msg);
    const setKeywordsPattern = /^\/setKeywords \((.*)\)$/;
    if (msg.text == '/keywords') {
        bot.sendMessage(CHAT_ID, `Current keywords:\n${keywords}`);
    } else if (msg.text == '/resetkeywords') {
        let newKeywords = '(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub)'
        keywords = newKeywords
        bot.sendMessage(CHAT_ID, `Updated keywords to:\n${newKeywords}`);
    } else if (setKeywordsPattern.test(msg.text)) {
        const parts = msg.text.split(' ');
        const result = parts.slice(1).join(' ');
        const match = result.match(/^\(((?:[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*)(?:,(?:[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*))*?)\)$/);
        if (match) {
            keywords = result
            bot.sendMessage(CHAT_ID, `Updated keywords to:\n${result}`);
        } else {

        }
    }
});


bot.onText(/\/setKeywords (.+)/, (msg, match) => {
    //   const chatId = msg.chat.id;
    console.log('setKeywords', msg)
    let newKeywords = match[1]
    keywords = newKeywords
    updateKeywords(newKeywords);
    bot.sendMessage(CHAT_ID, `Updated keywords to:\n${newKeywords}`);
});

function sendNotification(listing) {
    const { title, url, imageUrls, id } = listing;
    const imageUrl = imageUrls?.[0] || '';

    const caption = '*(' + listing.currency + listing.price + ')* ' + listing.title + `\n` + listing.type + ` [View Listing](${url})`;



    bot.sendPhoto(CHAT_ID, imageUrl, {
        caption,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '👍 Interested', callback_data: `interest_${id}` },
                    { text: '👎 Not Interested', callback_data: `no_interest_${id}` },
                ],
            ],
        },
    });
}

function getKeywords() {
    return keywords
}

// Handle button clicks
// bot.on('callback_query', async (query) => {
//   const chatId = query.message.chat.id;
//   const data = query.data;

//   if (data.startsWith('interest_')) {
//     const listingId = data.split('_')[1];
//     await axios.post('http://localhost:3000/feedback', {
//       listingId,
//       interested: true,
//     });
//     bot.answerCallbackQuery({ callback_query_id: query.id, text: 'Thanks for your interest!' });
//   } else if (data.startsWith('no_interest_')) {
//     const listingId = data.split('_')[2];
//     await axios.post('http://localhost:3000/feedback', {
//       listingId,
//       interested: false,
//     });
//     bot.answerCallbackQuery({ callback_query_id: query.id, text: 'Got it! Thanks for the feedback.' });
//   }
// });

module.exports = {
    sendNotification,
    getKeywords,
};
