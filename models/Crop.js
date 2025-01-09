const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the farmer in the Users collection
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop', // Reference to the Shops collection
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Optional, set a character limit for product names
    },
    season: {
      type: String,
      maxlength: 50, // Optional, limit for crop availability season
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to the Categories collection
    },
    price_per_unit: {
      type: Number,
      required: true,
      min: 0, // Ensure price cannot be negative
    },
    quantity_available: {
      type: Number,
      required: true,
      min: 0, // Ensure quantity cannot be negative
    },
    unit: {
      type: String,
      enum: ['kg', 'liters', 'tons', 'pieces'], // Adjust units based on your requirements
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000, // Optional, limit for additional crop/product info
    },
    harvest_date: {
      type: Date, // Optional: capture harvest date for crops
    },
    image_url: {
      type: String, // URL to the product/crop image
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Crop = mongoose.model('Crop', productSchema);

module.exports = Crop;