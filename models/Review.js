const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop', // Reference to the Products collection
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', // Reference to the Users collection
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating
      max: 5, // Maximum rating
    },
    comment: {
      type: String,
      maxlength: 500, // Optional: limit the length of comments
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }

);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
