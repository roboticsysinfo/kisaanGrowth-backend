const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Reference to the Orders collection
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Products collection
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Ensure at least one item is ordered
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensure price cannot be negative
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
