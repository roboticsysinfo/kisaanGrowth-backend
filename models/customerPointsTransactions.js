const mongoose = require("mongoose");

const customerPointTransactionSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },

    points: {
        type: Number,
        required: true,
    },

    type: {
        type: String,
        enum: [
            "referral",
            "redeem",
            "daily_stay",
            "daily_share",
            "daily_login",
            "self_register",
            "new_product_added"
        ],
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },


});

module.exports = mongoose.model("CustomerPointsTransactions", customerPointTransactionSchema);
