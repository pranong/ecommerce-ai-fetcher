const axios = require('axios');
const { getEbayAccessToken } = require('./ebay-auth');

const EBAY_BROWSE_API = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

async function fetchEbayListings(keyword, excludesList, limit = 100) {
  const token = await getEbayAccessToken();

  try {
    
    const response = await axios.get(EBAY_BROWSE_API, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        // 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
      params: {
        q: keyword,
        filter: 'personalize:No,buyingOptions:{FIXED_PRICE|AUCTION|BEST_OFFER}',
        limit,
        sort: 'newlyListed'
      },
    });
    const data = response.data;
    // console.log(typeof response, 'response', response.data)
    // console.log('browse success', keyword)

    const upperExcludes = excludesList.map(k => k.toUpperCase());
    console.log('Excludes', upperExcludes)
    console.log('listing size', data.itemSummaries.length)
    const listings = (data.itemSummaries || []).filter(x => (
        !x.itemGroupType ||
        (x.itemGroupType && x.itemGroupType !== 'SELLER_DEFINED_VARIATIONS')
      ) && (
        !upperExcludes.some(exclude => x.title.toUpperCase().includes(exclude))
      )).map(item => {
      // console.log('item', item)
        return ({
        id: item.itemId,
        title: item.title,
        url: item.itemWebUrl,
        type: item.buyingOptions.find(x => x == 'AUCTION') ? 'AUCTION' : '',
        imageUrls: item.additionalImages ? (item.image && item.image.imageUrl ? ([item.image.imageUrl].concat(item.additionalImages.map(x => x.imageUrl))) : (item.additionalImages)) : item.image && item.image.imageUrl ? [item.image.imageUrl] : [],
        price: item.price ? item.price.value : item.currentBidPrice ? item.currentBidPrice.value : 'price:null',
        categories: item.categories,
        currency: item.price ? item.price.currency : item.currentBidPrice ? item.currentBidPrice.currency : 'currency:null'
      })
    });
    console.log('listings filtered size', listings.length)
    return listings;
  } catch (error) {
    throw new Error(`eBay API error: ${error.response?.status} ${error.response?.statusText || error.message}`);
  }
}

module.exports = { fetchEbayListings };
