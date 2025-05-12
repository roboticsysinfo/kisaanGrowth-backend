const { default: mongoose } = require("mongoose");

const redeemProductSchema = new mongoose.Schema({

    name: {
      type: String,
      required: true
    },

    description: {
        type: String,
        required: true
    },
    price_value: {
        type: Number,
        required: true
    },
    requiredPoints: {
        type: Number,
        required: true
    },
    
    r_product_img: {
        type: String,
    }

  }, { timestamps: true });
  
  module.exports = mongoose.model('RedeemProduct', redeemProductSchema);