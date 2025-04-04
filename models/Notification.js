const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // jisko notification dikhani hai
    refPath: "userType",
  },

  userType: {
    type: String,
    enum: ["farmer", "customer"],
    required: true,
  },

  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // jisne action liya (review, order)
    refPath: "actorType",
  },
  actorType: {
    type: String,
    enum: ["farmer", "customer"],
    required: true,
  },

  type: {
    type: String,
    enum: ["order", "review"],
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  read: {
    type: Boolean,
    default: false,
  },

  icon: {
    type: String,
    default: "bell",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
