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
            "new_product_added",
            "family_farmer",
            "points_upgrade"
        ],
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    paymentId: {
        type: String,
        default: null,
    },
    paymentStatus: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "success",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model("CustomerPointsTransactions", customerPointTransactionSchema);
