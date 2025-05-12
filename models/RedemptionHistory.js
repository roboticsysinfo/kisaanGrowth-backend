const mongoose = require('mongoose');

const redemptionHistorySchema = new mongoose.Schema({


  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },

  redeemProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedeemProduct',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
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

module.exports = mongoose.model('RedemptionHistory', redemptionHistorySchema);
