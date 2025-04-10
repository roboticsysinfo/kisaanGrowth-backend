// models/PointTransaction.js

const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema({

  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },

  points: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["referral", "redeem", "daily_stay", "daily_share"],
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },


});

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
