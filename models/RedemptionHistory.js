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
  redeemedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('RedemptionHistory', redemptionHistorySchema);
