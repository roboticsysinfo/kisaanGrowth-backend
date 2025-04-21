const { default: mongoose } = require("mongoose");

const customerRedeemProductSchema = new mongoose.Schema({

    name: {
      type: String,
      required: true
    },

    description: {
        type: String,
        required: true
    },

    requiredPoints: {
        type: Number,
        required: true
    },
    
    rc_product_img: {
        type: String,
    }

  }, { timestamps: true });
  
  module.exports = mongoose.model('CustomerRedeemProduct', customerRedeemProductSchema);