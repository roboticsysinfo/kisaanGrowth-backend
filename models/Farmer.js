const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: {type: Number, required: true},
    profile_photo: { type: String},
    registration_date: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
