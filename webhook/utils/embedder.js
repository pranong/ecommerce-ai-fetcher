const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

let model;
async function loadModel() {
  if (!model) {
    try {
      model = await pipeline('embeddings', 'Xenova/clip-vit-base-patch16');
    } catch (error) {
      console.log('error @ loadModel')
    }
  }
  return model;
}

let apiEndpoint= 'flask-api'
// let apiEndpoint= '127.0.0.1'

async function checkImageIsclothing(imagePaths, listing) {
  let response = false;
  let isClothingCount = 0
  try {
    if (imagePaths && imagePaths.length > 0) {
      let result = await checkClothingService(imagePaths[0], listing);
      response = result.is_clothing
    }
  } catch (error) {
    console.log('ERROR - checkImageIsclothing:', error)
  }
  return response;
}

async function checkClothingService(imagePath, listing) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('title', listing.title);
  try {
    const response = await axios.post('http://'+apiEndpoint+':5000/predict', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('ERROR - checkClothingService:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { checkImageIsclothing };
