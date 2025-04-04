const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    // whom to get notification customer or farmer passing in triggered function
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
