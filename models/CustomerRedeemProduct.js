const customerRedeemProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requiredPoints: {
    type: Number,
    required: true
  },
  rc_product_img: {
    type: String,
  },
  price_value: {
    type: Number,
    required: true
  }
}, { timestamps: true });
