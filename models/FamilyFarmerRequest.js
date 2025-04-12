const mongoose = require("mongoose");

const familyFarmerRequestSchema = new mongoose.Schema(
  {
    fromCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    toFarmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message : {
      type: String,
      default: "Hi, We need a Family Farmer. Are you Interested"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FamilyFarmerRequest", familyFarmerRequestSchema);
