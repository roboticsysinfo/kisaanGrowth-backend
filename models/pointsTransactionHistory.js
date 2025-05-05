const pointTransactionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
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
      "shop_review",
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
