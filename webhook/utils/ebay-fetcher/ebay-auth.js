const EbayAuthToken = require('ebay-oauth-nodejs-client');

let ebayAuthToken = new EbayAuthToken({
    filePath: './utils/ebay-fetcher/config.json'
});

async function getEbayAccessToken() {
  try {
    const token = await ebayAuthToken.getApplicationToken('PRODUCTION', 'https://api.ebay.com/oauth/api_scope');
    return JSON.parse(token).access_token
  } catch (error) {
    console.log('error=>', error, ebayAuthToken)
    throw new Error('Failed to get eBay token: ' + error);
  }
  
}

module.exports = { getEbayAccessToken };