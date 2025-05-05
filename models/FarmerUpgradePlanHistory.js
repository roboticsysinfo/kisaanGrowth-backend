const mongoose = require('mongoose');

const farmerPlanHistorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  planAmount: {
    type: Number,
    required: true,
  },
  planValidityDays: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },

  // 🆕 Razorpay Payment Fields
  paymentId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    required: true,
  },
});

module.exports = mongoose.model('FarmerUpgradePlanHistory', farmerPlanHistorySchema);
