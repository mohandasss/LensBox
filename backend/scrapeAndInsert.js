const mongoose = require('mongoose');
const Product = require('./Models/Products');
const connectDB = require('./Config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const { uploadImageFromUrl } = require('./utils/cloudinary');

async function scrapeAndInsert() {
  await connectDB();

  const sellerId = '507f1f77bcf86cd799439012';
  const cameraCategoryId = '507f1f77bcf86cd799439011';

  const { data } = await axios.get('https://www.cameraworld.co.uk/catalogsearch/result/?q=canon');
  const $ = cheerio.load(data);

  const productCards = $('.product-item').toArray();

  for (const el of productCards) {
    const name = $(el).find('.product-item-link').text().trim();

    // Extract price from either .special-price or fallback to .price
    let priceText = $(el).find('.special-price').text().trim();
    if (!priceText) {
      priceText = $(el).find('.price').text().trim(); // fallback selector
    }
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    // Extract image URL
    const imageUrl = $(el).find('.product-image-photo').attr('src');

    // Validation
    if (!name || isNaN(price) || !imageUrl) {
      console.warn('⚠️ Skipping due to missing info:', { name, price, imageUrl });
      continue;
    }

    try {
      const image = await uploadImageFromUrl(imageUrl);

      const product = new Product({
        name,
        price,
        description: 'High-quality camera gadget',
        features: ['HD', 'Lightweight', 'Battery Efficient'],
        image: [image],
        category: cameraCategoryId,
        seller: sellerId,
        stock: 10,
      });

      await product.save();
      console.log(`✅ Saved: ${name}`);
    } catch (err) {
      console.error(`❌ Failed to save ${name}:`, err.message);
    }
  }

  mongoose.disconnect();
}

scrapeAndInsert();
