const mongoose = require('mongoose');

const customerRedeemBillSchema = new mongoose.Schema({

  customer_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  redeemProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerRedeemProduct',
    required: true
  },

  orderId: {
    type: String,
    required: true
  },
  pdfPath: {
    type: String,
  },
  productName: {
    type: String,
    required: true
  },

  priceValue: {
    type: Number,
    required: true
  },

  gstAmount: {
    type: Number,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  billGeneratedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


module.exports = mongoose.model('CustomerRedeemBill', customerRedeemBillSchema);
