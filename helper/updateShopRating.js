const Review = require('../models/Review');
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

const updateShopRating = async (shopId) => {
  
  try {
    const stats = await Review.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: '$shop_id',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        }
      }
    ]);

    const { averageRating = 0, totalReviews = 0 } = stats[0] || {};

    await Shop.findByIdAndUpdate(shopId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error("Error in updateShopRating:", error.message);
    throw new Error("Error updating shop rating");
  }
};

module.exports = { updateShopRating };
