const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const keywordsFilePath = './keywords.txt';
const excludesFilePath = './excludes.txt';

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// let keywords = '(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub)'

bot.on('message', (msg) => {
    console.log('Your Chat ID:', msg);
    const setKeywordsPattern = /^\/setKeywords \((.*)\)$/;
    const setExcludesPattern = /^\/setExcludes \((.*)\)$/;
    if (msg.text == '/keywords') {
        let keywords = fs.readFileSync(excludesFilePath, 'utf-8');
        bot.sendMessage(CHAT_ID, `Current excludes:\n${keywords}`);
    } else if (msg.text == '/excludes') {
        let keywords = fs.readFileSync(excludesFilePath, 'utf-8');
        bot.sendMessage(CHAT_ID, `Current keywords:\n${keywords}`);
    } else if (msg.text == '/resetkeywords') {
        let newKeywords = '(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub)'
        fs.writeFileSync(keywordsFilePath, newKeywords);
        bot.sendMessage(CHAT_ID, `Updated keywords to:\n${newKeywords}`);
    } else if (setKeywordsPattern.test(msg.text)) {
        const parts = msg.text.split(' ');
        const result = parts.slice(1).join(' ');
        const match = result.match(/^\(((?:[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*)(?:,(?:[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*))*?)\)$/);
        if (match) {
            // keywords = result
            fs.writeFileSync(keywordsFilePath, result);
            bot.sendMessage(CHAT_ID, `Updated keywords to:\n${result}`);
        } else {

        }
    } else if (setExcludesPattern.test(msg.text)) {
        const parts = msg.text.split(' ');
        const result = parts.slice(1).join(' ');
        const match = isValidJSON(result)
        if (match) {
            // keywords = result
            fs.writeFileSync(excludesFilePath, result);
            bot.sendMessage(CHAT_ID, `Updated excludes to:\n${result}`);
        } else {

        }
    }
});

function isValidJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

function sendNotification(listing) {
    const { title, url, imageUrls, id } = listing;
    const imageUrl = imageUrls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png';
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
    let keywords = fs.readFileSync(keywordsFilePath, 'utf-8');
    console.log('Keyword on file:', keywords);
    return keywords
}

function getExcludes() {
    let keywords = fs.readFileSync(keywordsFilePath, 'utf-8');
    let keywordsArray
    try {
        keywordsArray = JSON.parse(keywords)
    } catch (error) {
        return []
    }
    return keywordsArray
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
    getExcludes
};
