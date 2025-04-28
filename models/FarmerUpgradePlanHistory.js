const mongoose = require('mongoose');

const farmerPlanHistorySchema = new mongoose.Schema({
    
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  planName: {
    type: String, // Example: 'Gold Plan', 'Silver Plan'
    required: true,
  },
  planAmount: {
    type: Number, // Kitne paise diye plan ke liye
    required: true,
  },
  planValidityDays: {
    type: Number, // Example: 30 days, 60 days
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date, // PurchasedAt + ValidityDays
  }
});

module.exports = mongoose.model('FarmerUpgradePlanHistory', farmerPlanHistorySchema);
