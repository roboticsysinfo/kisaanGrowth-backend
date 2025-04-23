const Review = require('../models/Review');
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

// updateShopRating function (in helper/updateShopRating.js)

const updateShopRating = async (shopId) => {

  const reviews = await Review.find({ shop_id: shopId });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
    : 0;

  await Shop.findByIdAndUpdate(shopId, {
    averageRating: averageRating.toFixed(1),  // Update average rating with 1 decimal point
    totalReviews: totalReviews,
  });
  
};


module.exports = { updateShopRating };
