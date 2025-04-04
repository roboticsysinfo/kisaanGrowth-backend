const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userType: {
      type: String,
      enum: ["Farmer", "Customer"],
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "review"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
  });
  
module.exports = mongoose.model("Notification", notificationSchema);
