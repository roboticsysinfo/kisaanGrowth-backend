const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerShop', // Reference to the Shops collection
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Optional, character limit for product name
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to the Categories collection
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensure price cannot be negative
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Ensure quantity cannot be negative
    },
    unit: {
      type: String,
      enum: ['kg', 'liters', 'grams', 'pieces'], // Adjust based on required units
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000, // Optional, limit the length of the description
    },
    harvest_date: {
      type: Date, // Stores the date when the product was harvested
      required: true,
    },
    product_image: {
      type: String, // URL to the product image
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
