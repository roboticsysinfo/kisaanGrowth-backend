const mongoose = require('mongoose');

const customerRedeemptionHistorySchema = new mongoose.Schema({


  customer_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  
  redeemProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerRedeemProduct',
    required: true
  },


  pointsDeducted: {
    type: Number,
    required: true
  },


  redeemedAt: {
    type: Date,
    default: Date.now
  }


}, { timestamps: true });

module.exports = mongoose.model('CustomerRedemptionHistory', customerRedeemptionHistorySchema);
