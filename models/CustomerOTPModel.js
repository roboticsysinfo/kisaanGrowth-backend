// models/OtpModel.js
const mongoose = require("mongoose");


const customerOtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 }, // Auto delete after 1 minute
});


module.exports = mongoose.model("CustomerOTPModel", customerOtpSchema);
