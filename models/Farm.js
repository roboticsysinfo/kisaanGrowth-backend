const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming the farmer is linked to the Users table
      required: true,
    },
    farm_address: {
      type: String,
      required: true,
      maxlength: 500, // Optional: Limit the length of the address
    },
    district: {type: String, required: true},
    village: {type: String},
    land_size: {
      type: Number,
      required: true,
      min: 0, // Ensure land size cannot be negative
    },
    farming_type: {
      type: String,
      enum: ['organic', 'conventional'], // Restrict values to organic or conventional
      required: true,
    },
    certification_name: {
      type: String, // Store certifications or memberships as text
      maxlength: 1000, // Optional: Limit the text length
    },
    certification_image:{
      type: String,
      default: "https://placehold.co/100x100"
    },
    description:{
      type: String,
      maxlength: 1000
    },
    farm_photos: {
      type: [String], // Store an array of file paths or URLs for farm photos
      default: "https://placehold.co/100x100"
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
