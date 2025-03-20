const mongoose = require("mongoose");

const requestOrderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  phoneNumber:{
     type: Number,
     required: true,
  },
  quantity_requested: {
    type: String,
    required: true,
    min: 1, // Minimum quantity should be 1
  },
  unit: {
    type: String,
    enum: ["kg", "liters", "tons", "pieces"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "cancelled", "completed"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },

},
{
    timestamps: true
}

);

module.exports = mongoose.model("RequestOrder", requestOrderSchema);
