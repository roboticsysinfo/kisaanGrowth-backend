const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Customer Schema
const customerSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  address: { type: String, required: true },
  state: { type: String, },
  city: { type: String, },
  profileImage: { type: String, default: 'https://avatar.iran.liara.run/public/boy' },

  // Refer and Earn
  referralCode: { type: String, unique: true },

  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },

  referralShares: {
    type: Number,
    default: 0
  },

  referralDownloads: {
    type: Number,
    default: 0
  },

  points: { type: Number, default: 0 },

  lastRewardDate: {
    type: Date,
  },

  lastReferralShareDate: {
    type: Date,
    default: null,
  },
  todayReferralShareCount: {
    type: Number,
    default: 0,
  },

  agreedToPrivacyPolicyAndTermsAndConditions: {
    type: Boolean,
    required: true
  },
  agreementTimestamp: {
    type: Date,
    required: true
  }

}, {
  timestamps: true
});

// Password Hashing before saving the Customer
customerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
customerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
