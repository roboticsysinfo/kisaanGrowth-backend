const mongoose = require("mongoose");

const adminMessageSchema = new mongoose.Schema({

  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model("AdminMessage", adminMessageSchema);
