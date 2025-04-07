const Review = require('../models/Review');
const Shop = require('../models/Shop');
const mongoose = require('mongoose');

const updateShopRating = async (shopId) => {
  const stats = await Review.aggregate([
    { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
    {
      $group: {
        _id: '$shop_id',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const { averageRating = 0, totalReviews = 0 } = stats[0] || {};

  await Shop.findByIdAndUpdate(shopId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews
  });
};

module.exports={ updateShopRating }
