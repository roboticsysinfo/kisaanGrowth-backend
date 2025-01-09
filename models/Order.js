const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the Users collection
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0, // Ensure total price cannot be negative
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'], // Restricts values to these options
      default: 'Pending',
    },
    order_status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], // Restricts values to these options
      default: 'Processing',
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
