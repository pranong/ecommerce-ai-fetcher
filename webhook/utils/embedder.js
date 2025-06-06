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

async function getEmbeddingFromPython(imageUrl) {
  try {
    console.log('imageUrl', imageUrl)
    const response = await axios.post('http://'+apiEndpoint+':5000/embed', { imageUrl: imageUrl });
    console.log('getEmbeddingFromPython response', response.data)
    return response.data.embedding; // Array of floats
  } catch (error) {
    console.error('Error calling CLIP service:', error.response?.data || error.message);
    return null;
  }
}

async function sendImageForEmbedding(imagePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    const response = await axios.post('http://'+apiEndpoint+':5000/embed', form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    // console.log('Embedding:', response.data.embedding);
    return response.data;
  } catch (error) {
    console.error('Error sending image:', error.response?.data || error.message);
    throw error;
  }
}

async function sendCheckIsImageIsClothing(imagePath, listing) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    const response = await axios.post('http://'+apiEndpoint+':5000/check-tshirt', form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // const response = await axios.post('http://'+apiEndpoint+':5000/check-tshirt', { imagePath, listing });

    // console.log('check-tshirt:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending image:', error.response?.data || error.message);
    throw error;
  }
}

async function generateEmbeddings(imagePaths) {
  const embeddings = [];
  try {
    // const model = await loadModel();
    for (const imagePath of imagePaths) {
      const result = await sendImageForEmbedding(imagePath);
      // console.log('result')
      embeddings.push(result.embedding); // result = { embedding: [...] }
    }
  } catch (error) {
    console.log('error', error)
  }
  return embeddings;
}

async function checkImageIsclothing(imagePaths, listing) {
  let response = false;
  let isClothingCount = 0
  try {
    // const model = await loadModel();
    console.log('listing',listing)
    for (const imagePath of imagePaths) {
      let result = await sendCheckIsImageIsClothing(imagePath, listing);
      // console.log('result.data', result.data)
      for (let i = 0; i < result.data.length; i++) {
        const element = result.data[i];
        if (element.label === 'a photo of a t-shirt' && element.probability >= 0.90) {
          response = true
        }
      }
    }
    
      console.log('isClothing?>>>>>>>', response)
  } catch (error) {
    console.log('error', error)
  }
  return response;
}

module.exports = { generateEmbeddings, checkImageIsclothing };
