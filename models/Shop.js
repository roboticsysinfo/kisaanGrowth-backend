const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer', // Reference to the Users collection
    },
    shop_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Optional, set a character limit for shop names
    },
    phoneNumber: {
      type: Number,
      required: true
    },
    whatsappNumber:{
      type: Number,
      required: true
    },
    city_district: {
       type: String,
       required: true
    },
    state: {
      type: String,
      required: true
    },
    village_name: {
      type: String,
    },
    shop_address: {
      type: String,
      required: true
    },

    shop_description: {
      type: String,
      trim: true,
      maxlength: 500, // Optional, set a character limit for shop descriptions
    },
    shop_image: {
      type: [String], // Optional: store a URL or file path to the shop's image
    },
    shop_cover_image: {
      type: String
    },
    shop_profile_image: {
      type: String
    },

    pricing_preference: {
      type: String,
      enum: ["fixed_price", "negotiation_price"]
    },
    preferred_buyers: {
      type: String,
      enum: ["retail_customers", "wholesalers", "restaurants", "hotels"]
    },

  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
