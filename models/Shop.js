const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the Users collection
      required: true,
    },
    shop_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Optional, set a character limit for shop names
    },
    shop_description: {
      type: String,
      trim: true,
      maxlength: 500, // Optional, set a character limit for shop descriptions
    },
    shop_image: {
      type: String, // Optional: store a URL or file path to the shop's image
    },
    shop_location: {
      type: String, // Optional: include the location of the shop
    },
    pricing_preference: {
      type: String,
      enum: ["fixed_price", "negotiation_price"]
    },
    preferred_buyers: {
      type: String,
      enum: ["retail_customers", "wholesalers", "restaurants", "hotels"]
    }

  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
