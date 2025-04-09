const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid"); // Use UUID for unique registration numbers

// Farmer Schema
const farmerSchema = new mongoose.Schema(

  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    address: { type: String, required: true },
    isKYCVerified: { type: Boolean, default: false },
    aadharCard: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v); // Ensures Aadhar is exactly 12 digits
        },
        message: "Aadhar card must be a 12-digit number",
      },
    },
    uploadAadharCard: {
      type: String,
      required: true
    },
    registrationNumber: { type: String, unique: true }, // Auto-generated
    kycRequested: { type: Boolean, default: false }, // For KYC requests

    // Refer and Earn
    referralCode: { type: String, unique: true },

    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", default: null },

    points: { type: Number, default: 0 },

    lastRewardDate: {
      type: Date,
    }

  },

  { timestamps: true }

);

// Auto-generate Registration Number
farmerSchema.pre("save", async function (next) {
  if (!this.registrationNumber) {
    const timestampPart = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const uuidPart = uuidv4().slice(0, 6).toUpperCase(); // First 6 characters of UUID
    this.registrationNumber = `KG-${timestampPart}${uuidPart}`;
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Compare Password
farmerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Farmer = mongoose.model("Farmer", farmerSchema);

module.exports = Farmer;
