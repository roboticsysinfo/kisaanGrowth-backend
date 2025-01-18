const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cusomter', // Reference to the farmer in the Users collection
      required: true,
    },
    bank_name: {
      type: String,
      maxlength: 100, // Optional: Limit the length of the bank name
      required: true,
    },
    account_number: {
      type: String,
      maxlength: 50, // Optional: Limit the length of the account number
      required: true,
    },
    ifsc_code: {
      type: String,
      maxlength: 20, // Optional: Limit the length of the IFSC code
      required: true,
    },
    upi_id: {
      type: String,
      maxlength: 50, // Optional: Limit the length of the UPI ID
    },
    wallet_balance: {
      type: Number,
      default: 0, // Default wallet balance is 0
      min: 0, // Prevent negative balances
    },
  },
  {
    timestamps: {
      createdAt: false, // Disable `createdAt` since only `updatedAt` is required
      updatedAt: true, // Enable `updatedAt` to track the last modification
    },
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
